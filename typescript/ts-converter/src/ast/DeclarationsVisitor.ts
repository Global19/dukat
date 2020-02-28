import * as ts from "typescript";

function isTopLevel(node: ts.Node): boolean {
  let res = false;

  if (ts.isClassDeclaration(node)) {
    res = true;
  }

  if (ts.isClassExpression(node)) {
    res = true;
  }

  if (ts.isEnumDeclaration(node)) {
    res = true;
  }

  if (ts.isInterfaceDeclaration(node)) {
    res = true;
  }

  if (ts.isModuleDeclaration(node)) {
    res = true;
  }

  if (ts.isTypeAliasDeclaration(node)) {
    res = true;
  }

  if (ts.isJSDocTypedefTag(node)) {
    res = true;
  }

  if (ts.isJSDocCallbackTag(node)) {
    res = true;
  }

  if (ts.isArrowFunction(node) || ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
    res = isTopLevelFunction(node);
  }

  return res;
}

function isTopLevelFunction(node: ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression): boolean {
  let parent = node.parent;
  if (ts.isSourceFile(parent) || ts.isModuleDeclaration(parent)) {
    return true;
  }

  return false;
}

export abstract class DeclarationsVisitor {

  private processed = new Set<ts.Node>();
  private declarations = new Map<ts.SourceFile, Set<ts.Node>>();

  private skipTypes = new Set([
    "Array",
    "Date",
    "Boolean",
    "Error",
    "Event",
    "Function",
    "Number",
    "RegExp",
    "ReadonlyArray",
    "String"
  ]);

  constructor(
    private typeChecker: ts.TypeChecker
  ) {
  }

  private registerDeclaration(declaration) {
    if (this.processed.has(declaration)) {
      return;
    }

    if (isTopLevel(declaration)) {
      const rootNode = declaration.getSourceFile();

      if (!this.declarations.has(rootNode)) {
        this.declarations.set(rootNode, new Set());
      }

      this.declarations.get(rootNode)!.add(declaration);
    }

    if (!ts.isSourceFile(declaration.parent)) {
      this.registerDeclaration(declaration.parent);
    }

    this.processed.add(declaration);
    this.visit(declaration);
  }

  private checkReferences(node: ts.Node) {
    if (this.isLibDeclaration(node)) {
      if (this.skipTypes.has(node.name)) {
        return;
      }
    }

    let symbol = this.typeChecker.getTypeAtLocation(node).symbol;
    if (!symbol) {
      let symbolAtLocation = this.typeChecker.getSymbolAtLocation(node.typeName);
      if (symbolAtLocation) {
        let declaredType = this.typeChecker.getDeclaredTypeOfSymbol(symbolAtLocation);
        if (declaredType) {
          symbol = declaredType.symbol || declaredType.aliasSymbol;
        }
      }
    }

    if (symbol && Array.isArray(symbol.declarations)) {
      for (let declaration of symbol.declarations) {
        if (this.isTransientDependency(declaration)) {
            this.registerDeclaration(declaration);
        }
      }
    }
  }

  visit(declaration: ts.Node) {
    if (ts.isTypeReferenceNode(declaration)) {
      if (!this.skipTypes.has(declaration.typeName.getText())) {

        let symbolAtLocation = this.typeChecker.getSymbolAtLocation(declaration.typeName);
        let typeOfSymbol = this.typeChecker.getDeclaredTypeOfSymbol(symbolAtLocation);
        console.log(`SYMBOL ${declaration.getText()} :: ${symbolAtLocation.parent} :: ${typeOfSymbol.symbol}`);

        this.checkReferences(declaration);
      }
    } else if (ts.isInterfaceDeclaration(declaration)) {
      this.checkReferences(declaration);
    } else if (ts.isVariableDeclaration(declaration)) {
        this.checkReferences(declaration);
    } else if (ts.isFunctionDeclaration(declaration)) {
        this.checkReferences(declaration);
    } else if (ts.isTypeAliasDeclaration(declaration)) {
      this.checkReferences(declaration.type)
    } else if (ts.isHeritageClause(declaration)) {
      for (let type of declaration.types) {
        this.checkReferences(type);
      }
    }
    ts.forEachChild(declaration, node => this.visit(node));
  }

  public forEachDeclaration(callback: (value: Set<ts.Node>, key: string) => void) {
    this.declarations.forEach(callback);
  }

  abstract isTransientDependency(node: ts.Node): boolean;
  abstract isLibDeclaration(source: ts.Node): boolean;

}
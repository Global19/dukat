package org.jetbrains.dukat.ast

import org.jetbrains.dukat.ast.model.Declaration
import org.jetbrains.dukat.ast.model.Expression
import org.jetbrains.dukat.ast.model.MemberDeclaration
import org.jetbrains.dukat.ast.model.ParameterDeclaration
import org.jetbrains.dukat.ast.model.ParameterValue
import org.jetbrains.dukat.ast.model.TypeDeclaration
import org.jetbrains.dukat.ast.model.TypeParameter

interface AstNodeFactory<T> {
    fun createClassDeclaration(name: String, members: List<MemberDeclaration>, typeParameters: List<TypeParameter>): T
    fun createInterfaceDeclaration(name: String, members: List<MemberDeclaration>, typeParameters: List<TypeParameter>): T
    fun createExpression(kind: TypeDeclaration, meta: String?): T
    fun declareVariable(name: String, type: ParameterValue): T
    fun createFunctionDeclaration(
            name: String, parameters:
            Array<ParameterDeclaration>,
            type: ParameterValue,
            typeParameters: Array<TypeParameter>
    ): T


    fun createMethodDeclaration(
            name: String, parameters:
            List<ParameterDeclaration>,
            type: ParameterValue,
            typeParameters: List<TypeParameter>,
            operator: Boolean
    ): T

    fun createFunctionTypeDeclaration(parameters: Array<ParameterDeclaration>, type: ParameterValue): T
    fun createParameterDeclaration(name: String, type: ParameterValue, initializer: Expression?): T
    fun createTypeDeclaration(value: String, params: Array<ParameterValue>): T
    fun createDocumentRoot(declarations: Array<Declaration>): T
    fun createTypeParam(name: String, constraints: Array<ParameterValue>): T
}
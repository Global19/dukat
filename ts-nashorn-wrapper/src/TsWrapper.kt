import org.jetbrains.dukat.ast.FileResolver
import java.io.File
import java.io.FileReader
import java.util.ArrayList
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.Invocable


interface SomeStrangeSet<T> {
    fun has(value: T): Boolean;
}

fun main() {
    val engineManager = ScriptEngineManager()
    var engine = engineManager.getEngineByName("nashorn")
    engine.eval("var global = this;")
    engine.eval(FileReader("./ts/build/ts/jvm/Set.js"));
    engine.eval(FileReader("./ts/node_modules/requirejs/require.js"));
    engine.eval(FileReader("./ts/node_modules/typescript/lib/tsserverlibrary.js"))
    engine.eval(FileReader("./ts/build/ts/converter.js"));

    val invocable = engine as Invocable
    invocable.invokeFunction("main", FileResolver())
}
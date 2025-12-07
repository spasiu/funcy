# 🚀 Funcy Language Server - Quick Start Guide

Your Funcy language server and VS Code extension are ready to use!

## ✅ What's Been Created

### Language Server (`language-server/`)
- **Full LSP implementation** with diagnostics, completion, and hover
- Integrates with your existing Funcy lexer and parser
- Provides real-time error checking

### VS Code Extension (`vscode-extension/`)
- **Syntax highlighting** via TextMate grammar
- **Language configuration** for auto-closing brackets, comments
- **Client-server architecture** connecting to the language server

### Test Files
- `test-extension-demo.fu` - Clean example for testing
- `test-lsp-simple.fu` - Simple test without comments
- `test-lsp.fu` - Comprehensive feature test

## 🎯 Testing the Extension (2 Minutes)

### Step 1: Open VS Code
```bash
cd /Users/anastasi/funcy/vscode-extension
code .
```

### Step 2: Launch Extension Development Host
1. Press **F5** (or Run > Start Debugging)
2. A new VS Code window opens with the extension loaded
3. You'll see "Extension Development Host" in the title

### Step 3: Open a Test File
In the Extension Development Host window:
1. File > Open Folder > Select `/Users/anastasi/funcy`
2. Open `test-extension-demo.fu`

### Step 4: See It In Action! 🎉

**Syntax Highlighting** ✨
- `@` symbols are highlighted as keywords
- Strings are colored
- Type annotations (`:int`, `:string`) are highlighted
- Function arrows `=>` stand out

**Autocomplete** 💡
Try typing these:
- `@` → See variable/function declaration suggestions
- `Array.` → See Array module methods (map, filter, reduce, etc.)
- `Map.` → See Map module methods (get, set, has, etc.)
- After a parameter name, type `:` → See type suggestions

**Hover Documentation** 📖
- Hover over `if` → See signature and description
- Hover over `Array` or `Map` → See module documentation
- Hover over built-in functions

**Error Detection** 🔍
Try these to see diagnostics:
- Remove a semicolon: `@x 42` → Warning about missing semicolon
- Use wrong arrow: `@y ==> 10;` → Error about invalid syntax

## 🎨 Features Showcase

### 1. Syntax Highlighting
Open `test-extension-demo.fu` and see:
- Keywords: `@`, `=>`, `if`
- Types: `int`, `string`
- Strings, numbers, arrays, maps
- Comments

### 2. Autocomplete Everywhere

**After typing `@`:**
```funcy
@|  ← cursor here shows declaration suggestions
```

**Module methods:**
```funcy
Array.|  ← shows map, filter, reduce, find, etc.
Map.|    ← shows get, set, has, keys, values
String.| ← shows slice, split, toLowerCase, etc.
IO.|     ← shows read_file, get, post, put, delete
```

**Type annotations:**
```funcy
@add x:|  ← shows int, string, bool, func, []
```

### 3. Built-in Function Reference

Hover over these for documentation:
- `if` - Conditional expression
- `log` - Log and return value
- `exists` - Check if not null
- `throw` - Throw error
- `capture` - Capture errors
- `length` - Get length
- `at` - Array access
- `append` - Append to array

### 4. Module Methods

**Array Module:**
- `Array.map(arr, fn)` - Map over array
- `Array.filter(arr, fn)` - Filter array
- `Array.reduce(arr, fn, initial)` - Reduce array

**Map Module:**
- `Map.get(map, key)` - Get value
- `Map.set(map, key, value)` - Set value
- `Map.keys(map)` - Get all keys

**String Module:**
- `String.slice(str, start, end)` - Slice string
- `String.split(str, separator)` - Split string
- `String.toLowerCase(str)` - Convert to lowercase

**IO Module:**
- `IO.read_file(path)` - Read file as UTF-8 string
- `IO.get(url, options)` - HTTP GET
- `IO.post(url, body, options)` - HTTP POST

## 🛠️ Development Workflow

### Rebuild After Changes

If you modify the language server:
```bash
cd /Users/anastasi/funcy/language-server
npm run build
# Then restart the Extension Development Host (Cmd+Shift+F5)
```

If you modify the extension:
```bash
cd /Users/anastasi/funcy/vscode-extension
npm run build
# Then restart the Extension Development Host (Cmd+Shift+F5)
```

If you modify the Funcy compiler:
```bash
cd /Users/anastasi/funcy
npm run build
cd language-server
npm run build
# Then restart the Extension Development Host
```

### Watch Mode (Auto-rebuild)

In separate terminals:
```bash
# Terminal 1: Watch language server
cd /Users/anastasi/funcy/language-server
npm run watch

# Terminal 2: Watch extension
cd /Users/anastasi/funcy/vscode-extension
npm run watch
```

## 📝 Try These Examples

### Example 1: Variable with Error
```funcy
@x 42    ← Missing semicolon warning!
```

### Example 2: Function with Autocomplete
```funcy
@add x:int, y:int => x + y;
         ↑ Type : and see suggestions
```

### Example 3: Array Operations
```funcy
@numbers [1, 2, 3, 4, 5];
@doubled Array.
              ↑ Dot triggers module method suggestions
```

### Example 4: Map Access
```funcy
@person [name: "Alice", age: 30];
@name Map.get(person, "name");
        ↑ Hover for documentation
```

## 🐛 Troubleshooting

### Extension doesn't activate?
- Make sure you opened a folder containing `.fu` files
- Check the Output panel (View > Output) and select "Funcy Language Server"

### Autocomplete not working?
- Make sure the file has `.fu` extension
- Try typing a trigger character: `@`, `.`, `:`

### Syntax highlighting looks wrong?
- Close and reopen the `.fu` file
- Restart the Extension Development Host (Cmd+Shift+F5)

### Language server errors?
- Check that `/Users/anastasi/funcy/dist` exists and has compiled files
- Rebuild: `cd /Users/anastasi/funcy && npm run build`
- Rebuild language server: `cd language-server && npm run build`

## 🎓 Next Steps

1. **Explore the code:**
   - `language-server/src/server.ts` - LSP implementation
   - `vscode-extension/syntaxes/funcy.tmLanguage.json` - Syntax highlighting rules
   - `vscode-extension/src/extension.ts` - Extension client

2. **Add more features:**
   - Go to definition
   - Find references
   - Code actions (quick fixes)
   - Formatting

3. **Package for distribution:**
   ```bash
   cd vscode-extension
   npm install -g vsce
   vsce package
   code --install-extension funcy-vscode-0.1.0.vsix
   ```

## 📚 Documentation

- **Full documentation:** `LANGUAGE_SERVER_README.md`
- **Language reference:** `LANGUAGE_REFERENCE.md`
- **Funcy README:** `README.md`

---

**You're all set!** Press F5 in VS Code and start exploring your Funcy language server. 🎉

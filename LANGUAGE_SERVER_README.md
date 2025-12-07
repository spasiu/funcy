# Funcy Language Server & VS Code Extension

A complete Language Server Protocol (LSP) implementation for the Funcy programming language, providing syntax highlighting, error detection, autocomplete, and hover documentation for VS Code.

## Features

### ✨ Syntax Highlighting
- Keywords: `@`, `#`, `$`, `%`, `&`, `*`, `=>`
- Control flow: `if`, `capture`, `throw`, `exists`
- Built-in functions: `log`, `length`, `at`, `append`
- Module methods: `Array.map`, `Map.get`, `String.slice`, `IO.get`
- Type annotations: `int`, `string`, `bool`, `func`, `[]`
- Comments, strings, and numbers

### 🔍 Error Detection
- Parse errors with line/column information
- Missing semicolon warnings
- Invalid syntax detection (e.g., `==>` instead of `=>`)
- Real-time diagnostics as you type

### 💡 Autocomplete
- Context-aware suggestions
- Trigger characters: `@`, `.`, `#`, `$`, `%`, `&`
- Built-in function signatures
- Module method completion (Array, Map, String, IO)
- Type annotation suggestions after `:`

### 📖 Hover Documentation
- Function signatures and descriptions
- Module documentation
- Inline help for all built-in functions

## Project Structure

```
funcy/
├── language-server/           # LSP server implementation
│   ├── src/
│   │   └── server.ts         # Main language server
│   ├── package.json
│   └── tsconfig.json
│
├── vscode-extension/          # VS Code extension
│   ├── src/
│   │   └── extension.ts      # Extension client
│   ├── syntaxes/
│   │   └── funcy.tmLanguage.json  # TextMate grammar
│   ├── language-configuration.json
│   ├── package.json
│   └── tsconfig.json
│
└── test-lsp.fu               # Test file for language features
```

## Installation & Setup

### 1. Install Dependencies

```bash
# Install Funcy compiler dependencies (if not already done)
cd /Users/anastasi/funcy
npm install

# Install language server dependencies
cd language-server
npm install

# Install VS Code extension dependencies
cd ../vscode-extension
npm install
```

### 2. Build Everything

```bash
# Build Funcy compiler
cd /Users/anastasi/funcy
npm run build

# Build language server
cd language-server
npm run build

# Build VS Code extension
cd ../vscode-extension
npm run build
```

### 3. Run the Extension

1. Open the `funcy` project folder in VS Code
2. Open the `vscode-extension` folder
3. Press `F5` to launch the Extension Development Host
4. A new VS Code window will open with the extension activated
5. Open any `.fu` file to see the language support in action!

## Testing the Extension

### Quick Test

Open `test-lsp.fu` or `test-lsp-simple.fu` in the Extension Development Host to see:

- **Syntax highlighting** for all Funcy constructs
- **Autocomplete**: Type `@` to see variable/function declaration suggestions
- **Module methods**: Type `Array.` to see method suggestions
- **Types**: Type `:` after a parameter to see type suggestions
- **Hover**: Hover over `if`, `log`, `Array`, etc. to see documentation
- **Errors**: Save the file to see diagnostic messages

### Testing Autocomplete

Type the following to see autocomplete suggestions:

```funcy
@                    # Shows declaration operators
Array.               # Shows Array module methods
Map.                 # Shows Map module methods
@add x:              # Shows type suggestions (int, string, bool, etc.)
```

### Testing Error Detection

Try adding invalid syntax:

```funcy
@x 42                # Warning: Missing semicolon
@y ==> 10;           # Error: Invalid arrow syntax
```

## Language Server Capabilities

### Implemented

- ✅ Text document synchronization
- ✅ Diagnostics (errors and warnings)
- ✅ Completion (autocomplete)
- ✅ Hover (documentation)
- ✅ Syntax highlighting via TextMate grammar

### Future Enhancements

- 🔄 Go to definition
- 🔄 Find references
- 🔄 Rename symbol
- 🔄 Document symbols (outline)
- 🔄 Code actions (quick fixes)
- 🔄 Formatting
- 🔄 Signature help

## API Reference

### Completion Categories

**Keywords & Operators**
- `@` - Variable/Function declaration
- `#` - Module export
- `$` - Await promise
- `%` - Subscribe to event
- `&` - Trigger event
- `*` - Self-reference (recursion)

**Built-in Functions**
- `if(condition, then, else)` - Conditional expression
- `log(value)` - Log and return value
- `exists(value)` - Check if not null
- `throw(error)` - Throw error
- `capture(fn, handler)` - Capture errors
- `length(arr|str)` - Get length
- `at(arr, index)` - Array access
- `append(arr, value)` - Append to array

**Array Module**
- `Array.map(arr, fn)`
- `Array.filter(arr, fn)`
- `Array.reduce(arr, fn, initial)`
- `Array.find(arr, predicate)`
- `Array.includes(arr, value)`

**Map Module**
- `Map.get(map, key)`
- `Map.set(map, key, value)`
- `Map.has(map, key)`
- `Map.keys(map)`
- `Map.values(map)`

**String Module**
- `String.length(str)`
- `String.slice(str, start, end)`
- `String.split(str, separator)`
- `String.toLowerCase(str)`
- `String.toUpperCase(str)`

**IO Module**
- `IO.read_file(path)` - Read file as UTF-8 string
- `IO.get(url, options)` - HTTP GET request
- `IO.post(url, body, options)` - HTTP POST request
- `IO.put(url, body, options)` - HTTP PUT request
- `IO.delete(url, options)` - HTTP DELETE request

**Types**
- `int` - Integer type
- `string` - String type
- `bool` - Boolean type
- `func` - Function type
- `[]` - Array type

## Debugging

### Language Server Logs

To see language server logs in VS Code:
1. View → Output
2. Select "Funcy Language Server" from dropdown

### Extension Development

To debug the extension:
1. Open `vscode-extension/src/extension.ts`
2. Set breakpoints
3. Press F5 to launch with debugger attached

### Language Server Development

To debug the language server:
1. Open `language-server/src/server.ts`
2. The server runs in debug mode when launched from F5
3. Attach debugger on port 6009

## Publishing the Extension

To package the extension for distribution:

```bash
cd vscode-extension
npm install -g vsce
vsce package
```

This creates a `.vsix` file that can be installed in VS Code:
```bash
code --install-extension funcy-vscode-0.1.0.vsix
```

## Contributing

The language server integrates with the existing Funcy compiler:
- Uses `Lexer` from `../dist/lexer.js` for tokenization
- Uses `Parser` from `../dist/parser.js` for AST generation
- Provides real-time feedback based on parsing results

To add new features:
1. Update `language-server/src/server.ts` for LSP capabilities
2. Update `vscode-extension/syntaxes/funcy.tmLanguage.json` for syntax highlighting
3. Rebuild both projects and test with F5

## License

MIT

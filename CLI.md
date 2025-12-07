# Funcy CLI Documentation

The Funcy command-line interface provides tools for compiling and running Funcy programs.

## Installation

After building the project:

```bash
npm run build
```

You can run the CLI with:

```bash
node dist/cli.js <command> [options]
```

Or install globally (future):

```bash
npm install -g
funcy <command> [options]
```

## Commands

### `funcy run <file.fu>`

Compiles and immediately executes a Funcy file.

**Usage:**
```bash
funcy run <file.fu>
```

**Description:**
- Compiles the .fu file to JavaScript
- Stores compiled output in a temporary directory
- Executes the compiled JavaScript
- Cleans up temporary files after execution

**Examples:**
```bash
funcy run examples/hello.fu
funcy run src/main.fu
funcy run tests/factorial.fu
```

**Output:**
```
Compiling examples/hello.fu...
✓ Compiled to /path/to/.temp/hello.js

--- Output ---
Hello, Funcy!
```

**Use Cases:**
- Quick testing during development
- Running scripts without keeping compiled output
- Educational examples and tutorials
- One-off script execution

---

### `funcy compile <file.fu> [output.js]`

Compiles a single Funcy file to JavaScript.

**Usage:**
```bash
funcy compile <file.fu> [output.js]
```

**Parameters:**
- `<file.fu>` - Input Funcy source file (required)
- `[output.js]` - Output JavaScript file (optional)

**Description:**
- Compiles a single .fu file to JavaScript
- If output path is not specified, creates a .js file in the same directory
- Preserves source directory structure when output is specified

**Examples:**
```bash
# Compile to same directory
funcy compile src/main.fu
# Creates: src/main.js

# Compile to specific output
funcy compile src/main.fu dist/main.js
# Creates: dist/main.js

# Compile with subdirectories
funcy compile src/utils/helpers.fu build/helpers.js
# Creates: build/helpers.js
```

**Output:**
```
Compiling src/main.fu...
✓ Compiled to dist/main.js
```

**Use Cases:**
- Building production code
- Compiling individual modules
- Integration with build tools
- Creating distributable JavaScript files

---

### `funcy compile <folder> [output.js]`

Compiles all Funcy files in a folder to a single JavaScript bundle.

**Usage:**
```bash
funcy compile <folder> [output.js]
```

**Parameters:**
- `<folder>` - Input folder containing .fu files (required)
- `[output.js]` - Output JavaScript bundle file (optional)

**Description:**
- Recursively finds all .fu files in the folder
- Compiles each file in sorted order
- Combines into a single JavaScript file
- Removes duplicate imports
- If output is not specified, creates bundle in the input folder

**Examples:**
```bash
# Bundle to folder with default name
funcy compile src/
# Creates: src/src.js

# Bundle to specific output
funcy compile src/ dist/bundle.js
# Creates: dist/bundle.js

# Bundle nested folders
funcy compile project/modules/ build/app.js
# Compiles all .fu files in modules/ and subdirectories
```

**Output:**
```
Found 5 Funcy file(s)
  [1/5] Compiling main.fu...
  [2/5] Compiling utils.fu...
  [3/5] Compiling helpers.fu...
  [4/5] Compiling config.fu...
  [5/5] Compiling types.fu...
✓ Compiled 5 file(s) to dist/bundle.js
```

**File Order:**
Files are compiled in alphabetical order. To control load order:
1. Use numeric prefixes (e.g., `01-config.fu`, `02-utils.fu`)
2. Use nested directories
3. Import dependencies explicitly

**Use Cases:**
- Building complete applications
- Creating single-file distributions
- Bundling libraries
- Simplifying deployment

---

### `funcy help`

Displays help information.

**Usage:**
```bash
funcy help
funcy --help
funcy -h
```

**Output:**
```
Funcy - A purely functional language compiler

Usage:
  funcy run <file.fu>              Compile and run a Funcy file
  funcy compile <file.fu> [out.js] Compile a Funcy file to JavaScript
  funcy compile <folder> [out.js]  Compile all .fu files in folder to single JS file

Examples:
  funcy run examples/hello.fu
  funcy compile src/main.fu dist/main.js
  funcy compile src/ dist/bundle.js
```

---

## Error Handling

### Compilation Errors

If a Funcy file has syntax errors:

```
Compiling src/main.fu...
Compilation error: Unexpected token SEMICOLON at line 5, column 10
Error: Unexpected token SEMICOLON at line 5, column 10
    at Parser.expect (...)
    ...
```

**Resolution:** Fix the syntax error in the source file.

### Runtime Errors

If a compiled program throws an error during `funcy run`:

```
Compiling examples/error.fu...
✓ Compiled to /path/to/.temp/error.js

--- Output ---
Error: Type validation failed for parameter 'x': expected int, got string
    at add (...)
    ...
```

**Resolution:** Fix the runtime error in your Funcy code.

### File Not Found

```
Error: File 'missing.fu' not found
```

**Resolution:** Check the file path is correct.

### No Funcy Files

When compiling a folder with no .fu files:

```
Error: No .fu files found in 'empty-folder/'
```

**Resolution:** Ensure the folder contains .fu files.

---

## Integration Examples

### NPM Scripts

Add Funcy commands to `package.json`:

```json
{
  "scripts": {
    "dev": "funcy run src/main.fu",
    "build": "funcy compile src/ dist/app.js",
    "compile": "funcy compile src/main.fu dist/main.js"
  }
}
```

### Makefile

```makefile
.PHONY: build run clean

build:
	funcy compile src/ dist/app.js

run:
	funcy run src/main.fu

clean:
	rm -rf dist/*.js
```

### Watch Mode (with nodemon)

```bash
nodemon --watch src --ext fu --exec "funcy run src/main.fu"
```

### CI/CD Pipeline

```yaml
# .github/workflows/build.yml
steps:
  - name: Build Funcy project
    run: |
      npm install
      npm run build
      funcy compile src/ dist/app.js
```

---

## Performance

### Compilation Speed

- Single file: ~10-50ms
- Small project (10 files): ~100-200ms
- Large project (100 files): ~1-2s

### Bundle Size

- Runtime overhead: ~2-3KB
- Per function overhead: ~50-100 bytes
- Type validation: +50-100 bytes per typed parameter

### Optimization Tips

1. **Minimize global scope**: Use functions to encapsulate logic
2. **Avoid circular dependencies**: Can cause undefined behavior in bundles
3. **Use type annotations sparingly**: Only where validation is needed
4. **Split large files**: Better for compilation and debugging

---

## Troubleshooting

### "Command not found: funcy"

**Issue:** The funcy command is not in PATH.

**Solution:** Use the full path:
```bash
node /path/to/funcy/dist/cli.js <command>
```

Or create an alias:
```bash
alias funcy="node /path/to/funcy/dist/cli.js"
```

### Temporary files not cleaned up

**Issue:** `.temp` folder contains orphaned JS files.

**Solution:** Manually clean:
```bash
rm -rf .temp/
```

This happens if `funcy run` is interrupted (Ctrl+C).

### Wrong order in bundle

**Issue:** Functions used before they're defined in bundle.

**Solution:** 
- Rename files with numeric prefixes for explicit ordering
- Or use separate compile commands for dependencies

---

## Advanced Usage

### Custom Runtime Path

Edit compiled JS to use custom runtime location:

```javascript
// Change this:
const { funcy } = require('../dist/runtime');

// To this:
const { funcy } = require('./my-custom-runtime');
```

### Preprocessing

Chain with other tools:

```bash
# Preprocess with envsubst, then compile
envsubst < template.fu > processed.fu && funcy compile processed.fu
```

### Multiple Outputs

Compile same source to different targets:

```bash
funcy compile src/main.fu dist/main.js
funcy compile src/main.fu dist/main.cjs
funcy compile src/main.fu dist/main.mjs
```

---

## Future Enhancements

Planned CLI features:

- [ ] `funcy watch` - Watch mode for automatic recompilation
- [ ] `funcy init` - Initialize new Funcy project
- [ ] `funcy format` - Code formatter
- [ ] `funcy lint` - Linter for style checking
- [ ] `funcy repl` - Interactive REPL
- [ ] `funcy test` - Test runner
- [ ] `funcy doc` - Documentation generator
- [ ] Configuration file support (`.funcyrc`)
- [ ] Source maps for debugging
- [ ] Minification option
- [ ] TypeScript declaration generation

---

## Summary

The Funcy CLI provides three main workflows:

1. **Development** → `funcy run` for quick testing
2. **Single file** → `funcy compile file.fu` for individual modules
3. **Project** → `funcy compile folder/` for complete applications

Choose the command that fits your workflow!

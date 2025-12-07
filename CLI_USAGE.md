# Funcy CLI Usage Guide

## Installation

### Local Installation (Current)
Already installed globally on your machine:
```bash
npm install -g .
```

The `funcy` command is now available from anywhere!

### For Others (After Publishing to npm)
```bash
npm install -g funcy
```

## Commands

### Compile a Single File
```bash
funcy compile <input.fu> [output.js]
```

**Examples:**
```bash
# Compile to default output (same name, .js extension)
funcy compile hello.fu
# Creates: hello.js

# Compile to specific output
funcy compile hello.fu dist/hello.js

# Compile with absolute paths
funcy compile /path/to/myfile.fu /path/to/output.js
```

### Compile and Run
```bash
funcy run <file.fu>
```

**Examples:**
```bash
funcy run examples/hello.fu
funcy run examples/factorial.fu
```

This compiles to a temporary file and executes it immediately.

### Compile an Entire Folder
```bash
funcy compile <folder> [output.js]
```

**Examples:**
```bash
# Compile all .fu files in a folder
funcy compile src/ dist/bundle.js

# Default output: <foldername>.js in the same folder
funcy compile src/
# Creates: src/src.js
```

This recursively finds all `.fu` files and combines them into a single JavaScript file.

### Show Help
```bash
funcy --help
funcy -h
```

## Current Location

The funcy binary is installed at:
```
/Users/anastasi/.nvm/versions/node/v22.16.0/bin/funcy
```

## Testing the Installation

Try these commands to verify everything works:

```bash
# Check version and location
which funcy

# Show help
funcy --help

# Compile an example
cd /Users/anastasi/funcy
funcy compile examples/hello.fu /tmp/test.js

# Run an example
funcy run examples/factorial.fu
```

## Output Format

Compiled JavaScript includes:
- Runtime imports (`funcy` runtime library)
- Built-in module imports (Array, Map, String, IO)
- Your compiled Funcy code

Example output structure:
```javascript
const { funcy } = require('../dist/runtime');
const { exists, log, map, filter, reduce, length, at, append } = funcy;
const Map = funcy.Map;
const String = funcy.String;
const Array = funcy.Array;
// ... your code here
```

## Troubleshooting

### Command not found
If `funcy` is not found after installation:
```bash
# Reinstall globally
cd /Users/anastasi/funcy
npm install -g .

# Check npm global bin path
npm bin -g

# Make sure it's in your PATH
echo $PATH
```

### Permission errors
If you get EACCES errors:
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Runtime errors
If compiled code fails to run:
- Check that the runtime is available at the expected path
- Ensure `zod` dependency is installed
- Verify the output path is correct

## Development Workflow

Typical workflow:
```bash
# 1. Write Funcy code
vim myapp.fu

# 2. Test it
funcy run myapp.fu

# 3. Compile for distribution
funcy compile myapp.fu dist/myapp.js

# 4. Run compiled version
node dist/myapp.js
```

## What Gets Compiled

✅ Variables: `@x 42;`
✅ Functions: `@add x, y => x + y;`
✅ Recursion: `@factorial n => if(n = 0, 1, n * *(n - 1));`
✅ Module exports: `#math@square x => x * x;`
✅ Arrays: `[1, 2, 3]`
✅ Maps: `[name: "Alice", age: 30]`
✅ Built-in functions: `if`, `map`, `filter`, `reduce`, etc.
✅ Type annotations: `@add x:int, y:int => x + y;`
✅ Comments: `// This is preserved in output`

## Next Steps

See `NPM_PUBLISHING.md` for instructions on publishing to npm registry.

# Publishing Funcy to npm

## Current Status

✅ **Funcy is now installed globally** and can be run from anywhere:

```bash
funcy compile examples/hello.fu
funcy run examples/factorial.fu
```

## To Publish to npm Registry

Follow these steps to make Funcy available for anyone to install via `npm install -g funcy`:

### 1. Prepare the Package

First, ensure your package.json has all required fields:

```json
{
  "name": "funcy",
  "version": "0.1.0",
  "description": "Funcy - A purely functional language that compiles to TypeScript and JavaScript",
  "main": "dist/index.js",
  "bin": {
    "funcy": "dist/cli.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/funcy.git"
  },
  "keywords": ["functional", "compiler", "typescript", "javascript", "language"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT"
}
```

### 2. Create an npm Account

If you don't have one:
```bash
npm adduser
```

Or login:
```bash
npm login
```

### 3. Check Package Name Availability

```bash
npm view funcy
```

If the name is taken, you'll need to:
- Choose a different name (e.g., `@yourusername/funcy` or `funcy-lang`)
- Update the `name` field in package.json

### 4. Add a .npmignore File

Create `.npmignore` to exclude unnecessary files:

```
# Source files
src/
*.ts
tsconfig.json

# Test files
test/
examples/
*.fu

# Development files
.git/
.gitignore
.vscode/
vscode-funcy/
.temp/

# Documentation
*.md
!README.md

# Other
node_modules/
.DS_Store
```

### 5. Build the Project

Make sure everything is compiled:
```bash
npm run build
```

### 6. Test Locally First

Before publishing, test the package locally:
```bash
npm pack
```

This creates a `.tgz` file. Install it globally to test:
```bash
npm install -g funcy-0.1.0.tgz
```

### 7. Publish to npm

```bash
npm publish
```

For scoped packages:
```bash
npm publish --access public
```

### 8. Verify Installation

After publishing, anyone can install it:
```bash
npm install -g funcy
```

Then use it anywhere:
```bash
funcy compile myfile.fu
funcy run myfile.fu
```

## Updating the Package

When you make changes:

1. Update the version in package.json:
   ```bash
   npm version patch   # 0.1.0 -> 0.1.1
   npm version minor   # 0.1.0 -> 0.2.0
   npm version major   # 0.1.0 -> 1.0.0
   ```

2. Build and publish:
   ```bash
   npm run build
   npm publish
   ```

## Current CLI Commands

The funcy CLI already supports:

```bash
# Compile a single file
funcy compile examples/hello.fu output.js

# Compile and run
funcy run examples/hello.fu

# Compile entire folder
funcy compile examples/ bundle.js

# Show help
funcy --help
```

## Files to Include in npm Package

Make sure these are in your package:
- ✅ `dist/` - Compiled JavaScript files
- ✅ `dist/cli.js` - CLI entry point (has shebang)
- ✅ `dist/runtime.js` - Runtime library
- ✅ `dist/compiler.js` - Compiler
- ✅ `package.json` - Package manifest
- ✅ `README.md` - Documentation

## Recommended README Updates

Add to your main README.md:

```markdown
## Installation

Install Funcy globally via npm:

\`\`\`bash
npm install -g funcy
\`\`\`

## Quick Start

Compile a Funcy file:
\`\`\`bash
funcy compile myfile.fu
\`\`\`

Run a Funcy file directly:
\`\`\`bash
funcy run myfile.fu
\`\`\`
```

## Next Steps

1. Choose a unique package name if "funcy" is taken
2. Add repository URL to package.json
3. Create .npmignore file
4. Test with `npm pack`
5. Publish with `npm publish`

That's it! Your package will be available to the world.

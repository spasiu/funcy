# Funcy Language Support for VS Code

Syntax highlighting for the Funcy programming language.

## Features

- Syntax highlighting for `.fu` files
- Support for all Funcy language constructs:
  - Variables (`@name`)
  - Functions (`=>`, `*` for recursion)
  - Module exports (`#module@export`)
  - Event subscriptions (`%event_name`)
  - Event triggers (`&event_name`)
  - Await operator (`$`)
  - Comments (`//`)
  - Built-in functions (if, exists, log, throw, capture, etc.)
  - Built-in modules (Array, Map, String, IO)
  - Type annotations (int, string, bool, array, map, func, any)
  - Operators and literals

## Installation

### From Source

1. Copy the `vscode-funcy` directory to your VS Code extensions folder:
   - **macOS/Linux**: `~/.vscode/extensions/`
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`

2. Restart VS Code

### From VSIX (if packaged)

```bash
code --install-extension funcy-lang-0.1.0.vsix
```

## Usage

Open any `.fu` file and syntax highlighting will be automatically applied.

## Example

```funcy
// Factorial with recursion
@factorial n => if(n = 0, 1, n * *(n - 1));

// Array operations
@numbers [1, 2, 3, 4, 5];
@double n => n * 2;
@doubled map(numbers, double);

// Module export
#math@square x => x * x;

// Type annotations
@add x:int, y:int => x + y;

// Async operations
@result $IO.get("https://api.example.com/data");
```

## Language Features

Funcy is a functional programming language that compiles to JavaScript. Key features include:

- Immutable variables
- First-class functions
- Pattern matching with if expressions
- Recursion optimization
- Event-driven programming
- Async/await support
- Module system
- Type annotations with runtime validation

## Learn More

For complete language documentation, see the [Funcy Language Reference](../LANGUAGE_REFERENCE.md).

## License

MIT

# Installation Instructions

## Method 1: Install from Source (Recommended for Development)

1. **Copy to VS Code extensions folder:**

   ```bash
   # On macOS/Linux
   cp -r /Users/anastasi/funcy/vscode-funcy ~/.vscode/extensions/funcy-lang-0.1.0
   
   # On Windows (PowerShell)
   # Copy-Item -Path "C:\path\to\funcy\vscode-funcy" -Destination "$env:USERPROFILE\.vscode\extensions\funcy-lang-0.1.0" -Recurse
   ```

2. **Restart VS Code**
   - Close all VS Code windows
   - Reopen VS Code

3. **Test the extension:**
   - Open any `.fu` file in the Funcy project
   - You should see syntax highlighting applied automatically

## Method 2: Package and Install as VSIX

If you want to package the extension for distribution:

1. **Install vsce (VS Code Extension Manager):**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Package the extension:**
   ```bash
   cd /Users/anastasi/funcy/vscode-funcy
   vsce package
   ```

3. **Install the VSIX:**
   ```bash
   code --install-extension funcy-lang-0.1.0.vsix
   ```

## Verification

To verify the extension is installed:

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X on macOS, Ctrl+Shift+X on Windows/Linux)
3. Search for "Funcy"
4. You should see "Funcy Language Support" in the list

## Testing

Open any of these files to see the syntax highlighting in action:
- `/Users/anastasi/funcy/examples/hello.fu`
- `/Users/anastasi/funcy/examples/factorial.fu`
- `/Users/anastasi/funcy/examples/arrays.fu`

## Troubleshooting

If syntax highlighting doesn't work:

1. Check that the file extension is `.fu`
2. Try running the command "Change Language Mode" (Cmd+K M / Ctrl+K M) and select "Funcy"
3. Check the VS Code Developer Tools (Help > Toggle Developer Tools) for any errors
4. Ensure the extension is enabled in the Extensions panel

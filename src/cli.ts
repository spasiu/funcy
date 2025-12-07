#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { compile } from './compiler';

function showHelp() {
  console.log('Funcy - A purely functional language compiler');
  console.log('');
  console.log('Usage:');
  console.log('  funcy run <file.fu>              Compile and run a Funcy file');
  console.log('  funcy compile <file.fu> [out.js] Compile a Funcy file to JavaScript');
  console.log('  funcy compile <folder> [out.js]  Compile all .fu files in folder to single JS file');
  console.log('');
  console.log('Examples:');
  console.log('  funcy run examples/hello.fu');
  console.log('  funcy compile src/main.fu dist/main.js');
  console.log('  funcy compile src/ dist/bundle.js');
}

function compileSingleFile(inputFile: string, outputFile?: string): string {
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File '${inputFile}' not found`);
    process.exit(1);
  }
  
  if (!inputFile.endsWith('.fu')) {
    console.error('Error: Input file must have .fu extension');
    process.exit(1);
  }
  
  // Determine output file
  if (!outputFile) {
    const baseName = path.basename(inputFile, '.fu');
    const dirName = path.dirname(inputFile);
    outputFile = path.join(dirName, `${baseName}.js`);
  }
  
  try {
    console.log(`Compiling ${inputFile}...`);
    const source = fs.readFileSync(inputFile, 'utf-8');
    const compiled = compile(source);
    fs.writeFileSync(outputFile, compiled, 'utf-8');
    console.log(`✓ Compiled to ${outputFile}`);
    return outputFile;
  } catch (error: any) {
    console.error(`Compilation error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function compileFolder(folderPath: string, outputFile?: string): string {
  if (!fs.existsSync(folderPath)) {
    console.error(`Error: Folder '${folderPath}' not found`);
    process.exit(1);
  }
  
  const stats = fs.statSync(folderPath);
  if (!stats.isDirectory()) {
    console.error(`Error: '${folderPath}' is not a directory`);
    process.exit(1);
  }
  
  // Find all .fu files recursively
  const funcyFiles = findFuncyFiles(folderPath);
  
  if (funcyFiles.length === 0) {
    console.error(`Error: No .fu files found in '${folderPath}'`);
    process.exit(1);
  }
  
  console.log(`Found ${funcyFiles.length} Funcy file(s)`);
  
  // Determine output file
  if (!outputFile) {
    const folderName = path.basename(folderPath);
    outputFile = path.join(folderPath, `${folderName}.js`);
  }
  
  try {
    let combinedOutput = '';
    let hasImports = false;
    
    // Compile each file and combine
    for (let i = 0; i < funcyFiles.length; i++) {
      const file = funcyFiles[i];
      console.log(`  [${i + 1}/${funcyFiles.length}] Compiling ${path.relative(folderPath, file)}...`);
      
      const source = fs.readFileSync(file, 'utf-8');
      const compiled = compile(source);
      
      // For the first file, include all imports
      if (i === 0) {
        combinedOutput += compiled;
        hasImports = true;
      } else {
        // For subsequent files, skip the import statements at the top
        const lines = compiled.split('\n');
        let startIndex = 0;
        
        // Skip import lines (const ... = require(...))
        for (let j = 0; j < lines.length; j++) {
          if (!lines[j].startsWith('const {') && 
              !lines[j].startsWith('const Map') && 
              !lines[j].startsWith('const String') && 
              !lines[j].startsWith('const Array') &&
              lines[j].trim() !== '') {
            startIndex = j;
            break;
          }
        }
        
        // Add the code without imports
        combinedOutput += '\n' + lines.slice(startIndex).join('\n');
      }
    }
    
    fs.writeFileSync(outputFile, combinedOutput, 'utf-8');
    console.log(`✓ Compiled ${funcyFiles.length} file(s) to ${outputFile}`);
    return outputFile;
  } catch (error: any) {
    console.error(`Compilation error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function findFuncyFiles(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findFuncyFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.fu')) {
      results.push(fullPath);
    }
  }
  
  return results.sort(); // Sort for consistent ordering
}

function runFile(inputFile: string) {
  // Create a temporary output file
  const tempDir = path.join(__dirname, '../.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const baseName = path.basename(inputFile, '.fu');
  const tempOutput = path.join(tempDir, `${baseName}.js`);
  
  try {
    // Compile the file
    compileSingleFile(inputFile, tempOutput);
    
    // Run the compiled JavaScript
    console.log('\n--- Output ---');
    execSync(`node ${tempOutput}`, { stdio: 'inherit' });
    
    // Cleanup
    fs.unlinkSync(tempOutput);
  } catch (error: any) {
    // Cleanup on error
    if (fs.existsSync(tempOutput)) {
      fs.unlinkSync(tempOutput);
    }
    
    if (error.status !== undefined) {
      // Runtime error
      process.exit(error.status);
    } else {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'run':
      if (args.length < 2) {
        console.error('Error: Missing file argument');
        console.error('Usage: funcy run <file.fu>');
        process.exit(1);
      }
      runFile(args[1]);
      break;
      
    case 'compile':
      if (args.length < 2) {
        console.error('Error: Missing input argument');
        console.error('Usage: funcy compile <file.fu|folder> [output.js]');
        process.exit(1);
      }
      
      const input = args[1];
      const output = args[2];
      
      // Check if input is a directory or file
      if (fs.existsSync(input)) {
        const stats = fs.statSync(input);
        if (stats.isDirectory()) {
          compileFolder(input, output);
        } else {
          compileSingleFile(input, output);
        }
      } else {
        console.error(`Error: '${input}' not found`);
        process.exit(1);
      }
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.error(`Error: Unknown command '${command}'`);
      console.error('');
      showHelp();
      process.exit(1);
  }
}

main();

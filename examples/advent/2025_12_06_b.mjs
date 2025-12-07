import fs from 'fs';

const lines = fs.readFileSync('./2025_12_06_input.txt', 'utf8')
    .split('\n');

const columns = new Array(lines[0].length).fill('');
const operators = lines
    .pop()
    .trim()
    .split(/\s+/);

const n = lines
    .reduce((cols, line) => cols.map((col, i) => (col + line[i]).trim()), columns)
    .join(',')
    .split(',,')
    .map(ns => ns.split(',').map(n => parseInt(n)))
    .map((ns, i) => ns.reduce((a, b) => operators[i] == '*' ? a * b : a + b))
    .reduce((a, b) => a + b);

console.log({ n });

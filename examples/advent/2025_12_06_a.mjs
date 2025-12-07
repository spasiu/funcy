import fs from 'fs';

const instructions = fs.readFileSync('./2025_12_06_input.txt', 'utf8')
    .split('\n')
    .map(line => line.trim().split(/\s+/).map(n => n == '*' || n == '+' ? n : parseInt(n)));

const operators = instructions.pop();

const result = instructions
    .map(ns => ns.map((n, i) => x => operators[i] == '*' ? n * x : n + x))
    .reduce((ns, fs) => {
        for (let i = 0; i < fs.length; i++) {
            const f = fs[i];
            const n = ns[i];
            ns[i] = f(n);
        }
        return ns;
    }, operators.map(operator => operator == '*' ? 1 : 0))
    .reduce((x, y) => x + y);

console.log({ result });
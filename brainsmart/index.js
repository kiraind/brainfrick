const fs = require('fs')

const lexer = require('./src/lexer.js')
const parser = require('./src/parser.js')

const tokens = lexer(
    fs.readFileSync('./samples/test.bs', 'utf8')
)

const mod = parser(tokens)

console.log(mod)
const Token = require('./classes/Token.js')

const stringToObject = require('./utils/stringToObject.js')

const alphanumericChars = stringToObject(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_/'
)
const spaceChars = stringToObject(
    '\n \t'
)
const serviceChars = stringToObject(
    '{}[](),.@!$%;' // not including # and ' — they're needed while lexing
)

const MODE = {
    DEFAULT: 0,
    COMMENT: 1,
    LITERAL: 2,
    WORD:    3,
}

/**
 * 
 * @param {string} str 
 * @returns {Generator<string>}
 */
function* chars_generator(str) {
    let lineNumber = 1
    let columnNumber = 1

    for(let i = 0; i < str.length; i++) {
        const char = str[i]

        yield {
            line: lineNumber,
            col: columnNumber,
            char,
        }

        if(char === '\n') {
            lineNumber += 1
            columnNumber = 1
        } else {
            columnNumber += 1
        }
    }
}

/**
 * 
 * @param {string} file source code string
 * @returns {Array<Token>}
 */
function lexer(file) {
    const tokens = []

    const chars = [ ...chars_generator(file) ]

    let mode = MODE.DEFAULT

    const current_token = {
        str: '',
        line: 1,
        col: 1
    }

    for(let current = chars.shift(); current !== undefined; current = chars.shift()) {
        const { char, line, col } = current

        if(mode === MODE.DEFAULT) {
            if(char in spaceChars) {
                // do nothing, just skip
            } else if(char === '#') {
                mode = MODE.COMMENT
            } else if(char in alphanumericChars) {
                current_token.str = char
                current_token.line = line
                current_token.col = col

                mode = MODE.WORD
            } else if(char in serviceChars) {
                tokens.push(
                    new Token(
                        Token.TYPES.OPERATOR,
                        char,
                        line,
                        col
                    )
                )
            } else if(char === `'`) {
                current_token.str = ''
                current_token.line = line
                current_token.col = col

                mode = MODE.LITERAL
            } else {
                throw new Error(`Unexpected char '${char}' at line ${line} col ${col}`)
            }
        } else if(mode === MODE.COMMENT) {
            if(char === '\n') {
                mode = MODE.DEFAULT
            }
        } else if(mode === MODE.LITERAL) {
            // if unescaped ending
            if(char === "'" && current_token.str[current_token.str.length - 1] !== '\\') {
                tokens.push(
                    new Token(
                        Token.TYPES.LITERAL,
                        current_token.str,
                        current_token.line,
                        current_token.col
                    )
                )

                mode = MODE.DEFAULT
            } else {
                current_token.str += char
            }
        } else if(mode === MODE.WORD) {
            if(char in alphanumericChars) {
                current_token.str += char
            } else {
                tokens.push(
                    new Token(
                        Token.TYPES.WORD,
                        current_token.str,
                        current_token.line,
                        current_token.col
                    )
                )

                mode = MODE.DEFAULT

                // reiterate loop for this char
                chars.unshift( current )
            }
        }
    }

    return tokens
}

module.exports = lexer
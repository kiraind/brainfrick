const Token = require('./Token.js')

const decimal_int_r = /^\-?\d+$/
const escaped = {
    '0':  0x00,
    'a':  0x07,
    'b':  0x08,
    'e':  0x1b,
    'f':  0x0c,
    'n':  0x0a,
    'r':  0x0d,
    't':  0x09,
    'v':  0x0b,
    '\\': 0x5c,
    '\'': 0x27
}

function parseCharLiteral(str) {
    if(str.length === 1) {
        return str.charCodeAt( 0 )
    } else if(str.length === 2 && str[0] === '\\' && str[1] in escaped) {
        return escaped[ str[1] ]
    } else {
        return NaN
    }
}

const TYPES = {
    RESOLVED_VALUE:     0,
    RESOLVED_VARIABLE:  1,
    PASTED_ARGUMENT:    2,
}

class Argument {
    constructor(resolved, line, col, str, tokenType) {
        this.resolved = resolved
        this.line = line
        this.col = col
        this.str = str

        // this.type = type

        if(resolved) {
            if(tokenType === Token.TYPES.LITERAL) {
                this.type = TYPES.RESOLVED_VALUE
                this.value = parseCharLiteral(str)

                if( isNaN(this.value) ) {
                    throw new Error(`Invalid char literal '${str}' at line ${line} col ${col}`)
                }
            } else if(tokenType === Token.TYPES.WORD && decimal_int_r.test(str) ) {
                this.type = TYPES.RESOLVED_VALUE
                const int = parseInt(str, 10)

                if( isNaN(int) ) {
                    throw new Error(`Invalid int literal '${str}' at line ${line} col ${col}`)
                } else if(int > 256 || int < -128) {
                    throw new Error(`Invalid range for 8-bit int '${str}' at line ${line} col ${col}`)
                }

                if(int >= 0) {
                    this.value = int
                } else {
                    this.value = 256 + int
                }
            } else {
                this.type = TYPES.RESOLVED_VARIABLE
                this.name = str
            }
        } else {
            this.type = TYPES.PASTED_ARGUMENT
            this.name = str
        }
    }
}

Argument.TYPES = TYPES

module.exports = Argument
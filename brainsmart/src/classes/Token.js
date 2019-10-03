class Token {
    /**
     * 
     * @param {string} str token itself
     * @param {number} line line where it is found
     * @param {number} col column where it is found
     */
    constructor(type, str, line, col) {
        this.type = type
        this.str = str
        this.line = line
        this.col = col
    }
}

Token.TYPES = {
    WORD:     0,
    OPERATOR: 1,
    LITERAL:  2,
}

module.exports = Token
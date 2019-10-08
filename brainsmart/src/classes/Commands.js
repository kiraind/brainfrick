/*

    Command types:
    1. Basic: add, sub, in, out, mov, ls, le + Composite: set
    2. Move to declared variable + shift
    3. Macro

*/

class Command {
    constructor(line, col, argv) {
        this.line = line
        this.col  = col
        this.argv = argv // array of passed values
    }
}

const BASIC_COMMANDS = {
    INC :   0,
    DEC :   1,

    ADD:    2,
    SUB:    3,

    SET:    4,

    IN:     5,
    OUT:    6,

    MOV:    7,

    LS:     8,  // loop start
    LE:     9,

    UNSAFE: 10,  // enter unsafe mode
    SAFE:   11,

    VAR:    12,
}

class Basic extends Command {
    constructor(name, line, col, argv) {
        super(line, col, argv)

        const cmd = name.toUpperCase()

        if(cmd in BASIC_COMMANDS) {
            this.type = BASIC_COMMANDS[cmd]
        } else {
            throw new Error(`Unknown command '${cmd}' at line ${line} col ${col}`)
        }
    }

    get name() {
        return Object.keys(BASIC_COMMANDS).find(
            key => BASIC_COMMANDS[key] === this.type
        ) 
    }
}

class CodeSubstitute extends Command {
    constructor(line, col) {
        super(line, col, [])
    }
}

class MacroCall extends Command {
    constructor(name, line, col, argv) {
        super(line, col, argv)

        this.name = name
        this.code = [] // array of commands
    }
}

module.exports = {
    Basic,
    MacroCall,
    CodeSubstitute,
}
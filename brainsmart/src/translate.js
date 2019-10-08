const {
    Basic,
    MacroCall,
    CodeSubstitute,
} = require('./classes/Commands.js')

const Argument = require('./classes/Argument.js')

const INDENT_STEP = 4

function translate(commands, variables) {
    let varshift = 0
    for(const key in variables) {
        variables[key] = {
            ...variables[key],
            shift: varshift,
        }

        varshift += variables[key].size
    }

    let code = ''

    let safemode = true
    let indent = 0
    let current_shift = 0

    commands.forEach(cmd => {
        if( !(cmd instanceof Basic) ) {
            throw new Error(`internal assembler error`)
        }

        const {
            type,
            argv,
            line,
            col
        } = cmd

        // console.log(argv[0])

        if(type === Basic.COMMANDS.INC) {
            code += ' '.repeat(indent) + '+\n'
        } else if(type === Basic.COMMANDS.DEC) {
            code += ' '.repeat(indent) + '-\n'
        } else if(type === Basic.COMMANDS.ADD) {
            if(!argv[0] || argv[0].type !== Argument.TYPES.RESOLVED_VALUE) {
                throw new Error(`expected argument of type RESOLVED_VALUE`)
            }
            const { value } = argv[0]
            code += ' '.repeat(indent) + '+'.repeat( value ) + ' # ' + value + '\n'
        } else if(type === Basic.COMMANDS.SUB) {
            if(!argv[0] || argv[0].type !== Argument.TYPES.RESOLVED_VALUE) {
                throw new Error(`expected argument of type RESOLVED_VALUE`)
            }
            const { value } = argv[0]
            code += ' '.repeat(indent) + '-'.repeat( value ) + ' # ' + value + '\n'
        } else if(type === Basic.COMMANDS.SET) {
            if(!argv[0] || argv[0].type !== Argument.TYPES.RESOLVED_VALUE) {
                throw new Error(`expected argument of type RESOLVED_VALUE`)
            }
            const { value } = argv[0]
            code += ' '.repeat(indent) + '[-] ' + '+'.repeat( value ) + ' # ' + value + '\n'
        } else if(type === Basic.COMMANDS.IN) {
            code += ' '.repeat(indent) + ',\n'
        } else if(type === Basic.COMMANDS.OUT) {
            code += ' '.repeat(indent) + '.\n'
        } else if(type === Basic.COMMANDS.MOV) {
            if(safemode) {
                throw new Error(`cannot use MOV in safe mode`)
            }

            if(!argv[0] || argv[0].type !== Argument.TYPES.RESOLVED_VALUE) {
                throw new Error(`expected argument of type RESOLVED_VALUE`)
            }
            const { value } = argv[0]

            console.warn( `debug translate.js:58 -> ${value}` )

            if(value > 0) {
                code += ' '.repeat(indent) + '>'.repeat(  value ) + ' # ' +  value + '\n'
            } else if(value < 0) {
                code += ' '.repeat(indent) + '<'.repeat( -value ) + ' # ' + -value + '\n'
            }
        } else if(type === Basic.COMMANDS.LS) {
            if(safemode) {
                throw new Error(`cannot use LS in safe mode`)
            }

            code += ' '.repeat(indent) + '[\n'
            indent += INDENT_STEP
        } else if(type === Basic.COMMANDS.LE) {
            if(safemode) {
                throw new Error(`cannot use LE in safe mode`)
            }

            indent -= INDENT_STEP
            code += ' '.repeat(indent) + ']\n'
        } else if(type === Basic.COMMANDS.UNSAFE) {
            safemode = false
        } else if(type === Basic.COMMANDS.SAFE) {
            safemode = true
        } else if(type === Basic.COMMANDS.VAR) {
            if(!safemode) {
                throw new Error(`cannot use VAR in unsafe mode`)
            }

            if(!argv[0] || argv[0].type !== Argument.TYPES.RESOLVED_VARIABLE) {
                throw new Error(`expected argument of type RESOLVED_VARIABLE`)
            }

            const { name } = argv[0]

            if(!variables[name]) {
                throw new Error(`unknown variable '${name}'`)
            }

            const relative_shift = variables[name].shift - current_shift
            // console.log( name, relative_shift )

            if(relative_shift > 0) {
                code += ' '.repeat(indent) + '>'.repeat(  relative_shift ) + ' # ' +  relative_shift + ' @' + name + '\n'
            } else if(relative_shift < 0) {
                code += ' '.repeat(indent) + '<'.repeat( -relative_shift ) + ' # ' + -relative_shift + ' @' + name + '\n'
            }

            current_shift = variables[name].shift
        }
    })

    return code
}

module.exports = translate
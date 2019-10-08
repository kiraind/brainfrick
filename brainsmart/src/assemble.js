const {
    Basic,
    MacroCall,
    CodeSubstitute,
} = require('./classes/Commands.js')
const Argument = require('./classes/Argument.js')

function resolve_commands({
    commands,
    macro,
    macros,
    args,
    codearg,
    variables,
}) {
    const resolved_commands = []

    commands.forEach(command => {
        if( command instanceof Basic ) {
            const argv = []
            
            for(let i = 0; i < command.argv.length; i++) {
                if( !command.argv[i].resolved ) {
                    const {
                        name,
                        line,
                        col,
                    } = command.argv[i]

                    const argindex = macros[macro].args.findIndex(arg => arg === name)

                    if( argindex === -1 ) {
                        throw new Error(`macro argument '${name}' not defined for line ${line} col ${col}`)
                    }

                    const pasted = args[ argindex ]

                    // console.log( command.argv[i] )
                    const resolved = new Argument(
                        true,
                        line,
                        col,
                        pasted.str,
                        pasted.type,
                    )

                    argv.push( resolved )

                    // resolved_commands.push( command )
                } else {
                    // resolved
                    argv.push( command.argv[i] )
                }
            }

            resolved_commands.push(
                new Basic(
                    command.name,
                    command.line,
                    command.col,
                    argv,
                )
            )
        } else if(command instanceof MacroCall) {
            // console.log( command )
            // console.log( `pasting macro ${command.name}` )
            resolved_commands.push(
                ...assemble({
                    macro: command.name,
                    variables,
                    macros,
                    args: command.argv.map(arg => {
                        if(arg.resolved) {
                            return arg
                        } else {
                            const {
                                name,
                                line,
                                col,
                            } = arg
        
                            const argindex = macros[macro].args.findIndex(arg => arg === name)
        
                            if( argindex === -1 ) {
                                throw new Error(`macro argument '${name}' not defined for line ${line} col ${col}`)
                            }
        
                            const pasted = args[ argindex ]
        
                            // console.log( command.argv[i] )
                            return new Argument(
                                true,
                                line,
                                col,
                                pasted.str,
                                pasted.type,
                            )
                        }
                    }),
                    codearg: resolve_commands({
                        commands: command.code,
                        macro,
                        macros,
                        args,
                        codearg,
                        variables,
                    }) 
                })
            )

        } else if(command instanceof CodeSubstitute) {
            // console.log( command )
            resolved_commands.push( ...codearg )
        } else {
            throw new Error()
        }
    })

    return resolved_commands
}

function assemble({
    macro='main',
    variables,
    macros,
    args=[],
    codearg=[],
} = {}) {
    // console.log(macros)
    // return

    
    
    // macros[macro].

    

    return resolve_commands({
        commands: macros[macro].commands,
        macro,
        macros,
        args,
        codearg,
        variables,
    })
}

module.exports = assemble
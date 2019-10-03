const Module = require('./classes/Module.js')

const Variable = require('./classes/Variable.js')
const Macro = require('./classes/Variable.js')

const Argument = require('./classes/Argument')

const {
    Basic,
    MacroCall,
    CodeSubstitute,
} = require('./classes/Commands.js')

const makeSyntaxNodes = require('./syntax')

/**
 * 
 * @param {Array<Token>} file tokenized file
 * @returns {Module}
 */
function parser(tokens) {
    const state = {
        nesting_level: 0,
    }

    const dependencies    = []
    const declarations    = []
    const implementations = []

    const push_command = cmd => {
        let level = 0
        let commands = implementations[
            implementations.length - 1
        ].commands

        while(level !== state.nesting_level) {
            commands = commands[commands.length - 1].code
            level += 1
        }

        commands.push( cmd )
    }

    const last_command = () => {
        let level = 0
        let commands = implementations[
            implementations.length - 1
        ].commands

        while(level !== state.nesting_level) {
            commands = commands[commands.length - 1].code
            level += 1
        }

        return commands[commands.length - 1]
    }

    const nodes = makeSyntaxNodes({
        include_module: (prev, _) => {
            dependencies.push( prev.str )
        },


        declare_var: () => {
            // console.log(prev, curr)
            declarations.push({
                type: 'variable',
                size: 1,
            })
        },
        set_var_name: (_, curr) => {
            declarations[declarations.length - 1].name = curr.str
        },
        set_var_size: (_, curr) => {
            declarations[declarations.length - 1].size = parseInt(curr.str, 10)
        },

        declare_macro: () => {
            declarations.push({
                type: 'macro',
                args: [],
            })
        },
        set_macro_name: (_, curr) => {
            declarations[declarations.length - 1].name = curr.str
        },
        set_macro_arg: (_, curr) => {
            declarations[declarations.length - 1].args.push( curr.str )
        },


        set_implement_name: (_, curr) => {
            implementations.push({
                name: curr.str,
                commands: []
            })
        },

        implement_start_code_arg: () => {
            // console.warn('todo nested thinggg')
            state.nesting_level += 1
        },

        implement_stop_code_arg: () => {
            // console.warn('todo break nested block')
            state.nesting_level -= 1
        },

        basic_command: (_, curr) => {
            // console.log('!!!! ' + curr.str)
            push_command(
                new Basic(
                    curr.str,
                    curr.line,
                    curr.col,
                    []
                )
            )
        },
        basic_command_argument: (_, curr) => {
            last_command().argv.push(
                new Argument(
                    true,
                    curr.line,
                    curr.col,
                    curr.str,
                    curr.type,
                )
            )
        },
        basic_command_pasted_argument: (_, curr) => {
            last_command().argv.push(
                new Argument(
                    false,
                    curr.line,
                    curr.col,
                    curr.str,
                    curr.type,
                )
            )
        },

        push_varjump: (_, curr) => {
            // console.log('!!!! ' + curr.str)
            push_command(
                new Basic(
                    'var',
                    curr.line,
                    curr.col,
                    [
                        new Argument(
                            true,
                            curr.line,
                            curr.col,
                            curr.str,
                            curr.type,
                        )
                    ]
                )
            )
        },
        push_pasted_varjump: (_, curr) => {
            // console.log('!!!! ' + curr.str)
            push_command(
                new Basic(
                    'var',
                    curr.line,
                    curr.col,
                    [
                        new Argument(
                            false,
                            curr.line,
                            curr.col,
                            curr.str,
                            curr.type,
                        )
                    ]
                )
            )
        },

        push_macrocall: (_, curr) => {
            // console.log('!!!! ' + curr.str)
            push_command(
                new MacroCall(
                    curr.str,
                    curr.line,
                    curr.col,
                    []
                )
            )
        },
        push_macrocall_arg: (_, curr) => {
            last_command().argv.push(
                new Argument(
                    true,
                    curr.line,
                    curr.col,
                    curr.str,
                    curr.type,
                )
            )
        },
        push_macrocal_pasted_arg: (_, curr) => {
            last_command().argv.push(
                new Argument(
                    false,
                    curr.line,
                    curr.col,
                    curr.str,
                    curr.type,
                )
            )
        },

        paste_code_arg: (_, curr) => {
            push_command(
                new CodeSubstitute(
                    curr.line,
                    curr.col,
                )
            )
        }
    }, state)


    let current_node = 'root'
    let prev_token = null

    while(current_node !== null) {
        const node = nodes[current_node]

        if(node === undefined) {
            throw new Error(`Functionality '${current_node}' not implemented`)
        }

        // console.log(current_node)
      
        if(node.on) {
            node.on(prev_token, tokens[0])
        }

        const current_token = tokens[0]

        let found_path = false

        for(let i = 0; i < node.outs.length; i++) {
            const out = node.outs[i]

            if(out.cond && !out.cond()) {
                continue
            }

            // console.log(out.expect + ' ' + current_token.str + ' ' + out.test(current_token) )

            if( out.test(current_token) ) {
                current_node = out.target
                found_path = true

                if(out.on) {
                    out.on(prev_token, current_token)
                }

                break
            }
        }

        if(!found_path) {
            let line, col, str
            if(current_token) {
                line = current_token.line
                col  = current_token.col
                str  = current_token.str
            } else if(prev_token) {
                line = prev_token.line
                col  = prev_token.col
                str  = 'EOF'
            } else {
                throw new Error('Empty file')
            }

            throw new Error(
                `Syntax error at line ${line} col ${col}: found token '${str}', expecting ${
                    node.outs.length <= 3 ?
                    node.outs
                        .filter( out => !out.cond || out.cond() )
                        .map(out => out.expect)
                        .join(' or ')
                        :
                    'anything of:\n' + node.outs
                        .filter( out => !out.cond || out.cond() )
                        .map(out => '    > ' + out.expect)
                        .join('\n') + '\n'
                }`
            )
        }

        prev_token = current_token
        tokens.shift()
    }

    const variables = {}
    const macros = {}

    declarations.forEach(decl => {
        if(decl.type === 'macro') {
            const impl = implementations.find(
                impl => impl.name === decl.name
            )

            if(!impl) {
                throw new Error(`Found no implementation for declared macro '${decl.name}'`)
            }

            macros[
                decl.name
            ] = {
                name: decl.name,
                args: decl.args,
                commands: impl.commands,
            }
        } else {
            // variable
            variables[
                decl.name
            ] = {
                name: decl.name,
                size: decl.size,
            }
        }
    })

    return new Module(
        variables,
        macros,
        dependencies,
    )
}

module.exports = parser 
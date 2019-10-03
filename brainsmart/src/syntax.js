const Token = require('./classes/Token.js')

const whole_decimal_r = /^\d+$/

const makeSyntaxNodes = (handlers, state) => ({
    // ROOT THING
    root: {
        outs: [
            {
                expect: 'end of file',
                test: next_token => next_token === undefined,
                target: null,
            },

            {
                expect: 'include block',
                test: next_token => next_token && next_token.str === 'incl',
                target: 'include_open',
            },

            {
                expect: 'declare block',
                test: next_token => next_token && next_token.str === 'decl',
                target: 'declare_open',
            },

            {
                expect: 'implement block',
                test: next_token => next_token && next_token.str === 'impl',
                target: 'implement_open',
            },
        ]
    },


    // INCLUDE STUFF
    include_open: {
        outs: [
            {
                expect: 'opening bracket \'{\'',
                test: next_token => next_token && next_token.str === '{',
                target: 'include_block',
            }
        ]
    },
    include_block: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },

            {
                expect: 'included module name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'include_block_after_name',
            },
        ]
    },
    include_block_after_name: {
        on: handlers.include_module,
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },

            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'include_block',
            },
        ]
    },


    // DECLARE STUFF
    declare_open: {
        outs: [
            {
                expect: 'opening bracket \'{\'',
                test: next_token => next_token && next_token.str === '{',
                target: 'declare_block',
            }
        ]
    },
    declare_block: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },

            {
                expect: '\'@\' for variable declaration',
                test: next_token => next_token && next_token.str === '@',
                target: 'declare_var_name',
            },

            {
                expect: '\'!\' for marco declaration',
                test: next_token => next_token && next_token.str === '!',
                target: 'declare_macro_name',
            },
        ]
    },
    // VARIABLES
    declare_var_name: {
        on: handlers.declare_var,
        outs: [
            {
                expect: 'variable name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'declare_after_var_name',
                on: handlers.set_var_name,
            },
        ]
    },
    declare_after_var_name: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },
            
            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'declare_block',
            },

            {
                expect: 'opening bracket \'[\'',
                test: next_token => next_token && next_token.str === '[',
                target: 'declare_var_size',
            },
        ]
    },
    declare_var_size: {
        outs: [
            {
                expect: 'variable size',
                test: next_token => next_token && whole_decimal_r.test(next_token.str),
                target: 'declare_after_var_size',
                on: handlers.set_var_size,
            },
        ]
    },
    declare_after_var_size: {
        outs: [
            {
                expect: 'closing bracket \']\'',
                test: next_token => next_token && next_token.str === ']',
                target: 'declare_after_var_size_bracket',
            },
        ]
    },
    declare_after_var_size_bracket: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },
            
            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'declare_block',
            },
        ]
    },
    // MACROS
    declare_macro_name: {
        on: handlers.declare_macro,
        outs: [
            {
                expect: 'macro name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'declare_after_macro_name',
                on: handlers.set_macro_name,
            },
        ]
    },
    declare_after_macro_name: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },
            
            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'declare_block',
            },

            {
                expect: 'opening bracket \'(\'',
                test: next_token => next_token && next_token.str === '(',
                target: 'declare_macro_args',
            },
        ]
    },
    declare_macro_args: {
        outs: [
            {
                expect: 'closing bracket \')\'',
                test: next_token => next_token && next_token.str === ')',
                target: 'declare_after_macro_args',
            },
            
            {
                expect: 'argument prefix \'$\'',
                test: next_token => next_token && next_token.str === '$',
                target: 'declare_macro_arg_name',
            },
        ]
    },
    declare_after_macro_args: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },
            
            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'declare_block',
            },
        ]
    },
    declare_macro_arg_name: {
        outs: [
            {
                expect: 'macro argument name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'declare_macro_after_arg_name',
                on: handlers.set_macro_arg,
            },
        ]
    },
    declare_macro_after_arg_name: {
        outs: [
            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'declare_macro_args',
            },

            {
                expect: 'closing bracket \')\'',
                test: next_token => next_token && next_token.str === ')',
                target: 'declare_after_macro_args',
            },
        ]
    },

    // IMPLEMENTATION
    implement_open: {
        outs: [
            {
                expect: 'opening bracket \'{\'',
                test: next_token => next_token && next_token.str === '{',
                target: 'implement_block',
            },
        ]
    },
    implement_block: {
        outs: [
            {
                expect: 'closing bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'root',
            },

            {
                expect: 'macro implementation \'!fn { ... }\'',
                test: next_token => next_token && next_token.str === '!',
                target: 'implement_macro_name',
            },
        ]
    },
    implement_macro_name: {
        outs: [
            {
                expect: 'macro name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'implement_macro_after_name',
                on: handlers.set_implement_name,
            },
        ]
    },
    implement_macro_after_name: {
        outs: [
            {
                expect: 'opening bracket \'{\'',
                test: next_token => next_token && next_token.str === '{',
                target: 'code_block',
            },
        ]
    },

    // CODE BLOCKS
    code_block: {
        outs: [
            {
                cond: () => state.nesting_level === 0,
                expect: 'closing macro bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'implement_block',
            },

            {
                cond: () => state.nesting_level !== 0,
                expect: 'closing block bracket \'}\'',
                test: next_token => next_token && next_token.str === '}',
                target: 'code_block',
                on: handlers.implement_stop_code_arg,
            },

            {
                expect: 'basic command \'.cmd\'',
                test: next_token => next_token && next_token.str === '.',
                target: 'code_basic_command',
                // on: () => console.warn('todo append basic command')
            },

            {
                expect: 'variable jump \'@var\'',
                test: next_token => next_token && next_token.str === '@',
                target: 'code_variable_jump',
                // on: () => console.warn('todo append basic command')
            },

            {
                expect: 'macro call \'!fn(...) { ... }\'',
                test: next_token => next_token && next_token.str === '!',
                target: 'code_macrocall_name',
            },

            {
                expect: 'code argument paste \'%code;\'',
                test: next_token => next_token && next_token.str === '%',
                target: 'code_code_arg_paste',
            },
        ]
    },
    // basic
    code_basic_command: {
        outs: [
            {
                expect: 'basic command name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'code_after_basic_command',
                // on: () => console.warn('todo set basic command name')
                on: handlers.basic_command,
            },
        ]
    },
    code_after_basic_command: {
        outs: [
            {
                expect: 'semicolon \';\'',
                test: next_token => next_token && next_token.str === ';',
                target: 'code_block'
            },

            {
                expect: 'command argument',
                test: next_token => next_token && (next_token.type === Token.TYPES.WORD || next_token.type === Token.TYPES.LITERAL),
                target: 'code_after_basic_command',
                // on: () => console.warn('todo push basic command argument')
                on: handlers.basic_command_argument,
            },

            {
                expect: 'command pasted argument \'$arg\'',
                test: next_token => next_token && next_token.str === '$',
                target: 'code_basic_command_pasted_argument',
            },
        ]
    },
    code_basic_command_pasted_argument: {
        outs: [
            {
                expect: 'command pasted argument name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'code_after_basic_command',
                // on: () => console.warn('todo push basic pasted command argument')
                on: handlers.basic_command_pasted_argument,
            },
        ]
    },
    // varjump
    code_variable_jump: {
        outs: [
            {
                expect: 'variable name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'code_after_variable_jump',
                // on: () => console.warn('todo push varjump')
                on: handlers.push_varjump,
            },

            {
                expect: 'pasted variable name \'$arg\'',
                test: next_token => next_token && next_token.str === '$',
                target: 'code_variable_jump_arg',
            },
        ]
    },
    code_after_variable_jump: {
        outs: [
            {
                expect: 'semicolon \';\'',
                test: next_token => next_token && next_token.str === ';',
                target: 'code_block'
            },
        ]
    },
    code_variable_jump_arg: {
        outs: [
            {
                expect: 'argument name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'code_after_variable_jump',
                // on: () => console.warn('todo push pasted varjump')
                on: handlers.push_pasted_varjump,
            },
        ]
    },
    // macro call
    code_macrocall_name: {
        outs: [
            {
                expect: 'macro name',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'code_macrocall_after_name',
                // on: () => console.warn('todo push macrocall name')
                on: handlers.push_macrocall,
            },
        ]
    },
    code_macrocall_after_name: {
        outs: [
            {
                expect: 'semicolon \';\'',
                test: next_token => next_token && next_token.str === ';',
                target: 'code_block'
            },

            {
                expect: 'opening bracket \'(\'',
                test: next_token => next_token && next_token.str === '(',
                target: 'code_macrocall_args'
            },

            {
                expect: 'opening bracket \'{\'',
                test: next_token => next_token && next_token.str === '{',
                target: 'code_block', // 'code_macrocall_nested',
                on: handlers.implement_start_code_arg,               
            },
        ]
    },
    code_macrocall_args: {
        outs: [
            {
                expect: 'closing bracket \')\'',
                test: next_token => next_token && next_token.str === ')',
                target: 'code_macrocall_after_args',
            },

            {
                expect: 'macro call argument',
                test: next_token => next_token && (next_token.type === Token.TYPES.WORD || next_token.type === Token.TYPES.LITERAL),
                target: 'code_macrocall_after_arg',
                // on: () => console.warn('todo add macro call argument')
                on: handlers.push_macrocall_arg,
            },

            {
                expect: 'macro call pasted argument',
                test: next_token => next_token && next_token.str === '$',
                target: 'code_macrocall_pasted_arg'
            },
        ]
    },
    code_macrocall_after_arg: {
        outs: [
            {
                expect: 'closing bracket \')\'',
                test: next_token => next_token && next_token.str === ')',
                target: 'code_macrocall_after_args'
            },

            {
                expect: 'comma \',\'',
                test: next_token => next_token && next_token.str === ',',
                target: 'code_macrocall_args'
            },
        ]
    },
    code_macrocall_pasted_arg: {
        outs: [
            {
                expect: 'macro call pasted argument',
                test: next_token => next_token && next_token.type === Token.TYPES.WORD,
                target: 'code_macrocall_after_arg',
                // on: () => console.warn('todo add macro call pasted argument')
                on: handlers.push_macrocal_pasted_arg,
            },
        ]
    },
    code_macrocall_after_args: {
        outs: [
            {
                expect: 'semicolon \';\'',
                test: next_token => next_token && next_token.str === ';',
                target: 'code_block'
            },

            {
                expect: 'opening bracket \'{\'',
                test: next_token => next_token && next_token.str === '{',
                target: 'code_block', // 'code_macrocall_nested',
                on: handlers.implement_start_code_arg,              
            },
        ]
    },
    // code paste
    code_code_arg_paste: {
        outs: [
            {
                expect: 'keyword \'code\'',
                test: next_token => next_token && next_token.str === 'code',
                target: 'code_code_arg_after_paste',
                // on: () => console.warn('todo paste code arg'),
                on: handlers.paste_code_arg,
            },
        ]
    },
    code_code_arg_after_paste: {
        outs: [
            {
                expect: 'semicolon \';\'',
                test: next_token => next_token && next_token.str === ';',
                target: 'code_block'
            },
        ]
    }
})

module.exports = makeSyntaxNodes
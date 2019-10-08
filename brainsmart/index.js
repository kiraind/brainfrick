const path = require('path')
const fs   = require('fs')

const loader    = require('./src/loader.js')
const assemble  = require('./src/assemble.js')
const translate = require('./src/translate.js')

// $ node . ./samples/test.bs
const root_file = path.resolve(
    process.cwd(),
    process.argv[2]
)

const modules = loader(root_file)

// combine
const variables = {}
const macros    = {}

modules.reverse()

modules.forEach(mod => {
    for(let varname in mod.variables) {
        if(varname in variables) {
            throw new Error(`Attempt to re-declare variable '${varname}'`)
        }

        variables[varname] = mod.variables[varname]
    }

    for(let macroname in mod.macros) {
        if(macroname in macros) {
            throw new Error(`Attempt to re-declare macro '${macroname}'`)
        }

        macros[macroname] = mod.macros[macroname]
    }
})

if(!macros['main']) {
    throw new Error(`No entry point '!main { ... }' found`)
}

const commands = assemble({
    variables,
    macros
})

// console.log( commands )

// commands.forEach(cmd => console.log(
//     `.${cmd.name} ${
//         cmd.argv.map(arg => arg.type === 0 ?
//             arg.value :
//             arg.name
//         ).join(' ')
//     }`
// ))
// console.log(variables)
const code = translate( commands, variables )

// console.log(code)

fs.writeFileSync(
    'out.b',
    code,
    'utf8',
)
const fs   = require('fs')
const path = require('path')

const lexer  = require('./lexer.js')
const parser = require('./parser.js')

function loader(root_path) {
    const modules = []

    const queue_to_load = []
    const loaded = {}

    queue_to_load.push( root_path )

    while( queue_to_load.length > 0 ) {
        const current_path = queue_to_load.shift()

        const tokens = lexer(
            fs.readFileSync(current_path, 'utf8')
        )

        const mod = parser(tokens)
        modules.push( mod )

        queue_to_load.push(
            ...mod.dependencies
            .map(
                dep => path.resolve(
                    path.dirname(current_path),
                    dep + '.bs'
                )
            ).filter(
                dep_path => !(dep_path in loaded)
            )
        )

        loaded[current_path] = true
    }


    return modules
}

module.exports = loader
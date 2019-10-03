const path = require('path')

const loader = require('./src/loader.js')

// $ node . ./samples/test.bs
const root_file = path.resolve(
    process.cwd(),
    process.argv[2]
)

const modules = loader(root_file)

console.log(modules)
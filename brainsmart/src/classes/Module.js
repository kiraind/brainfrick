class Module {
    constructor(
        dependencies,
        declarations,
        implementations
    ) {
        this.dependencies    = dependencies
        this.declarations    = declarations
        this.implementations = implementations
    }
}

module.exports = Module
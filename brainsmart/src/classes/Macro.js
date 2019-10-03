class Macro {
    /**
     * 
     * @param {string} name macro name
     * @param {Array<string>} args list of arguments
     * @param {code} code code
     */
    constructor(name, args, code) {
        this.name = name
        this.args = args
        this.code = code
    }
}

module.exports = Macro
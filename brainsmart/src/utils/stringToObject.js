/**
 * Converts string of chars to object-map
 * @param {string} str 
 * @return {object}
 */
function stringToObject(str) {
    return str
        .split('')
        .reduce((obj, char, i) => {
            obj[char] = i
            return obj
        }, {})
}

module.exports = stringToObject
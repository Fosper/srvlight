const toolslight = require('../index.js')

toolslight.getFirstObjectKeyName = function(object) {
    
    /*
        Returns first key name from object.

        Example:
        .getFirstObjectKeyName({a: 'Test', b: 123}) - Returns 'a'.
    */

    let result = undefined

    for (const key in object) {
        result = key
        break
    }

    return result
}
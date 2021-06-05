const toolslight = require('../index.js')

toolslight.getLastObjectKeyName = function(object) {
    
    /*
        Returns last key name from object.

        Example:
        .getLastObjectKeyName({a: 'Test', b: 123}) - Returns 'b'.
    */

    let result = undefined

    let i = 0
    for (const key in object) {
        i++
    }

    let i2 = 0
    for (const key in object) {
        i2++
        if (i === i2) {
            result = key
            break
        }
    }

    return result
}
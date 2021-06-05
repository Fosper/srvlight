const toolslight = require('../index.js')

toolslight.getLastObjectKeyValue = function(object) {
    
    /*
        Returns last key value from object.

        Example:
        .getLastObjectKeyValue({a: 'Test', b: 123}) - Returns 123.
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
            result = object[key]
            break
        }
    }

    return result
}
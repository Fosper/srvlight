const toolslight = require('../index.js')

toolslight.getFirstObjectKeyValue = function(object) {
    
    /*
        Returns first key value from object.

        Example:
        .getFirstObjectKeyValue({a: 'Test', b: 123}) - Returns 'Test'.
    */

    let result = undefined

    for (const key in object) {
        result = object[key]
        break
    }

    return result
}
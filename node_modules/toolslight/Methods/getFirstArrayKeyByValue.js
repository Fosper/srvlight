const toolslight = require('../index.js')

toolslight.getFirstArrayKeyByValue = function(keyValue, array) {
    
    /*
        Returns first array key by key value.

        Example:
        .getFirstArrayKeyByValue(123, ['Test', 123, 123, 'Bob']) - Returns 1.
    */

    let result = undefined

    let i = 0
    for (let value of array) {
        if (value === keyValue) {
            result = i
            break
        }
        i++
    }

    return result
}
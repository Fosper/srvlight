const toolslight = require('../index.js')

toolslight.getLastArrayKeyByValue = function(keyValue, array) {
    
    /*
        Returns last array key by key value.

        Example:
        .getLastArrayKeyByValue(123, ['Test', 123, 123, 'Bob']) - Returns 2.
    */

    let result = undefined

    array = array.reverse()

    let i = array.length - 1
    for (let value of array) {
        if (value === keyValue) {
            result = i
            break
        }
        i--
    }

    return result
}
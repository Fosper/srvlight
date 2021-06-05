const toolslight = require('../index.js')

toolslight.getNextArrayValueByValue = function(keyValue, array) {
    
    /*
        Returns next array value by value.

        Example:
        .getNextArrayValueByValue('Test', ['Test', 123, 123, 'Bob']) - Returns 123.
    */

    let result = undefined

    let isNext = false
    for (let value of array) {
        if (isNext) {
            result = value
            break
        }
        if (value === keyValue) {
            isNext = true
        }
    }

    return result
}
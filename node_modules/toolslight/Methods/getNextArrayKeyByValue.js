const toolslight = require('../index.js')

toolslight.getNextArrayKeyByValue = function(keyValue, array) {
    
    /*
        Returns next array key by value.

        Example:
        .getNextArrayKeyByValue(123, ['Test', 123, 123, 'Bob']) - Returns 2.
    */

    let result = undefined

    let i = 0
    let isNext = false
    for (let value of array) {
        if (isNext) {
            result = i
            break
        }
        if (value === keyValue) {
            isNext = true
        }
        i++
    }

    return result
}
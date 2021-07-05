const toolslight = require('../index.js')

toolslight.isEmpty = function(value) {

    /*
        Returns bool.

        Example:
        Returns true for:
        .isEmpty(false)
        .isEmpty(null)
        .isEmpty(undefined)
        .isEmpty(0)
        .isEmpty('')
        .isEmpty('0')
        .isEmpty('false')
        .isEmpty('null')
        .isEmpty('undefined')
        .isEmpty({})
        .isEmpty([])
        .isEmpty(Symbol())
        .isEmpty(Symbol(''))

        Returns false in all other cases.
    */

    let result = true

    if (value) {
        if (typeof value === 'number' || typeof value === 'function') {
            result = false
        } else if (typeof value === 'string') {
            if (value !== '0' && value !== 'false' && value !== 'null' && value !== 'undefined') {
                result = false
            }
        } else if (typeof value === 'object') {
            if (value !== null) {
                for(let key in value) {
                if(value.hasOwnProperty(key)) {
                    result = false
                    break
                }
                }
            }
        } else if (typeof value === 'symbol') {
            if (value.description) {
                result = false
            }
        }
    }

    return result
}
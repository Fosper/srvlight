const toolslight = require('../index.js')

toolslight.uniqid = function(symbCount = 13) {
    
    /*
        Returns string.

        Example:
        .uniqid() - Get string with random 'a-z' and '0-9' symbols (13 symbols in string).
        .uniqid(20) - Get string with random 'a-z' and '0-9' symbols (20 symbols in string).
    */

    let lib = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

    let result = ''

    for (let i = 0; i < symbCount; i++) {
        result += lib[Math.floor(Math.random() * ((lib.length - 1) - 0 + 1) + 0)]
    }

    return result
}
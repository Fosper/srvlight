const toolslight = require('../index.js')

toolslight.arraysMerge = function(arrays = [], unique = true) {
    
    /*
        Returns array.

        Example:
        .arraysMerge([[123, 456], [456, 789]], true) - Returns [123, 456, 789]
        .arraysMerge([[123, 456], [456, 789]], false) - Returns [123, 456, 456, 789]
    */

    let result = []

    if (unique) {
        Array.prototype.unique = function() {
            var a = this.concat()
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1)
                }
            }
        
            return a
        }

        arrays.forEach((array) => {
            result = result.concat(array).unique()
        })
    } else {
        arrays.forEach((array) => {
            array.forEach((value) => {
                result.push(value)
            })
        })
    }

    return result
}
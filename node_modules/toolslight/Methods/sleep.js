const toolslight = require('../index.js')

toolslight.sleep = function(ms) {
    
    /*
        Returns promise.

        Example:
        await .sleep(5000) - For sleep 5 seconds.
    */

    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
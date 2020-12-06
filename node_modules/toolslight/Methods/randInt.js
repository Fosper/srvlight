const toolslight = require('../index.js')

toolslight.randInt = function(min, max) {
    
    /*
        Returns int.

        Example:
        .randInt(1, 10) - For number from 1 to 10 (includes 1 and 10).
    */

    return Math.floor(Math.random() * (max - min + 1) + min)
}
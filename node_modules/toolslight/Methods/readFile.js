const toolslight = require('../index.js')
const fs = require('fs')
const util = require('util')

toolslight.readFile = function(pathToFile, encoding = 'utf8') {
    
    /*
        Returns file data.

        Example:
        var err, data
        [err, data] = await toolslight.readFile('/var/www/123.txt')
    */
   
    return this.to(util.promisify(fs.readFile)(pathToFile, 'utf8'))
}
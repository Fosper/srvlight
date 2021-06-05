const toolslight = require('../index.js')
const fs = require('fs')

toolslight.isFileExists = function(pathToFile, encoding = 'utf8') {
    
    /*
        Returns file data.

        Example:
        var err, data
        [err, data] = await toolslight.isFileExists('/var/www/123.txt')
    */
   
    return this.to(fs.promises.access(pathToFile))
}
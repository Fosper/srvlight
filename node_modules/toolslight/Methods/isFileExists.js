const toolslight = require('../index.js')
const fs = require('fs')

toolslight.isFileExists = function(pathToFile) {
    
    /*
        Returns file data.

        Example-1 (sync):
        var err, isFileNotExist
        [err, isFileNotExist] = await toolslight.to(toolslight.isFileExists('/var/www/123.txt'))

        Example-2 (async):
        toolslight.isFileExists('/var/www/123.txt').then(data => {}).catch(error => {})
    */
   
    return fs.promises.access(pathToFile)
}
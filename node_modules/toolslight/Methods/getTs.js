const toolslight = require('../index.js')

toolslight.getTs = function(date = Date.now()) {
    
    /*
        Returns number.

        Example:
        .getTs() - Returns current date in timestamp. Format: 1604863933000
        .getTs(1604863933) - Returns specified (in argument) date in timestamp. Format: 1604863933000
        .getTs(1604863933000) - Returns specified (in argument) date in timestamp. Format: 1604863933000
        .getTs('2020-12-31 23:59:59') - Returns specified (in argument) date in timestamp. Format: 1604863933000
    */

    let timestamp

    if (typeof date === 'number') {
        timestamp = date
    } else {
        timestamp = Date.parse(date)
    }

    let timestampLength = timestamp.toString().length

    if (timestampLength < 13) {
        let needAdd = 13 - timestampLength
        for (let i = 0; i < needAdd; i++) {
            timestamp = timestamp * 10
        }
    }

    return timestamp
}
const toolslight = require('../index.js')

toolslight.getDay = function(date = Date.now()) {
    
    /*
        Returns number.

        Example:
        .getDay() - Returns current day of month. For 1 to 31.
        .getDay(1604863933) - Returns specified (in argument) day of month. For 1 to 31.
        .getDay(1604863933000) - Returns specified (in argument) day of month. For 1 to 31.
        .getDay('2020-12-31 23:59:59') - Returns specified (in argument) day of month. For 1 to 31.
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

    timestamp = (Math.floor(timestamp / 1000))
    timestamp = timestamp + (this.UTC * 60 * 60)
    timestamp = timestamp * 1000
    
    let dt = new Date(timestamp)

    return dt.getUTCDate()
}
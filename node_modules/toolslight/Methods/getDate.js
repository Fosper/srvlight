const toolslight = require('../index.js')

toolslight.getDate = function(date = Date.now()) {
    
    /*
        Returns string.

        Example:
        .getDate() - Returns current date. Format: 2020-09-02 01:09:05
        .getDate(1604863933) - Returns specified (in argument) date. Format: 2020-11-08 19:32:13
        .getDate(1604863933000) - Returns specified (in argument) date. Format: 2020-11-08 19:32:13
        .getDate('2020-11-08') - Returns specified (in argument) date in timestamp. Format: 2020-11-08 00:00:00
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
    let year = dt.getUTCFullYear()
    let month = parseInt(dt.getUTCMonth() + 1)
    if (month < 10) {
        month = '0' + month
    }
    let day = dt.getUTCDate()
    if (day < 10) {
        day = '0' + day
    }
    let hour = dt.getUTCHours()
    if (hour < 10) {
        hour = '0' + hour
    }
    let minute = dt.getUTCMinutes()
    if (minute < 10) {
        minute = '0' + minute
    }
    let second = dt.getUTCSeconds()
    if (second < 10) {
        second = '0' + second
    }

    let result =
        year + '-' +
        month + '-' +
        day + ' ' +
        hour + ':' +
        minute + ':' +
        second

    return result
}
const toolslight = require('../index.js')

toolslight.getDate = function(timestamp = Date.now()) {
    
    /*
        Returns string.

        Example:
        .getDate() - Get string with current date. Format: 2020-09-02 01:09:05
        .getDate(1604863933) - Get string with timestamp date. Format: 2020-11-08 19:32:13
        .getDate(1604863933000) - Get string with timestamp date. Format: 2020-11-08 19:32:13
    */

    let timestampLength = timestamp.toString().length

    if (timestampLength < 13) {
        let needAdd = 13 - timestampLength
        for (let i = 0; i < needAdd; i++) {
            timestamp = timestamp * 10
        }
    }

    let date = new Date(timestamp)
    let year = date.getUTCFullYear()
    let month = parseInt(date.getUTCMonth() + 1)
    if (month < 10) {
        month = '0' + month
    }
    let day = date.getUTCDate()
    if (day < 10) {
        day = '0' + day
    }
    let hour = date.getUTCHours()
    if (hour < 10) {
        hour = '0' + hour
    }
    let minute = date.getUTCMinutes()
    if (minute < 10) {
        minute = '0' + minute
    }
    let second = date.getUTCSeconds()
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
const toolslight = require('../index.js')

toolslight.getDayOfWeek = function(date = Date.now()) {
    
    /*
        Returns number.

        Example:
        .getDayOfWeek() - Returns current day of week. 1 for Monday, 2 for Tuesday ... 7 for Sunday.
        .getDayOfWeek(1604863933) - Returns specified day of week. 1 for Monday, 2 for Tuesday ... 7 for Sunday.
        .getDayOfWeek(1604863933000) - Returns specified day of week. 1 for Monday, 2 for Tuesday ... 7 for Sunday.
        .getDayOfWeek('2020-09-02 01:09:05') - Returns specified day of week. 1 for Monday, 2 for Tuesday ... 7 for Sunday.
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
    let dayOfWeek = dt.getDay()
    if (dayOfWeek === 0) {
        dayOfWeek = 7
    }

    return dayOfWeek
}
class Toolslight {
    static UTC = 0

    static setUTC(data = 0) {
        this.UTC = data
    }
}

module.exports = Toolslight

require('./Methods/arraysMerge.js')
require('./Methods/getDate.js')
require('./Methods/getDay.js')
require('./Methods/getDayOfWeek.js')
require('./Methods/getFirstArrayKeyByValue.js')
require('./Methods/getFirstObjectKeyName.js')
require('./Methods/getFirstObjectKeyValue.js')
require('./Methods/getHash.js')
require('./Methods/getHour.js')
require('./Methods/getLastArrayKeyByValue.js')
require('./Methods/getLastObjectKeyName.js')
require('./Methods/getLastObjectKeyValue.js')
require('./Methods/getMinute.js')
require('./Methods/getMonth.js')
require('./Methods/getNextArrayKeyByValue.js')
require('./Methods/getNextArrayValueByValue.js')
require('./Methods/getSecond.js')
require('./Methods/getTs.js')
require('./Methods/getYear.js')
require('./Methods/isEmpty.js')
require('./Methods/isFileExists.js')
require('./Methods/isInternetAvailable.js')
require('./Methods/isProxyAvailable.js')
require('./Methods/jsonToObject.js')
require('./Methods/randInt.js')
require('./Methods/readFile.js')
require('./Methods/request.js')
require('./Methods/sleep.js')
require('./Methods/to.js')
require('./Methods/uniqid.js')
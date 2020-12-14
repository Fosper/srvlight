const fs = require('fs')
const events = require('events')
const tl = require('toolslight')

class Srvlight extends events {

    constructor(type, options) {
        super()
        this.type = type
        this.options = options
        this.routes = {}
    }

    route = (path, callback, customOptions = {}) => {
        let options = {}
        for (const option of Object.keys(this.options)) {
            if (option === 'url' || option === 'port' || option === 'cert' || option === 'key') {
                continue
            }
            if (!tl.isEmpty(customOptions[option])) {
                if (this.options[option] !== customOptions[option]) {
                    options[option] = customOptions[option]
                }
            }
        }

        this.on(path, callback)

        this.routes[Object.keys(this.routes).length] = {
            path: path,
            options: options
        }
    }

    start = () => {
        this[this.type + 'Start']()
    }

    before = (callback) => {
        this.on('before', callback)
    }

    after = (callback) => {
        this.on('after', callback)
    }
}

module.exports = Srvlight

require('./Methods/http.js')
require('./Methods/https.js')
require('./Methods/ws.js')
require('./Methods/wss.js')
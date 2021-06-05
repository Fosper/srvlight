class Srvlight {

    constructor(type, options) {
        this.type = type
        this.options = options
        this.befores = {}
        this.routes = {}
        this.routeDefaultOptions = {}
    }

    before = (routes, callback) => {
        for (let customOptions of routes) {
            let defaultOptions = this.routeDefaultOptions
    
            let options = {}
        
            for (const defaultOption in defaultOptions) {
                if (typeof(defaultOptions[defaultOption]) === typeof(customOptions[defaultOption])) {
                    options[defaultOption] = customOptions[defaultOption]
                } else {
                    options[defaultOption] = defaultOptions[defaultOption]
                }
            }
    
            if (options.method === '' || options.route === '') {
                throw new Error('srvlight: incorrect \'before\' function arguments.')
            }
    
            options.callback = callback

            if (this.befores[options.method.toLowerCase() + '#' + options.route] !== undefined) {
                this.befores[options.method.toLowerCase() + '#' + options.route].push(options)
            } else {
                this.befores[options.method.toLowerCase() + '#' + options.route] = [options]
            }
        }
    }

    route = (customOptions = {}, callback) => {
        let defaultOptions = this.routeDefaultOptions
    
        let options = {}
    
        for (const defaultOption in defaultOptions) {
            if (typeof(defaultOptions[defaultOption]) === typeof(customOptions[defaultOption])) {
                options[defaultOption] = customOptions[defaultOption]
            } else {
                options[defaultOption] = defaultOptions[defaultOption]
            }
        }

        if (options.method === '' || options.route === '') {
            throw new Error('srvlight: incorrect \'route\' function arguments.')
        }

        options.callback = callback

        this.routes[options.method.toLowerCase() + '#' + options.route] = options
    }

    start = () => {
        this[this.type + 'Start']()
    }
}

module.exports = Srvlight

// require('./Methods/http.js')
require('./Methods/https.js')
// require('./Methods/ws.js')
// require('./Methods/wss.js')
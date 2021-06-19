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
                if (Object.prototype.toString.call(defaultOptions[defaultOption]) === Object.prototype.toString.call(customOptions[defaultOption])) {
                    options[defaultOption] = customOptions[defaultOption]
                } else {
                    options[defaultOption] = defaultOptions[defaultOption]
                }
            }
    
            if (options.method === '' || options.route === '') {
                let fullError = 'srvlight: incorrect \'before\' function arguments (\'method\' or \'route\' argument incorrect).'
                if (this.options.errorsLogFile !== '') {
                    try {
                        fs.appendFileSync(this.options.errorsLogFile, fullError)
                    } catch (error) {
                        throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                    }
                }
                throw new Error(fullError)
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
            if (Object.prototype.toString.call(defaultOptions[defaultOption]) === Object.prototype.toString.call(customOptions[defaultOption])) {
                options[defaultOption] = customOptions[defaultOption]
            } else {
                options[defaultOption] = defaultOptions[defaultOption]
            }
        }

        if (options.method === '' || options.route === '') {
            let fullError = 'srvlight: incorrect \'route\' function arguments (\'method\' or \'route\' argument incorrect).'
            if (this.options.errorsLogFile !== '') {
                try {
                    fs.appendFileSync(this.options.errorsLogFile, fullError)
                } catch (error) {
                    throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                }
            }
            throw new Error(fullError)
        }

        options.callback = callback

        this.routes[options.method.toLowerCase() + '#' + options.route] = options
    }

    start = () => {
        this[this.type + 'Start']()
    }
}

module.exports = Srvlight

require('./Methods/http.js')
require('./Methods/https.js')
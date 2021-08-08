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

            if (!options.methods.length) {
                let fullError = 'srvlight: incorrect \'before\' function arguments (\'methods\' argument is empty or is not array).'
                if (this.options.errorsLogFile !== '') {
                    try {
                        fs.appendFileSync(this.options.errorsLogFile, fullError)
                    } catch (error) {
                        throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                    }
                }
                throw new Error(fullError)
            }

            let availableMethods = [
                'GET', 
                'POST', 
                'PUT', 
                'DELETE', 
                'OPTIONS', 
                'HEAD', 
                'PATCH'
            ]
    
            for (let method of options.methods) {
                if (!availableMethods.includes(method)) {
                    let fullError = 'srvlight: incorrect \'before\' function arguments (\'methods\' argument must contain only strings values, and values can\'t be empty. Available values: \'GET\', \'POST\', \'PUT\', \'DELETE\', \'OPTIONS\', \'HEAD\', \'PATCH\').'
                    if (this.options.errorsLogFile !== '') {
                        try {
                            fs.appendFileSync(this.options.errorsLogFile, fullError)
                        } catch (error) {
                            throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                        }
                    }
                    throw new Error(fullError)
                }
            }

            if (!options.routes.length) {
                let fullError = 'srvlight: incorrect \'before\' function arguments (\'routes\' argument is empty or is not array).'
                if (this.options.errorsLogFile !== '') {
                    try {
                        fs.appendFileSync(this.options.errorsLogFile, fullError)
                    } catch (error) {
                        throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                    }
                }
                throw new Error(fullError)
            }
    
            for (let route of options.routes) {
                let isError = false
                if (Object.prototype.toString.call(route) === '[object String]') {
                    route = route.replace(/\s+/g, '')
                    if (route === '') {
                        isError = true
                    }
                } else {
                    isError = true
                }
    
                if (isError) {
                    let fullError = 'srvlight: incorrect \'before\' function arguments (\'routes\' argument must contain only strings values. For example: \'/\', \'/index.php\', \'/*\').'
                    if (this.options.errorsLogFile !== '') {
                        try {
                            fs.appendFileSync(this.options.errorsLogFile, fullError)
                        } catch (error) {
                            throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                        }
                    }
                    throw new Error(fullError)
                }
            }
    
            options.callback = callback

            for (let method of options.methods) {
                for (let route of options.routes) {
                    if (this.befores[method.toLowerCase() + '#' + route] !== undefined) {
                        this.befores[method.toLowerCase() + '#' + route].push(options)
                    } else {
                        this.befores[method.toLowerCase() + '#' + route] = [options]
                    }
                }
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

        if (!options.methods.length) {
            let fullError = 'srvlight: incorrect \'route\' function arguments (\'methods\' argument is empty or is not array).'
            if (this.options.errorsLogFile !== '') {
                try {
                    fs.appendFileSync(this.options.errorsLogFile, fullError)
                } catch (error) {
                    throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                }
            }
            throw new Error(fullError)
        }

        let availableMethods = [
            'GET', 
            'POST', 
            'PUT', 
            'DELETE', 
            'OPTIONS', 
            'HEAD', 
            'PATCH'
        ]

        for (let method of options.methods) {
            if (!availableMethods.includes(method)) {
                let fullError = 'srvlight: incorrect \'route\' function arguments (\'methods\' argument must contain only strings values, and values can\'t be empty. Available values: \'GET\', \'POST\', \'PUT\', \'DELETE\', \'OPTIONS\', \'HEAD\', \'PATCH\').'
                if (this.options.errorsLogFile !== '') {
                    try {
                        fs.appendFileSync(this.options.errorsLogFile, fullError)
                    } catch (error) {
                        throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                    }
                }
                throw new Error(fullError)
            }
        }

        if (!options.routes.length) {
            let fullError = 'srvlight: incorrect \'route\' function arguments (\'routes\' argument is empty or is not array).'
            if (this.options.errorsLogFile !== '') {
                try {
                    fs.appendFileSync(this.options.errorsLogFile, fullError)
                } catch (error) {
                    throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                }
            }
            throw new Error(fullError)
        }

        for (let route of options.routes) {
            let isError = false
            if (Object.prototype.toString.call(route) === '[object String]') {
                route = route.replace(/\s+/g, '')
                if (route === '') {
                    isError = true
                }
            } else {
                isError = true
            }

            if (isError) {
                let fullError = 'srvlight: incorrect \'route\' function arguments (\'routes\' argument must contain only strings values. For example: \'/\', \'/index.php\', \'/*\').'
                if (this.options.errorsLogFile !== '') {
                    try {
                        fs.appendFileSync(this.options.errorsLogFile, fullError)
                    } catch (error) {
                        throw new Error('srvlight: incorrect \'http\' or \'https\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + this.options.errorsLogFile + ' is exists).')
                    }
                }
                throw new Error(fullError)
            }
        }

        options.callback = callback

        for (let method of options.methods) {
            for (let route of options.routes) {
                this.routes[method.toLowerCase() + '#' + route] = options
            }
        }
    }

    start = () => {
        this[this.type + 'Start']()
    }
}

module.exports = Srvlight

require('./Methods/http.js')
require('./Methods/https.js')
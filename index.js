const fs = require('fs')

class Srvlight {

    constructor(type, options) {
        this.type = type
        this.options = options
        this.befores = {}
        this.routes = {}
        this.routeDefaultOptions = {}
    }

    getContentType = (fileName) => {
        const mimeTypes = {
            '.aac': `audio/aac`,
            '.abw': `application/x-abiword`,
            '.arc': `application/x-freearc`,
            '.avi': `video/x-msvideo`,
            '.azw': `application/vnd.amazon.ebook`,
            '.bin': `application/octet-stream`,
            '.bmp': `image/bmp`,
            '.bz': `application/x-bzip`,
            '.bz2': `application/x-bzip2`,
            '.csh': `application/x-csh`,
            '.css': `text/css`,
            '.csv': `text/csv`,
            '.doc': `application/msword`,
            '.docx': `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
            '.eot': `application/vnd.ms-fontobject`,
            '.epub': `application/epub+zip`,
            '.gz': `application/gzip`,
            '.gif': `image/gif`,
            '.htm': `text/html`,
            '.html': `text/html`,
            '.ico': `image/vnd.microsoft.icon`,
            '.ics': `text/calendar`,
            '.jar': `application/java-archive`,
            '.jpeg': `image/jpeg`,
            '.jpg': `image/jpeg`,
            '.js': `text/javascript`,
            '.json': `application/json`,
            '.jsonld': `application/ld+json`,
            '.mid': `audio/midi audio/x-midi`,
            '.midi': `audio/midi audio/x-midi`,
            '.mjs': `text/javascript`,
            '.mp3': `audio/mpeg`,
            '.mp4': `video/mp4`,
            '.mpeg': `video/mpeg`,
            '.mpkg': `application/vnd.apple.installer+xml`,
            '.odp': `application/vnd.oasis.opendocument.presentation`,
            '.ods': `application/vnd.oasis.opendocument.spreadsheet`,
            '.odt': `application/vnd.oasis.opendocument.text`,
            '.oga': `audio/ogg`,
            '.ogv': `video/ogg`,
            '.ogx': `application/ogg`,
            '.opus': `audio/opus`,
            '.otf': `font/otf`,
            '.png': `image/png`,
            '.pdf': `application/pdf`,
            '.php': `application/x-httpd-php`,
            '.ppt': `application/vnd.ms-powerpoint`,
            '.pptx': `application/vnd.openxmlformats-officedocument.presentationml.presentation`,
            '.rar': `application/vnd.rar`,
            '.rtf': `application/rtf`,
            '.sh': `application/x-sh`,
            '.svg': `image/svg+xml`,
            '.swf': `application/x-shockwave-flash`,
            '.tar': `application/x-tar`,
            '.tif': `image/tiff`,
            '.tiff': `image/tiff`,
            '.ts': `video/mp2t`,
            '.ttf': `font/ttf`,
            '.txt': `text/plain`,
            '.vsd': `application/vnd.visio`,
            '.wav': `audio/wav`,
            '.weba': `audio/webm`,
            '.webm': `video/webm`,
            '.webp': `image/webp`,
            '.woff': `font/woff`,
            '.woff2': `font/woff2`,
            '.xhtml': `application/xhtml+xml`,
            '.xls': `application/vnd.ms-excel`,
            '.xlsx': `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
            '.xml': `text/xml`,
            '.xul': `application/vnd.mozilla.xul+xml`,
            '.zip': `application/zip`,
            '.3gp': `video/3gpp`,
            '.3g2': `video/3gpp2`,
            '.7z': `application/x-7z-compressed`
        }
    
        const ext = `.${fileName.split(`.`).pop()}`
        return mimeTypes[ext] || null
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
                'PATCH',
                'CONNECT'
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
            'PATCH',
            'CONNECT'
        ]

        for (let method of options.methods) {
            if (!availableMethods.includes(method)) {
                let fullError = 'srvlight: incorrect \'methods\' function arguments (\'methods\' argument must contain only strings values, and values can\'t be empty. Available values: \'GET\', \'POST\', \'PUT\', \'DELETE\', \'OPTIONS\', \'HEAD\', \'PATCH\').'
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

    stop = () => {
        this[this.type + 'Stop']()
    }
}

module.exports = Srvlight

require('./Methods/http.js')
require('./Methods/https.js')
require('./Methods/ws.js')
require('./Methods/wss.js')
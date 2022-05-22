const srvlight = require('../index.js')
const fs = require('fs')
const http = require('http')

/*
    [Example - short]:

    const srvlight = require('srvlight')

    let httpServer = srvlight.http()

    httpServer.route({
            methods: ['POST'], // Default none, must set. Can be GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH.
            routes: ['/test'] // Default none, must set.
        }, async (req, res, data) => {
            console.log(data)

            if (!data.bodyInFile) {
                console.log('Body (string):', Buffer.from(data.body, 'binary').toString())
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            })
            
            res.end('OK')
        }
    )

    httpServer.start()

    [Example - full]:

    const srvlight = require('srvlight')

    let httpServer = srvlight.http({
        urls: [], // Default: [] (empty). If empty - clients can make requests to any urls. Can be (example): ['mysite.com', 'www.mysite.com']
        port: 80, // Default: 80.
        connectionLimit: 10, // Default: 0. If 0 - no limit.
        headerSizeLimit: 8192, // Default: 16384 Bytes.
        bodySizeLimit: 10240, // Default: 0 Bytes. If 0 - no limit.
        bodyCache: '', // Default ''. If you need save body to file - select path to any exist folder.
        requestTimeout: 5000, // Default: 120 000 milliseconds.
        allowedIps: [], // Default: [] (empty). If empty - all IPs allowed to send requests.
        disallowedIps: [], // Default: [] (empty). If empty - didn't block any IP to send requests.
        assets: [
            {route: '/assets', dir: __dirname + '/assets'},
            {route: '/assets/images', dir: __dirname + '/assets/bestImages'},
        ], // Default: [] (empty). For assets folders. dir parameter must be final directory.
        errorsLogFile: __dirname + '/log/errors.log' // Default: ''. If set - all errors will append to this file before throw exception.
    })

    httpServer.route({
            methods: ['POST'], // Default none, must set. Can be GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH.
            routes: ['/test'], // Default none, must set.
            bodySizeLimit: 4092, // Default: 0 Bytes. If 0 - no limit.
            bodyCache: '', // Default ''. If you need save body to file - select path to any exist folder.
            allowedIps: [], // Default: [] (empty). If empty - all IPs allowed to send requests.
            disallowedIps: [] // Default: [] (empty). If empty - didn't block any IP to send requests.
        }, async (req, res, data) => {
            console.log('I do this finally.')
            console.log(data)

            if (!data.bodyInFile) {
                console.log('Body (string):', Buffer.from(data.body, 'binary').toString())
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            })
            
            res.end('OK')
        }
    )

    httpServer.before([
            {
                methods: ['POST'],
                routes: ['/test'],
                bodySizeLimit: 4092,
                bodyCache: '',
                allowedIps: [],
                disallowedIps: []
            }
        ], async (req, res, data) => {
            console.log('I do this first.')
            return true // Must return true, for make next 'before' function (if exists) or route.
        }
    )
    
    httpServer.before([
            {
                methods: ['POST'],
                routes: ['/test'],
                bodySizeLimit: 4092,
                bodyCache: '',
                allowedIps: [],
                disallowedIps: []
            },
            {
                methods: ['POST'],
                routes: ['/test2'], // This route not exists, and function below will be didn't execute.
                bodySizeLimit: 4092,
                bodyCache: '',
                allowedIps: [],
                disallowedIps: []
            }
        ], async (req, res, data) => {
            console.log('I do this second.')
            return true // Must return true, for make next 'before' function (if exists) or route.
        }
    )

    httpServer.start()
*/

srvlight.http = function(customOptions = {}) {
    let defaultOptions = {
        urls: [],
        port: 80,
        connectionLimit: 0,
        headerSizeLimit: 16384,
        bodySizeLimit: 0,
        bodyCache: '',
        requestTimeout: 120000,
        allowedIps: [],
        disallowedIps: [],
        assets: [],
        errorsLogFile: ''
    }

    let options = {}

    for (const defaultOption in defaultOptions) {
        if (Object.prototype.toString.call(defaultOptions[defaultOption]) === Object.prototype.toString.call(customOptions[defaultOption])) {
            options[defaultOption] = customOptions[defaultOption]
        } else {
            options[defaultOption] = defaultOptions[defaultOption]
        }
    }

    let self = new this('http', options)

    self.routeDefaultOptions = {
        methods: [],
        routes: [],
        bodySizeLimit: options.bodySizeLimit,
        bodyCache: '',
        allowedIps: options.allowedIps,
        disallowedIps: options.disallowedIps,
        callback: async (req, res, data) => { return true }
    }

    return self
}

srvlight.prototype.httpStart = function() {
    let server = this

    let serverOptions = {}

    for (const option in server.options) {
        switch (option) {
            case 'headerSizeLimit':
                if (server.options[option] > 0) {
                    serverOptions['maxHeaderSize'] = server.options[option]
                }
                break;
            default:
                break;
        }
    }

    let webServer = http.createServer(serverOptions, async (req, res) => {
        let options = {}

        for (let option in server.options) {
            switch (option) {
                case 'port':
                case 'headerSizeLimit':
                    break;
                default:
                    options[option] = server.options[option]
            }
        }

        let data = {
            method: req.method,
            host: req.headers['host'],
            uri: req.url,
            headers: [],
            headersSize: 0,
            bodyInFile: false,
            body: '',
            bodySize: 0,
            ip: req.socket.remoteAddress.includes(':') ? req.socket.remoteAddress.split(':')[req.socket.remoteAddress.split(':').length - 1] : req.socket.remoteAddress,
            ts: Date.now()
        }

        if (req.headers['cf-connecting-ip']) data.ip = req.headers['cf-connecting-ip']

        if (options.urls.length > 0 && data.host !== undefined) {
            if (!options.urls.includes(data.host)) {
                res.writeHead(404)
                res.end()
                return
            }
        }

        if (options.disallowedIps.includes(data.ip)) {
            res.writeHead(404)
            res.end()
            return
        }

        if (options.allowedIps.length > 0) {
            if (!options.allowedIps.includes(data.ip)) {
                res.writeHead(404)
                res.end()
                return
            }
        }

        let isAssetRequest = false
        if (data.method === 'GET' && data.uri.includes('.')) {
            let filename = data.uri.split('/')[data.uri.split('/').length - 1]
            let regexResult = Array.from(filename.matchAll(/([a-zA-Z0-9-~:@\_\,\.]+)/g))
            if (regexResult[0] !== undefined) {
                if (regexResult[0][0] !== undefined) {
                    filename = regexResult[0][0]
                    let assetRoute = data.uri.split('/').slice(1)
                    assetRoute = assetRoute.slice(0, assetRoute.length - 1)
                    assetRoute = '/' + assetRoute.join('/')

                    for (let asset of options.assets) {
                        if (asset.route === assetRoute) {
                            isAssetRequest = true
                            try {
                                await fs.promises.access(asset.dir + '/' + filename)
                                let headers = {}
                                if (filename.includes('.svg')) {
                                    headers['Content-Type'] = 'image/svg+xml'
                                }
                                res.writeHead(200, headers)
                                fs.createReadStream(asset.dir + '/' + filename).pipe(res)
                            } catch (error) {
                                res.writeHead(404)
                                res.end()
                                return
                            }
                            break
                        }
                    }
                }
            }
        }

        if (isAssetRequest) {
            return
        }

        let routePath = data.uri.split('?')[0]
        let routeFunctions = []
        let routeBodySizeLimit = 0
        let routeBodyCache = ''
        let routeAllowedIps = []
        let routeDisallowedIps = []

        for (const before in server.befores) {
            if (data.method.toLowerCase() + '#' + routePath === before || (data.method.toLowerCase() + '#*' === before || data.method.toLowerCase() + '#/*' === before)) {
                let iterables = []

                if (data.method.toLowerCase() + '#' + routePath === before) {
                    iterables = server.befores[data.method.toLowerCase() + '#' + routePath]
                } else {
                    if (Object.prototype.toString.call(server.befores[data.method.toLowerCase() + '#*']) === '[object Array]') {
                        for (let iterable of server.befores[data.method.toLowerCase() + '#*']) {
                            iterables.push(iterable)
                        }
                    }
                    if (Object.prototype.toString.call(server.befores[data.method.toLowerCase() + '#/*']) === '[object Array]') {
                        for (let iterable of server.befores[data.method.toLowerCase() + '#/*']) {
                            iterables.push(iterable)
                        }
                    }
                }

                for (let route of iterables) {
                    routeFunctions.push(route)
                    if (route.bodySizeLimit !== 0) {
                        if (routeBodySizeLimit === 0) {
                            routeBodySizeLimit = route.bodySizeLimit
                        } else {
                            if (route.bodySizeLimit < routeBodySizeLimit) {
                                routeBodySizeLimit = route.bodySizeLimit
                            }
                        }
                    }
                    if (route.bodyCache !== '' && routeBodyCache === '') {
                        routeBodyCache = route.bodyCache
                    }
                    if (route.allowedIps.length > 0) {
                        for (let allowedIp of route.allowedIps) {
                            if (!routeAllowedIps.includes(allowedIp)) {
                                routeAllowedIps.push(allowedIp)
                            }
                        }
                    }
                    if (route.disallowedIps.length > 0) {
                        for (let disallowedIp of route.disallowedIps) {
                            if (!routeDisallowedIps.includes(disallowedIp)) {
                                routeDisallowedIps.push(disallowedIp)
                            }
                        }
                    }
                }
                break
            }
        }

        for (const route in server.routes) {
            if (data.method.toLowerCase() + '#' + routePath === route || (data.method.toLowerCase() + '#*' === route || data.method.toLowerCase() + '#/*' === route)) {
                routeFunctions.push(server.routes[route])
                if (server.routes[route].bodySizeLimit !== 0) {
                    if (routeBodySizeLimit === 0) {
                        routeBodySizeLimit = server.routes[route].bodySizeLimit
                    } else {
                        if (server.routes[route].bodySizeLimit < routeBodySizeLimit) {
                            routeBodySizeLimit = server.routes[route].bodySizeLimit
                        }
                    }
                }
                if (server.routes[route].bodyCache !== '' && routeBodyCache === '') {
                    routeBodyCache = server.routes[route].bodyCache
                }
                if (server.routes[route].allowedIps.length > 0) {
                    for (let allowedIp of server.routes[route].allowedIps) {
                        if (!routeAllowedIps.includes(allowedIp)) {
                            routeAllowedIps.push(allowedIp)
                        }
                    }
                }
                if (server.routes[route].disallowedIps.length > 0) {
                    for (let disallowedIp of server.routes[route].disallowedIps) {
                        if (!routeDisallowedIps.includes(disallowedIp)) {
                            routeDisallowedIps.push(disallowedIp)
                        }
                    }
                }
                break
            }
        }

        if (!routeFunctions.length) {
            res.writeHead(404)
            res.end()
            return
        }

        if (routeDisallowedIps.includes(data.ip)) {
            res.writeHead(404)
            res.end()
            return
        }

        if (routeAllowedIps.length > 0) {
            if (!routeAllowedIps.includes(data.ip)) {
                res.writeHead(404)
                res.end()
                return
            }
        }

        if (routeBodyCache === '') {
            routeBodyCache = server.options.bodyCache
        }

        if (routeBodyCache !== '') {
            let lib = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
            let bodyCacheFileName = ''
            for (let i = 0; i < 20; i++) {
                bodyCacheFileName += lib[Math.floor(Math.random() * ((lib.length - 1) - 0 + 1) + 0)]
            }
            data.bodyInFile = true
            data.body = routeBodyCache + '/' + bodyCacheFileName
        }

        if (!data.bodyInFile) {
            data.body = []
        }

        req.on('data', chunk => {
            data.bodySize += chunk.length
            if (data.bodySize > routeBodySizeLimit && routeBodySizeLimit !== 0) {
                res.destroy()
            } else {
                if (routeBodyCache !== '') {
                    try {
                        fs.appendFileSync(data.body, Buffer.from(chunk, 'binary'), {encoding: 'binary'})
                    } catch (error) {
                        let fullError = 'srvlight: incorrect \'http\' or \'route\' of \'before\' function arguments (\'bodyCache\' argument incorrect. Check it and be sure, that folder and file ' + routeBodyCache + ' is exists).'
                        if (server.options.errorsLogFile !== '') {
                            try {
                                fs.appendFileSync(server.options.errorsLogFile, fullError)
                            } catch (error) {
                                throw new Error('srvlight: incorrect \'http\' function arguments (\'errorsLogFile\' argument incorrect. Check it and be sure, that folder and file ' + server.options.errorsLogFile + ' is exists).')
                            }
                        }
                        throw new Error(fullError)
                    }
                } else {
                    data.body.push(Buffer.from(chunk, 'binary'))
                }
            }
        })

        let generator = async function* (functions, req, res, data) {
            for (let func of functions) {
                if (func.disallowedIps.includes(data.ip)) {
                    res.writeHead(404)
                    res.end()
                    return true
                }
                if (func.allowedIps.length) {
                    if (!func.allowedIps.includes(data.ip)) {
                        res.writeHead(404)
                        res.end()
                        return true
                    }
                }
                let resultFunction = await func.callback(req, res, data)
                if (resultFunction) {
                    yield resultFunction
                } else {
                    return resultFunction
                }
            }
        }

        req.on('end', async () => {
            if (data.bodySize <= routeBodySizeLimit || routeBodySizeLimit === 0) {
                data.headers = req.headers
                for (const headerName in req.headers) {
                    data.headersSize += headerName.length + req.headers[headerName].length + 4
                }
                
                if (!data.bodyInFile) {
                    data.body = Buffer.concat(data.body)
                }
    
                let generate = generator(routeFunctions, req, res, data)
    
                for (let routeFunction of routeFunctions) {
                    let result = await generate.next()
                    if (result.done) {
                        break
                    }
                }
            }
        })
    })

    if (server.options.requestTimeout) {
        webServer.requestTimeout = server.options.requestTimeout
    }

    if (server.options.connectionLimit) {
        webServer.maxConnections = server.options.connectionLimit
    }
    
    webServer.listen(server.options.port)
}
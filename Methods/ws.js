const srvlight = require('../index.js')
const websocket = require('ws')
const fs = require('fs')
const http = require('http')

/*
    [Example - short]:

    const srvlight = require('srvlight')

    let wsServer = srvlight.ws()

    wsServer.route({
            routes: ['/test'] // Default none, must set.
        }, async (req, res, data) => {
            res.send('Server: connection to route success.')

            res.on('message', async (body) => {
                console.log(Buffer.from(body, 'binary').toString())
            })

            setTimeout(() => {
                res.close()
            }, 10000)
        }
    )
    
    wsServer.start()
*/

srvlight.ws = function(customOptions = {}) {
    let defaultOptions = {
        urls: [],
        port: 88,
        connectionLimit: 0,
        headerSizeLimit: 16384,
        requestTimeout: 0, // It's global timeout, after this time connection will be close.
        allowedIps: [],
        disallowedIps: [],
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

    let self = new this('ws', options)

    self.routeDefaultOptions = {
        methods: ['CONNECT'],
        routes: [],
        bodySizeLimit: options.bodySizeLimit,
        allowedIps: options.allowedIps,
        disallowedIps: options.disallowedIps,
        callback: async (req, res, data) => { return true }
    }

    return self
}

srvlight.prototype.wsStart = function() {
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

    let webServer = http.createServer(serverOptions)

    if (server.options.requestTimeout) {
        webServer.requestTimeout = server.options.requestTimeout
    }

    if (server.options.connectionLimit) {
        webServer.maxConnections = server.options.connectionLimit
    }

    let websocketServer = new websocket.Server({ server: webServer })

    let data = {}

    websocketServer.on('connection', async (res, req) => {
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

        data.host = req.headers['host'].includes(':') ? req.headers['host'].split(':')[0] : req.headers['host']
        data.uri = req.url
        data.headers = req.headers
        data.headersSize = 0
        data.ip = req.socket.remoteAddress.includes(':') ? req.socket.remoteAddress.split(':')[req.socket.remoteAddress.split(':').length - 1] : req.socket.remoteAddress
        data.startTs = Date.now()

        if (req.headers['cf-connecting-ip']) data.ip = req.headers['cf-connecting-ip']

        for (const headerName in req.headers) {
            data.headersSize += headerName.length + req.headers[headerName].length + 4
        }

        if (options.urls.length > 0 && data.host !== undefined) {
            if (!options.urls.includes(data.host)) {
                res.close()
                return
            }
        }

        if (options.disallowedIps.includes(data.ip)) {
            res.close()
            return
        }

        if (options.allowedIps.length > 0) {
            if (!options.allowedIps.includes(data.ip)) {
                res.close()
                return
            }
        }

        let routePath = data.uri.split('?')[0]
        let routeFunctions = []
        let routeBodySizeLimit = 0
        let routeAllowedIps = []
        let routeDisallowedIps = []

        for (const before in server.befores) {
            if ('connect#' + routePath === before || ('connect#*' === before || 'connect#/*' === before)) {
                let iterables = []

                if ('connect#' + routePath === before) {
                    iterables = server.befores['connect#' + routePath]
                } else {
                    if (Object.prototype.toString.call(server.befores['connect#*']) === '[object Array]') {
                        for (let iterable of server.befores['connect#*']) {
                            iterables.push(iterable)
                        }
                    }
                    if (Object.prototype.toString.call(server.befores['connect#/*']) === '[object Array]') {
                        for (let iterable of server.befores['connect#/*']) {
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
            if ('connect#' + routePath === route || ('connect#*' === route || 'connect#/*' === route)) {
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
            res.close()
            return
        }

        if (routeDisallowedIps.includes(data.ip)) {
            res.close()
            return
        }

        if (routeAllowedIps.length > 0) {
            if (!routeAllowedIps.includes(data.ip)) {
                res.close()
                return
            }
        }

        let generator = async function* (functions, req, res, data) {
            for (let func of functions) {
                if (func.disallowedIps.includes(data.ip)) {
                    res.close()
                    return true
                }
                if (func.allowedIps.length) {
                    if (!func.allowedIps.includes(data.ip)) {
                        res.close()
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

        let generate = generator(routeFunctions, req, res, data)

        for (let routeFunction of routeFunctions) {
            let result = await generate.next()
            if (result.done) {
                break
            }
        }
    })

    webServer.listen(server.options.port)

    srvlight.prototype.wsStop = function() {
        webServer.close(() => {})
    }
}
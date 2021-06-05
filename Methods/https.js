const fs = require('fs')
const https = require('https')
const srvlight = require('../index.js')

/*
    [Example - short]:

    const srvlight = require('srvlight')

    let httpsServer = srvlight.https({
        key: __dirname + '/SSL/key.pem', // Default: none, must set.
        cert: __dirname + '/SSL/cert.pem', // Default: none, must set.
    })

    httpsServer.route({
            method: 'POST', // Default none, must set. Can be GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH.
            route: '/test', // Default none, must set.
        }, async (req, res, data) => {
            console.log('Route: start (after all \'before\').')
            console.log('Protocol:', data.protocol)
            console.log('Host:', data.host)
            console.log('Port:', data.port)
            console.log('Uri :', data.uri)
            console.log('Method:', data.method)
            console.log('Headers:', data.headers)
            console.log('Headers size:', data.headersSize)
            console.log('Is body in file:', data.bodyInFile)
            console.log('Body:', data.body) // If data.bodyInFile is true, data.body = path to file.
            if (!data.bodyInFile) {
                console.log('Body (string):', Buffer.from(data.body, 'binary').toString())
            }
            console.log('Body size:', data.bodySize)
            console.log('Ip:', data.ip)

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            })
            res.end('OK')
        }
    )

    httpsServer.start()

    [Example - full]:

    const srvlight = require('srvlight')

    let httpsServer = srvlight.https({
        key: __dirname + '/SSL/key.pem', // Default: none, must set.
        cert: __dirname + '/SSL/cert.pem', // Default: none, must set.
        urls: [], // Default: [] (empty). If empty - any urls. Can be (example): ['mysite.com', 'www.mysite.com']
        port: 443, // Default: 443.
        connectionLimit: 10, // Default: 0. If 0 - no limit.
        headerSizeLimit: 8192, // Default: 16384 Bytes.
        bodySizeLimit: 10240, // Default: 0 Bytes. If 0 - no limit.
        requestTimeout: 5000, // Default: 120000 milliseconds.
        allowedIps: [], // Default: [] (empty). If empty - all IPs allowed.
        disallowedIps: [], // Default: [] (empty). If empty - didn't block any IP.
        assets: [
            {route: '/assets', dir: __dirname + '/assets'},
            {route: '/assets/images', dir: __dirname + '/assets/bestImages'},
        ] // Default: [] (empty). For assets folders. dir parameter must be final directory.
    })

    httpsServer.before([
            {
                method: 'POST', // Default none, must set. Can be GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH.
                route: '/test', // Default none, must set.
                bodySizeLimit: 4092, // Default: 0 Bytes. If 0 - no limit.
                allowedIps: [], // Default: [] (empty). If empty - all IPs allowed.
                disallowedIps: [], // Default: [] (empty). If empty - didn't block any IP.
                bodyCache: '', // Default ''. If you need save body to file - select path to any exist folder.
            }
        ], async (req, res, data) => {
            console.log('Before: first.')
            return true // Must return true, for make next 'before' function or route (if it last 'before').
        }
    )
    
    httpsServer.before([
            {
                method: 'GET', // Default none, must set. Can be GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH.
                route: '/test', // Default none, must set.
                bodySizeLimit: 4092, // Default: 0 Bytes. If 0 - no limit.
                allowedIps: [], // Default: [] (empty). If empty - all IPs allowed.
                disallowedIps: [], // Default: [] (empty). If empty - didn't block any IP.
                bodyCache: '', // Default ''. If you need save body to file - select path to any exist folder.
            },
            {
                method: 'POST', // Default none, must set. Can be GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH.
                route: '/test', // Default none, must set.
                bodySizeLimit: 4092, // Default: 0 Bytes. If 0 - no limit.
                allowedIps: [], // Default: [] (empty). If empty - all IPs allowed.
                disallowedIps: [], // Default: [] (empty). If empty - didn't block any IP.
                bodyCache: '', // Default ''. If you need save body to file - select path to any exist folder.
            },
        ], async (req, res, data) => {
            console.log('Before: second.')
            return true // Must return true, for make next 'before' function or route (if it last 'before').
        }
    )

    httpsServer.route({
            method: 'POST', // Default none, must set. Can be GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH.
            route: '/test', // Default none, must set.
            bodySizeLimit: 4092, // Default: 0 Bytes. If 0 - no limit.
            allowedIps: [], // Default: [] (empty). If empty - all IPs allowed.
            disallowedIps: [], // Default: [] (empty). If empty - didn't block any IP.
            bodyCache: '', // Default ''. If you need save body to file - select path to any exist folder.
        }, async (req, res, data) => {
            console.log('Route: start (after all \'before\').')
            console.log('Protocol:', data.protocol)
            console.log('Host:', data.host)
            console.log('Port:', data.port)
            console.log('Uri :', data.uri)
            console.log('Method:', data.method)
            console.log('Headers:', data.headers)
            console.log('Headers size:', data.headersSize)
            console.log('Is body in file:', data.bodyInFile)
            console.log('Body:', data.body) // If data.bodyInFile is true, data.body = path to file.
            if (!data.bodyInFile) {
                console.log('Body (string):', Buffer.from(data.body, 'binary').toString())
            }
            console.log('Body size:', data.bodySize)
            console.log('Ip:', data.ip)

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            })
            res.end('OK')
        }
    )

    httpsServer.start()
*/

srvlight.https = function(customOptions = {}) {
    let defaultOptions = {
        key: '',
        cert: '',
        urls: [],
        port: 443,
        connectionLimit: 0,
        headerSizeLimit: 16384,
        bodySizeLimit: 0,
        bodyCache: '',
        requestTimeout: 120000,
        allowedIps: [],
        disallowedIps: [],
        assets: []
    }

    let options = {}

    for (const defaultOption in defaultOptions) {
        if (typeof(defaultOptions[defaultOption]) === typeof(customOptions[defaultOption])) {
            options[defaultOption] = customOptions[defaultOption]
        } else {
            options[defaultOption] = defaultOptions[defaultOption]
        }
    }

    if (options.key === '' || options.sert === '') {
        throw new Error('srvlight: incorrect \'https\' function arguments (\'key\' or/and \'sert\' arguments didn\'t set).')
    }

    let self = new this('https', options)

    self.routeDefaultOptions = {
        method: '',
        route: '',
        bodySizeLimit: options.bodySizeLimit,
        bodyCache: '',
        allowedIps: options.allowedIps,
        disallowedIps: options.disallowedIps,
        callback: async (req, res, data) => {return true}
    }

    return self
}

srvlight.prototype.httpsStart = function() {
    let server = this

    let serverOptions = {}

    for (const option in server.options) {
        switch (option) {
            case 'key':
            case 'cert':
                serverOptions[option] = fs.readFileSync(server.options[option])
                break;
            case 'headerSizeLimit':
                if (server.options[option] > 0) {
                    serverOptions['maxHeaderSize'] = server.options[option]
                }
                break;
            default:
                break;
        }
    }

    let webServer = https.createServer(serverOptions, async (req, res) => {
        let options = {}

        for (let option in server.options) {
            switch (option) {
                case 'key':
                case 'cert':
                case 'port':
                case 'headerSizeLimit':
                    break;
                default:
                    options[option] = server.options[option]
            }
        }

        let data = {
            protocol: 'https',
            host: req.headers['host'],
            port: server.options.port,
            uri: req.url,
            method: req.method,
            headers: [],
            headersSize: 0,
            bodyInFile: false,
            body: '',
            bodySize: 0,
            ip: req.socket.remoteAddress.includes(':') ? req.socket.remoteAddress.split(':')[req.socket.remoteAddress.split(':').length - 1] : req.socket.remoteAddress
        }

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
            let regexResult = Array.from(filename.matchAll(/([a-zA-Z0-9\_\,\.]+)/g))
            if (regexResult[0] !== undefined) {
                if (regexResult[0][0] !== undefined) {
                    filename = regexResult[0][0]
                    let assetRoute = data.uri.split('/')
                    if (assetRoute.length >= 2) {
                        assetRoute = '/' + assetRoute[1]
                    } else {
                        assetRoute = '/'
                    }
                    for (let asset of options.assets) {
                        if (asset.route === assetRoute) {
                            isAssetRequest = true
                            fs.access(asset.dir + '/' + filename, fs.F_OK, (err) => {
                                if (err) {
                                    res.writeHead(404)
                                    res.end()
                                    return
                                }
                                res.writeHead(200)
                                fs.createReadStream(asset.dir + '/' + filename).pipe(res)
                            })
                            break
                        }
                    }
                }
            }
        }

        if (isAssetRequest) {
            return
        }

        let incomeRoute = data.uri.split('?')[0]
        let functions = []
        let bodySizeLimit = 0
        let bodyCache = ''

        for (const before in server.befores) {
            if (data.method.toLowerCase() + '#' + incomeRoute === before) {
                for (let route of server.befores[data.method.toLowerCase() + '#' + incomeRoute]) {
                    functions.push(route)
                    if (route.bodySizeLimit !== 0) {
                        if (bodySizeLimit === 0) {
                            bodySizeLimit = route.bodySizeLimit
                        } else {
                            if (route.bodySizeLimit < bodySizeLimit) {
                                bodySizeLimit = route.bodySizeLimit
                            }
                        }
                    }
                    if (route.bodyCache !== '' && bodyCache === '') {
                        bodyCache = route.bodyCache
                    }
                }
                break
            }
        }

        for (const route in server.routes) {
            if (data.method.toLowerCase() + '#' + incomeRoute === route) {
                functions.push(server.routes[route])
                if (server.routes[route].bodySizeLimit !== 0) {
                    if (bodySizeLimit === 0) {
                        bodySizeLimit = server.routes[route].bodySizeLimit
                    } else {
                        if (server.routes[route].bodySizeLimit < bodySizeLimit) {
                            bodySizeLimit = server.routes[route].bodySizeLimit
                        }
                    }
                }
                if (server.routes[route].bodyCache !== '' && bodyCache === '') {
                    bodyCache = server.routes[route].bodyCache
                }
                break
            }
        }

        if (!functions.length) {
            res.writeHead(404)
            res.end()
            return
        }

        if (bodyCache !== '') {
            let lib = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
            let bodyCacheFileName = ''
            for (let i = 0; i < 20; i++) {
                bodyCacheFileName += lib[Math.floor(Math.random() * ((lib.length - 1) - 0 + 1) + 0)]
            }
            data.bodyInFile = true
            data.body = bodyCache + '/' + bodyCacheFileName
        }

        if (!data.bodyInFile) {
            data.body = []
        }

        req.on('data', chunk => {
            data.bodySize += chunk.length
            if (data.bodySize > bodySizeLimit && bodySizeLimit !== 0) {
                res.destroy()
            } else {
                if (bodyCache !== '') {
                    fs.appendFile(data.body, Buffer.from(chunk, 'binary'), {encoding: 'binary'}, function (err) {
                        if (err) {
                            throw new Error('srvlight: incorrect \'route\' of \'before\' function arguments (\'bodyCache\' argument incorrect. Check it and be sure, that folder ' + server.options.bodyCache + ' is exists).')
                        }
                    })
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
            data.headers = req.headers
            data.headersSize = JSON.stringify(req.headers).length
            if (!data.bodyInFile) {
                data.body = Buffer.concat(data.body)
            }

            let generate = generator(functions, req, res, data)

            for (let func of functions) {
                let result = await generate.next()
                if (result.done) {
                    break
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
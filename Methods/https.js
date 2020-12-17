const fs = require('fs')
const https = require('https')
const tl = require('toolslight')
const srvlight = require('../index.js')

srvlight.https = function(customOptions = {}) {
    const options = {
        url: 'any',
        port: 443,
        cert: __dirname + '/SSL/cert.pem',
        key: __dirname + '/SSL/key.pem',
        max_headers_size_bytes: 16384, // default in nodejs is 16384 bytes
        bodySizeLimit: 32612, // 1 chunk in nodejs is 32613 bytes
        request_timeout_ms: 10000,
        response_timeout_ms: 10000,
        available_ips: [],
        unavailable_ips: [],
        available_methods: ['GET','POST','PUT','DELETE']
    }

    for (const customOption of Object.keys(customOptions)) {
        options[customOption] = customOptions[customOption]
    }

    return new this('https', options)
}

srvlight.prototype.httpsStart = function() {
    let server = this

    let options = {}
    for (const option of Object.keys(server.options)) {
        if (option === 'max_headers_size_bytes') {
            options[option] = server.options[option]
        }
        if (option === 'cert' || option === 'key') {
          options[option] = fs.readFileSync(server.options[option])
        }
    }

    https.createServer(options, (req, res) => {
        let options = {}
        let routePath = ''

        for (let option of Object.keys(server.options)) {
            if (option === 'cert' || option === 'key' || option === 'max_headers_size_bytes') {
                continue
            }
            options[option] = server.options[option]
        }

        for (let routeNumber of Object.keys(server.routes)) {
            if (server.routes[routeNumber].path === req.url) {
                routePath = server.routes[routeNumber].path
                for (let option of Object.keys(server.routes[routeNumber].options)) {
                    options[option] = server.routes[routeNumber].options[option]
                }
                break
            }
        }

        let isValidRequest = true
        // Найден ли роут.
        if (tl.isEmpty(routePath)) {
            isValidRequest = false
            res.writeHead(404)
            res.end()
        }
        
        // Жив ли сокет
        if (tl.isEmpty(req.socket.remoteAddress)) {
            isValidRequest = false
            res.writeHead(404)
            res.end()   
        }
        
        // Допустимый ли метод
        // Допустимый ли протокол (возможно суть с методом одна и та же)
        // Совпадает ли урл
        // Совпадает ли порт
        // Находится ли он в списке допустимых IP (если список не пуст)
        // Находится ли он в списке заблокированных IP (если список не пуст)
        // Не превышает ли запрос макс. кол-во байт
        // Не превышает ли запрос макс. кол-во секунд
        // Не привышает ли ответ макс. кол-во секунд

        let request = {
            headers: {},
            headersSize: 0,
            body: '',
            bodySize: 0,
            ip: ''
        }

        req.on('data', chunk => {
            request.bodySize += chunk.length
            if (request.bodySize > options.bodySizeLimit) {
                isValidRequest = false
                res.destroy()
            } else {
                request.body += chunk.toString()
            }
        })
        
        req.on('end', () => {
            if (isValidRequest) {
                request.headers = req.headers
                request.headersSize = JSON.stringify(req.headers).length

                request.ip = req.socket.remoteAddress
                if (request.ip.includes(':')) {
                    request.ip = request.ip.split(':')
                    request.ip = request.ip[request.ip.length - 1]
                }
                
                server.emit('before', request, res)
                if (!tl.isEmpty(routePath)) {
                    server.emit(routePath, request, res)
                }
                server.emit('after', request, res)
            }
        })
    }).listen(server.options.port)
}
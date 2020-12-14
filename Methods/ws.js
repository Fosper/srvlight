const fs = require('fs')
const http = require('http')
const websocket = require('ws')
const tl = require('toolslight')
const srvlight = require('../index.js')

srvlight.ws = function(customOptions = {}) {
    const options = {
        url: 'any',
        port: 88,
        max_headers_size_bytes: 16384, // default in nodejs is 16384 bytes
        max_body_size_bytes: 32612, // 1 chunk in nodejs is 32613 bytes
        request_timeout_ms: 10000,
        response_timeout_ms: 10000,
        available_ips: [],
        unavailable_ips: [],
        available_methods: ['GET','POST','PUT','DELETE']
    }

    for (const customOption of Object.keys(customOptions)) {
        options[customOption] = customOptions[customOption]
    }

    return new this('ws', options)
}

srvlight.prototype.wsStart = function() {
    let server = this

    let options = {}
    for (const option of Object.keys(server.options)) {
        if (option === 'max_headers_size_bytes') {
            options[option] = server.options[option]
        }
    }

    const webserver = http.createServer()
    const ws = new websocket.Server({ server: webserver })

    ws.on('connection', async function connection(res, req) {
        let options = {}
        let routePath = ''

        for (let option of Object.keys(server.options)) {
            if (option === 'max_headers_size_bytes') {
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
            bodySize: 0
        }

        res.on('message', function incoming(body) {
            if (isValidRequest) {
                request.headers = req.headers
                request.headersSize = req.headers.length
                request.body = body
                request.bodySize = body.length

                server.emit('before', request, res)
                if (!tl.isEmpty(routePath)) {
                    server.emit(routePath, request, res)
                }
                server.emit('after', request, res)
            }
        })    
    })
    
    webserver.listen(server.options.port)
}
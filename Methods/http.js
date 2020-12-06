const fs = require('fs')
const http = require('http')
const tl = require('toolslight')
const srvlight = require('../index.js')

srvlight.http = function(customOptions = {}) {
    const options = {
        url: 'any',
        port: 80,
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

    return new this('http', options)
}

srvlight.prototype.httpStart = function() {
    let server = this

    let options = {}
    for (const option of Object.keys(server.options)) {
        if (option === 'max_headers_size_bytes') {
            options[option] = server.options[option]
        }
    }

    http.createServer(options, (req, res) => {
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
            data: '',
            size: 0
        }

        req.on('data', chunk => {
            request.size += chunk.length
            if (request.size > options.max_body_size_bytes) {
                isValidRequest = false
                res.destroy()
            } else {
                request.data += chunk.toString()
            }
        })
        
        req.on('end', () => {
            if (isValidRequest) {
                request.headers = req.headers
                server.emit('before', request, res)
                if (!tl.isEmpty(routePath)) {
                    server.emit(routePath, request, res)
                }
                server.emit('after', request, res)
            }
        })
    }).listen(server.options.port)
}
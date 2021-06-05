const fs = require('fs')
const toolslight = require('../index.js')

toolslight.request = function(customOptions = {}) {

  /*

    Returns object:
    {
      request: {
        headers: (string)
        headersSize: (number)
        body: (string)
        bodySize: (number)
      },
      response: {
        headers: (string)
        headersSize: (number)
        body: (string)
        bodySize: (number)
      }
    }

    OR
    
    WebSocket connect (object)

    Example:
    var requestOptions = {
      method: 'GET', // Can be 'GET', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS'
      protocol: 'https', // Can be 'http', 'https', 'ws', 'wss'.
      host: 'google.com',
      port: 443,
      path: '/',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({field: '123'}),
      timeout: 5000, // In milliseconds (1000 = 1 second).
      bodySizeLimit: 10240,
      bodyEncoding: 'utf8', // utf8 or binary
      saveTo: '', // If set full file path - create/replace file, and save body response to this file.
      errorPrefix: '' // Custom prefix for errors (can use project unique identifier).
    }

    var err, data
    [err, data] = await toolslight.request(requestOptions)
    if (err) {
      console.log(err)
      return
    }
    console.log(data)

    Content-Type example:
    application/json - if body is json
    multipart/form-data - for file upload
    application/x-www-form-urlencoded - if body is fields like parameter=value&also=another
  */

  return this.to(new Promise((resolve, reject) => {

    let result = {
      request: {
        method: '',
        protocol: '',
        host: '',
        port: 0,
        path: '',
        headers: '',
        headersSize: 0,
        body: '',
        bodySize: 0
      },
      response: {
        statusCode: 200,
        headers: '',
        headersSize: 0,
        body: '',
        bodySize: 0
      }
    }

    let defaultOptions = {
      method: 'GET',
      protocol: 'https',
      host: 'google.com',
      port: 443,
      path: '/',
      headers: {},
      body: '',
      timeout: 5000,
      bodySizeLimit: 10240,
      bodyEncoding: 'utf8',
      proxyHost: '',
      proxyPort: 8080,
      proxyUsername: '',
      proxyPassword: '',
      proxyTimeout: 5000,
      localAddress: '',
      saveTo: '',
      errorPrefix: ''
    }

    let options = {}

    for (let option of Object.keys(defaultOptions)) {
      if (!this.isEmpty(customOptions[option])) {
        options[option] = customOptions[option]
        continue
      }
      options[option] = defaultOptions[option]
    }

    result.request.method = options.method
    result.request.protocol = options.protocol
    result.request.host = options.host
    result.request.port = options.port
    result.request.path = options.path
    result.request.headers = options.headers
    result.request.headersSize = JSON.stringify(options.headers).length - 2

    if (!this.isEmpty(options.body)) {
      result.request.body = options.body
      result.request.bodySize = options.body.length
    }

    let library
    if (options.protocol === 'https') {
      library = require('https')
    } else if (options.protocol === 'http') {
      library = require('http')
    } else if (options.protocol === 'ws' || options.protocol === 'wss') {
      const WebSocket = require('ws')
      let wsUrl = options.protocol + '://' + options.host + ':' + options.port + options.path
      let wsOptions = {
        timeout: options.timeout,
        rejectUnauthorized: false
      }

      if (!this.isEmpty(options.proxyHost)) {
        const url = require('url')
        const HttpsProxyAgent = require('https-proxy-agent')

        let proxyUrl = 'http://' + options.proxyHost + ':' + options.proxyPort
        let agentOptions = url.parse(proxyUrl)
        agentOptions.timeout = options.timeout

        if (!this.isEmpty(options.proxyUsername) || !this.isEmpty(options.proxyPassword)) {
          agentOptions.headers = {}
          agentOptions.headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(options.proxyUsername + ':' + options.proxyPassword).toString('base64')
        }

        let agent = new HttpsProxyAgent(agentOptions)
        wsOptions.agent = agent
      }
      let ws = new WebSocket(wsUrl, wsOptions)

      resolve(ws)

      // ws.on('open', function open() {
      //   ws.send(options.body);
      // })
      // ws.on('message', function incoming(data) {
      //   result.response.body = data
      //   resolve(result)
      // })
      return
    }

    if (this.isEmpty(library)) {
      reject(options.errorPrefix + 'Toolslight (request): Incorrect protocol.')
    }

    let start = (requestOptions, connect = {}) => {
      var req = library.request(requestOptions, res => {
        if (!this.isEmpty(options.saveTo) || options.bodyEncoding === 'binary') {
          res.setEncoding('binary')
          result.response.body = []
        } else {
          res.setEncoding('utf8')
        }

        res.on('data', (chunk) => {
            result.response.bodySize += chunk.length
  
            if (result.response.bodySize > options.bodySizeLimit) {
                res.destroy()
                reject(options.errorPrefix + 'Toolslight (request): Response body size more than ' + options.bodySizeLimit + ' bytes.')
            } else {
              if (!this.isEmpty(options.saveTo) || options.bodyEncoding === 'binary') {
                result.response.body.push(Buffer.from(chunk, 'binary'))
              } else {
                result.response.body += chunk.toString()
              }
            }
        })
  
        res.on('end', () => {
            if (!this.isEmpty(connect)) {
              connect.abort()
            }

            if (!this.isEmpty(options.saveTo) || options.bodyEncoding === 'binary') {
              result.response.body = Buffer.concat(result.response.body)
            }

            if (!this.isEmpty(options.saveTo)) {
              try {
                fs.writeFileSync(options.saveTo, result.response.body)
                resolve(result)
              } catch (err) {
                reject(options.errorPrefix + err)
              }

              // fs.writeFile(options.saveTo, result.response.body, function (err) {
              //   if (err) {
              //     reject(options.errorPrefix + err)
              //   }
              //   resolve(result)
              // })
            } else {
              resolve(result)
            }
        })
      })
  
      req.on('response', response => {
        result.response.statusCode = response.statusCode
        result.response.headers = response.headers
        result.response.headersSize = response.headers.length
      })

      req.on('timeout', () => {
        req.abort()
        if (!this.isEmpty(connect)) {
          connect.abort()
        }
        reject(options.errorPrefix + 'Toolslight (request): Post request timeout.')
      })
  
      req.on('error', err => {
        if (!this.isEmpty(options.saveTo)) {
          try {
            fs.unlinkSync(options.saveTo)
          } catch(err) {

          }
        }
        if (!this.isEmpty(connect)) {
          connect.abort()
        }
        reject(options.errorPrefix + err)
      })
      
      if (!this.isEmpty(options.body)) {
        req.write(options.body)
      }
  
      req.end()
    }

    let requestOptions = {
      method: options.method,
      host: options.host,
      port: options.port,
      path: options.path,
      headers: options.headers,
      timeout: options.timeout,
      rejectUnauthorized: false
      // requestCert: true
    }

    if (!this.isEmpty(options.localAddress)) {
      requestOptions.localAddress = options.localAddress
    }

    if (!this.isEmpty(options.proxyHost)) {
      const http = require('http')

      let proxyRequestOptions = {
        host: options.proxyHost,
        port: options.proxyPort,
        method: 'CONNECT',
        path: options.host + ':' + options.port,
        timeout: options.proxyTimeout
      }

      if (!this.isEmpty(options.proxyUsername) || !this.isEmpty(options.proxyPassword)) {
        proxyRequestOptions.headers = {}
        proxyRequestOptions.headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(options.proxyUsername + ':' + options.proxyPassword).toString('base64')
      }

      let connect = http.request(proxyRequestOptions).on('connect', function(res, socket, head) {
        requestOptions.socket = socket
        start(requestOptions, connect)
      }).on('timeout', () => {
        connect.abort()
        reject(options.errorPrefix + 'Toolslight (request): Proxy host timeout.')
      }).on('error', err => {
        connect.abort()
        reject(options.errorPrefix + err)
      }).end()
    } else {
      start(requestOptions)
    }
  }))
}
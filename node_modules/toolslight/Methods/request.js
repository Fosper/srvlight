const toolslight = require('../index.js')
const stream = require('stream')
const zlib = require('zlib')
const fs = require('fs')

toolslight.request = function(customOptions = {}) {

  /*

    Returns object for 'http' and 'https' protocols:
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

    Returns object for 'ws' and 'wss' protocol:
    WebSocket connect (object)

    Example:
    var requestOptions = {
      method: 'GET', // Can be 'GET', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'HEAD', 'PATCH'.
      protocol: 'https', // Can be 'http', 'https', 'ws', 'wss'.
      host: 'google.com',
      port: 443,
      path: '/',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({field: '123'}),
      formData: {},
      timeout: 5000, // In milliseconds (1000 = 1 second).
      bodySizeLimit: 10240,
      bodyEncoding: 'utf8', // utf8 or binary
      proxyHost: '127.0.0.1',
      proxyPort: 8080,
      proxyUsername: 'kekus',
      proxyPassword: 'mekus',
      proxyTimeout: 5000,
      localAddress: '1.2.3.4',
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
      formData: {},
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

    for (const defaultOption in defaultOptions) {
      if (Object.prototype.toString.call(defaultOptions[defaultOption]) === Object.prototype.toString.call(customOptions[defaultOption])) {
          options[defaultOption] = customOptions[defaultOption]
      } else {
          options[defaultOption] = defaultOptions[defaultOption]
      }
    }

    let mimeTypes = {
      json: 'application/json',
      pdf: 'application/pdf',
      zip: 'application/zip',
      gzip: 'application/gzip',
      rar: 'application/x-rar-compressed',
      tar: 'application/x-tar',
      torrent: 'application/x-bittorrent',
      doc: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      docx: 'application/msword',
      xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsx: 'application/vnd.ms-excel',
      xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
      ppt: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pptx: 'application/vnd.ms-powerpoint',
      dvi: 'application/x-dvi',
      ttf: 'application/x-font-ttf',
      p12: 'application/x-pkcs12',
      pfx: 'application/x-pkcs12',
      p7b: 'application/x-pkcs7-certificates',
      spc: 'application/x-pkcs7-certificates',
      p7r: 'application/x-pkcs7-certreqresp',
      p7c: 'application/x-pkcs7-mime',
      p7m: 'application/x-pkcs7-mim',
      p7s: 'application/x-pkcs7-signature',
      mp3: 'audio/mpeg',
      aac: 'audio/aac',
      ogg: 'audio/ogg',
      gif: 'image/gif',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      svg: 'image/svg+xml',
      tiff: 'image/tiff',
      ico: 'image/vnd.microsoft.icon',
      wbmp: 'image/vnd.wap.wbmp',
      cmd: 'text/cmd',
      css: 'text/css',
      csv: 'text/csv',
      html: 'text/html',
      js: 'text/javascript',
      txt: 'text/plain',
      php: 'text/php',
      xml: 'text/xml',
      mpeg: 'video/mpeg',
      mp4: 'video/mp4',
      webm: 'video/webm',
      flv: 'video/x-flv',
      avi: 'video/x-msvideo',
      '3gpp': 'video/3gpp',
      '3gp': 'video/3gpp',
      '3gpp2': 'video/3gpp2',
      '3g2': 'video/3gpp2'
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

    options.boundary = ''
    if (Object.keys(options.formData).length > 0) {
      options.boundary = '--------------------------'
      for (let i = 0; i < 24; i++) {
        options.boundary += Math.floor(Math.random() * 10).toString(16);
      }
    }

    let start = async (requestOptions, connect = {}) => {
      var req = library.request(requestOptions, (res) => {
        let output
        switch (res.headers['content-encoding']) {
            case 'br':
                let br = zlib.createBrotliDecompress()
                res.pipe(br)
                output = br
                break
            case 'gzip':
                let gzip = zlib.createGunzip()
                res.pipe(gzip)
                output = gzip
                break
            case 'deflate':
                let deflate = zlib.createInflate()
                res.pipe(deflate)
                output = deflate
                break
            default:
                output = res
                break
        }
        
        if (!this.isEmpty(options.saveTo) || options.bodyEncoding === 'binary') {
          res.setEncoding('binary')
          result.response.body = []
        } else {
          res.setEncoding('utf8')
        }

        output.on('data', (chunk) => {
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
  
        output.on('end', () => {
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
            } else {
              resolve(result)
            }
        })
      })
  
      req.on('response', response => {
        result.response.statusCode = response.statusCode
        result.response.headers = response.headers
        result.response.headersSize = JSON.stringify(response.headers).length
      })

      req.on('timeout', () => {
        req.abort()
        if (!this.isEmpty(connect)) {
          connect.abort()
        }
        reject(options.errorPrefix + 'Toolslight (request): Request timeout.')
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

      if (options.body && !(options.body instanceof stream.Readable) && !Object.keys(options.formData).length) {
        req.write(options.body)
        req.end()
      } else if (options.body instanceof stream.Readable) {
        options.body.pipe(req)
      } else if (Object.keys(options.formData).length > 0) {

        /*
          FUNCTION FOR SYNC SEND DATA FROM READ-STREAM TO REQ:
        */

        let sendBodySync = (boundary, formDataName, formDataValue, isStart, isEnd, writeStream) => {
          return new Promise((resolve) => {
            
              /*
                BODY HEADER CREATE STREAM:
              */

              let bodyHead = ''
              if (!isStart) {
                  bodyHead += '\r\n'
              }
              bodyHead += '--' + boundary + '\r\n'
  
              if (typeof(formDataValue) !== 'object') {
                  bodyHead += 'Content-Disposition: form-data; name="' + formDataName + '"' + '\r\n\r\n'
              } else {
                  let fileName = formDataValue.path.split('/')[formDataValue.path.split('/').length - 1]
                  let fileExt = fileName.split('.')
                  let bodyHeadContentType = mimeTypes[fileExt]
                  if (!bodyHeadContentType) {
                    bodyHeadContentType = mimeTypes.txt
                  }
                  bodyHead += 'Content-Disposition: form-data; name="' + formDataName + '"; filename="' + formDataValue.path.split('/')[formDataValue.path.split('/').length - 1] + '"' + '\r\n'
                  bodyHead += 'Content-Type: ' + bodyHeadContentType + '\r\n\r\n'
              }
              let bodyHeadStream = stream.Readable.from(Buffer.from(bodyHead))
  
              bodyHeadStream.on('end', () => {

                  /*
                    BODY DATA CREATE STREAM:
                  */

                  let bodyDataStream
                  if (typeof(formDataValue) !== 'object') {
                      bodyDataStream = stream.Readable.from(Buffer.from(formDataValue.toString()))
                  } else {
                      bodyDataStream = formDataValue
                  }
      
                  bodyDataStream.on('end', () => {
                      if (isEnd) {

                          /*
                            BODY FOOTER CREATE STREAM:
                          */

                          let bodyFooterStream = stream.Readable.from(Buffer.from('\r\n' + '--' + boundary + '--'))
  
                          bodyFooterStream.on('end', () => {
                              resolve(writeStream)
                          })

                         /*
                            BODY FOOTER SEND STREAM:
                          */

                          bodyFooterStream.pipe(writeStream)
                      } else {
                          resolve(writeStream)
                      }
                  })
      
                  /*
                    BODY DATA SEND STREAM:
                  */

                  bodyDataStream.pipe(writeStream, {end: false})
              })
  
              /*
                BODY HEADER SEND STREAM:
              */

              bodyHeadStream.pipe(writeStream, {end: false})
          })
        }

        let i = 0
        for (const formDataName in options.formData) {
            i++
            let isStart = i === 1 ? true : false
            let isEnd = i === Object.keys(options.formData).length ? true : false

            let formDataValue = options.formData[formDataName]
            if (formDataValue === undefined) {
              formDataValue = ''
            }
            await sendBodySync(options.boundary, formDataName, formDataValue, isStart, isEnd, req)
        }
      }
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

    if (options.body instanceof stream.Readable && !requestOptions.headers['Content-Type']) {
      let fileName = options.body.path.split('/')[options.body.path.split('/').length - 1]
      let fileExt = fileName.split('.')
      let contentType = mimeTypes[fileExt]
      if (!contentType) {
        contentType = mimeTypes.txt
      }
      requestOptions.headers['Content-Type'] = contentType
    }

    if (Object.keys(options.formData).length > 0) {
      requestOptions.headers['Content-Type'] = 'multipart/form-data; boundary=' + options.boundary
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
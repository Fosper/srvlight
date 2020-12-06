
const https = require('https')
const toolslight = require('../index.js')

toolslight.post = function(url, port, path, headers, body, timeout, errorPrefix = '') {

  /*

    Returns object:
    {
      request (body argument),
      response (string)
    }

    Example:
    await .post('api.telegram.org', '443', '/sendMessage', {'Content-Type': 'application/json'}, JSON.stringfy({'chat_id: 123'}), 5000)
  */

  return new Promise((resolve, reject) => {

    let result = {
      request: body,
      response: ''
    }

    let options = {
        hostname: url,
        port: port,
        path: path,
        method: 'POST',
        headers: headers,
        timeout: timeout
    }

    let request = https.request(options, response => {
      let responseBody = ''

      response.on('data', (chunk) => {
          responseBody += chunk.toString()
      })

      request.on('timeout', () => {
          result.response = errorPrefix + 'Toolslight: Post request timeout.'
          request.abort()
          resolve(result)
      })

      response.on('end', () => {
          result.response = responseBody
          resolve(result);
      })
    })

    request.on('error', (error) => {
        result.response = errorPrefix + error
        reject(result)
    })

    request.write(body)

    request.end()
  })
}

const toolslight = require('../index.js')

toolslight.isProxyAvailable = function(customOptions = {}) {

    /*
        Returns promise.

        Example for synchronous execution:
        const toolslight = require('toolslight')

        console.log(await toolslight.isProxyAvailable({
            protocol: 'https', // Default: 'https'. Can be 'http' or 'https' or 'socks'.
            host: '127.0.0.1', // Default '127.0.0.1'. Proxy host.
            port: 3000, // Default 3000. Proxy port.
            username: 'myUsername', // Default ''. Proxy username. Don't set, if not need.
            password: 'myPassword', // Default ''. Proxy password. Don't set, if not need.
            endpointProtocol: 'https', // Default: 'https'. Can be 'http' or 'https'.
            timeout: 2000 // Default 2000. Timeout in milliseconds.
        }))

        Example for asynchronous execution:
        const toolslight = require('toolslight')

        toolslight.isProxyAvailable({
            protocol: 'https', // Default: 'https'. Can be 'http' or 'https' or 'socks'.
            host: '127.0.0.1', // Default '127.0.0.1'. Proxy host.
            port: 3000, // Default 3000. Proxy port.
            username: 'myUsername', // Default ''. Proxy username. Don't set, if not need.
            password: 'myPassword', // Default ''. Proxy password. Don't set, if not need.
            endpointProtocol: 'https', // Default: 'https'. Can be 'http' or 'https'.
            timeout: 2000 // Default 2000. Timeout in milliseconds.
        }).then((result) => {console.log(result)})
    */

    let defaultOptions = {
        protocol: 'https',
        host: '127.0.0.1',
        port: 3000,
        username: '',
        password: '',
        endpointProtocol: 'https',
        timeout: 2000
    }

    let options = {}

    for (const defaultOption in defaultOptions) {
        if (Object.prototype.toString.call(defaultOptions[defaultOption]) === Object.prototype.toString.call(customOptions[defaultOption])) {
            options[defaultOption] = customOptions[defaultOption]
        } else {
            options[defaultOption] = defaultOptions[defaultOption]
        }
    }

    let endpointHost = 'google.com'

    return new Promise((resolve) => {
        let requestLibrary = options.endpointProtocol === 'http' ? require('http') : require('https')
        let proxyLibrary = options.protocol === 'socks' ? require('socks-proxy-agent') : options.endpointProtocol === 'https' ? require('https-proxy-agent') : require('http-proxy-agent')

        let proxyOptions = {
            protocol: options.protocol + ':',
            slashes: true,
            auth: null,
            host: options.host + ':' + options.port,
            port: options.port.toString(),
            hostname: options.host,
            hash: null,
            search: null,
            query: null,
            pathname: '/',
            path: '/',
            href: options.protocol + '://' + options.host + ':' + options.port + '/'
        }
        if (options.username && options.password) {
            proxyOptions.auth = options.username + ':' + options.password
        }

        let proxyAgent = new proxyLibrary(proxyOptions)
        proxyAgent.timeout = options.timeout

        let requestOptions = {
            protocol: options.endpointProtocol + ':',
            slashes: true,
            auth: null,
            host: endpointHost,
            port: null,
            hostname: endpointHost,
            hash: null,
            search: null,
            query: null,
            pathname: '/',
            path: '/',
            href: options.endpointProtocol + '://' + endpointHost + '/',
            agent: proxyAgent,
            rejectUnauthorized: false
        }
        
        let request = requestLibrary.get(requestOptions, function(res) {
            request.end()
            if (res.statusCode === 301 || res.statusCode === 200) {
                resolve(true)
            }
            resolve(false)
        }).setTimeout(options.timeout, () => {
            request.end()
            resolve(false)
        }).on('error', (e) => {
            request.end()
            resolve(false)
        })
    })
}
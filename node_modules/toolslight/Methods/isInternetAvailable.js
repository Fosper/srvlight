
const toolslight = require('../index.js')
const { createConnection } = require('net')

toolslight.isInternetAvailable = function() {

    /*
        Returns promise.

        Example for synchronous execution:
        console.log(await toolslight.isInternetAvailable())

        Example for asynchronous execution:
        toolslight.isInternetAvailable().then((result) => {console.log(result)})
    */

    return new Promise(async (resolve) => {
        let dnsHosts = [
            '8.8.8.8', // Google
            '1.1.1.1', // CloudFlare
            '208.67.222.222', // Cisco
            '9.9.9.9', // Quad9
            '8.8.4.4', // Google
            '1.0.0.1', // CloudFlare
            '208.67.220.220', // Cisco
            '149.112.112.112' // Quad9
        ]

        let isDnsServerAvailable = (host) => {
            return new Promise((resolve) => {
                const client = createConnection({ host, port: 53 }, () => {
                    client.end()
                    resolve(true)
                })

                client.setTimeout(2000)
        
                client.on('timeout', err => {
                    client.destroy()
                    resolve(false)
                })
        
                client.on('error', err => {
                    resolve(false)
                })
            })
        }

        for (let dnsHost of dnsHosts) {
            if (await isDnsServerAvailable(dnsHost)) {
                resolve(true)
            }
        }

        resolve(false)
    })
}
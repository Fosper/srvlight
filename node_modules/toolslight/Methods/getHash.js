const toolslight = require('../index.js')
const crypto = require('crypto')

toolslight.getHash = function(customOptions = {}) {
    
    /*
        Returns string.

        Example:
        .getHash({data: 'Hi!', type: 'sha256', format: 'base64'}) - Returns hash string for 'Hi!'.
    */

    let defaultOptions = {
        type: 'sha256',
        data: 'Hello',
        format: 'hex'
    }

    let options = {}

    for (let option of Object.keys(defaultOptions)) {
      if (!this.isEmpty(customOptions[option])) {
        options[option] = customOptions[option]
      } else {
        options[option] = defaultOptions[option]
      }
    }

    return crypto.createHash(options.type).update(options.data).digest(options.format)
}
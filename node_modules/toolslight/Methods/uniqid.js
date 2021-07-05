const toolslight = require('../index.js')

toolslight.uniqid = function(customOptions = {}) {
    
    /*
        Returns string.

        Example:
        .uniqid() - Get string with random 'a-z' and '0-9' symbols (13 symbols in string).
        .uniqid({symbolCount: 20}) - Get string with random 'a-z' and '0-9' symbols (20 symbols in string).
    */

    let defaultOptions = {
        symbolCount: 13,
        letterCase: 'lower', // Default: 'lower'. Can be 'lower', 'upper', 'mixed'.
        lettersLib: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        numbersLib: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        specialLib: ['!', '@', '#', '$', '%', '&', '*', '(', ')', '-', '_', '+', ':', ',', '.', ';', '[', ']', '{', '}', '<', '>'],
        customLib: [],
        lettersEnable: true,
        numbersEnable: true,
        specialEnable: false,
        customEnable: false
    }

    let options = {}

    for (const defaultOption in defaultOptions) {
        if (Object.prototype.toString.call(defaultOptions[defaultOption]) === Object.prototype.toString.call(customOptions[defaultOption])) {
            options[defaultOption] = customOptions[defaultOption]
        } else {
            options[defaultOption] = defaultOptions[defaultOption]
        }
    }

    let lib = []

    if (options.lettersEnable) {
        lib = lib.concat(options.lettersLib)
    }
    if (options.numbersEnable) {
        lib = lib.concat(options.numbersLib)
    }
    if (options.specialEnable) {
        lib = lib.concat(options.specialLib)
    }
    if (options.customEnable) {
        lib = lib.concat(options.customLib)
    }

    if (!lib.length) {
        return ''
    }

    let result = ''

    for (let i = 0; i < options.symbolCount; i++) {
        let letter = lib[Math.floor(Math.random() * lib.length)]
        if (options.letterCase === 'lower') {
            letter = letter.toLowerCase()
        } else if (options.letterCase === 'upper') {
            letter = letter.toUpperCase()
        } else {
            if (Math.floor(Math.random() * 2)) {
                letter = letter.toLowerCase()
            } else {
                letter = letter.toUpperCase()
            }
        }

        result += letter
    }

    return result
}
const toolslight = require('../index.js')

toolslight.to = function(promise) {

    /*
        Returns object

        Example without error (err will be null, data will be 'Success'):
        var err, data
        [err, data] = await toolslight.to(new Promise((resolve, reject) => {
            let a = 1
            if (a === 1) {
                resolve('Success')
            } else {
                reject('Error!')
            }
        }))
        if (err) {
            console.log(err)
            return
        }
        console.log(data)

        Example with error (err will be 'Error!'):
        var err, data
        [err, data] = await toolslight.to(new Promise((resolve, reject) => {
            let a = 2
            if (a === 1) {
                resolve('Success')
            } else {
                reject('Error!')
            }
        }))
        if (err) {
            console.log(err)
            return
        }
    */

    return promise.then(data => {
        return [null, data];
        })
    .catch(err => [err]);
}






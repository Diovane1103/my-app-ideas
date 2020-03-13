const request = require('request')

const http = async (url, cb) => {
    request({ url, json: true }, (err, { body }) => {
        if(err)
            cb('Unable to connect in url!')
        else
            console.log(body)
            // cb(undefined, body)
    })
}

module.exports = http
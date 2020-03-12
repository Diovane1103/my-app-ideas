const app = require('./../app')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const Chat = require('./../models/chat')


io.on('connection', (socket) => {
    // With a click in an existing chat send chatId to socket else create a chat empty sending undefined in chatId
    socket.on('join', async (chat, cb) => {
        let chatL = chat
        if(chatL.data.length > 0)
            cb(chatL.data)
        cb(undefined)
    })
})

module.exports = io
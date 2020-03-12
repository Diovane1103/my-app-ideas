const app = require('./../app')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const Chat = require('./../models/chat')

io.on('connection', async (socket) => {
    socket.on('join', (options, cb) => {

    })
})

module.exports = io
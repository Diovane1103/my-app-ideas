const app = require('./../app')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const Chat = require('./../models/chat')


io.on('connection', (socket) => {
    socket.on('enter', async (chat, cb) => {
        if(!chat)
            return cb(new Error())

        socket.join(chat._id)
        io.to(chat._id).emit('room_data', { data: chat.conversation })

        cb()
    })

    socket.on('join', async (chat, options, cb) => {
        if(!chat) 
            return cb(new Error())

        chat.participants.push(options._id)
        socket.join(chat._id)
        io.to(chat._id).emit('room_data', { data: [] })

        cb()
    })

    socket.on('sendMessage', (chat, message, cb) => {
        if(!chat)
            cb(new Error())
        chat.conversation.push(message)
        io.to(chat._id).emit('message', message)
        cb()
    })
})

module.exports = io
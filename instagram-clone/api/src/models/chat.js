const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    name: {
        type: String
    },
    participants: [mongoose.Schema.Types.ObjectId],
    conversation: [{
        data: { }, 
        timestamp: {
            type: Date
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
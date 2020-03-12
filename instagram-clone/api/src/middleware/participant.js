const Chat = require('./../models/chat')

const participant = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.id)
        const not = chat.participants.filter((p) => req.user.follows.filter(f => f !== p) && p === req.user._id)
        if(not.length !== 0)
            throw new Error()
        next()
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = participant
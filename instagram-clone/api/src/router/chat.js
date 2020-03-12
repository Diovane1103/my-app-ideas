const Chat = require('./../models/chat')
const auth = require('./../middleware/auth')
const socketchat = require('./../chat/socket')
const participant = require('./../middleware/participant')

const express = require('express')
const router = new express.Router()

router.get('/:id', auth, participant, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)

        
        res.status(200).send(chat)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/', auth, async ({ body, user }, res) => {
    const p = body.participants.split(', ')
    p.push(user._id.toString())
    const chat = new Chat({
        name: body.name ? body.name : p.toString().replace(/\,/g, '_'),
        participants: []
    })
    try {
        chat.participants = p 
        await chat.save()

        res.status(201).send(chat)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
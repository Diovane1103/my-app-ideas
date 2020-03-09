const express = require('express')
const auth = require('./../middleware/auth')
const User = require('./../models/user')
const router = new express.Router()

router.post('/signin', async (req, res) => {
    const user = new User(req.body)
    try {
        if(user.validatePassword()) {
            throw new Error({ err: 'Password cannot have your birthday!' })
        }
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.status(200).send({ user, token })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => req.token !== token.token)
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
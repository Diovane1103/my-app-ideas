const express = require('express')
const moment = require('moment')
const multer = require('multer')
const sharp = require('sharp')
const account = require('./../email/account')

const auth = require('./../middleware/auth')
const User = require('./../models/user')

const router = new express.Router()
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
           return cb(new Error('Please upload an image.'))
        }
        cb(undefined, true)
    }
})

router.post('/signin', async (req, res) => {
    const user = new User(req.body)
    try {
        if(user.validatePassword()) {
            throw new Error({ err: 'Password cannot have your birthday!' })
        }
        if(user.validateGender()) {
            throw new Error({ err: 'Not suported gender!' })
        }
        await user.save()
        const token = await user.generateAuthToken()
        account.welcomeEmail(user.email, user.name)

        res.status(201).send({ user, token })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/signout', auth, async (req, res) => {
    await User.findByIdAndDelete(req.user._id)
    account.cancelationEmail(req.user.email, req.user.name)
    res.send()
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

router.get('/me', auth, async ({ user }, res) => {
    res.status(200).send({
        _id: user._id,
        avatar: user.avatar | null,
        description: user.description | null,
        gender: user.gender,
        name: user.name,
        images: user.images,
        follows: user.follows,
        birthday: moment(user.birthDay).format('L'),
        age: user.getAge() | null
    })
})

router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['description', 'name', 'gender', 'email']
    const isValidOp = updates.every(update => validUpdates.includes(update))

    if(!isValidOp)
        return res.status(400).send({ err: 'Invalid Update!' })
    
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.patch('/follow/:id', auth, async (req, res) => {
    try {
        const userFol = await User.findById(req.params.id)
        if(!userFol) {
            throw new Error({ err: 'A user with this id does not exist.' })
        }
        req.user.follows.push(req.params.id)
        await req.user.save()

        res.status(200).send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/unfollow/:id', auth, async (req, res) => {
    try {
        const userFol = await User.findById(req.params.id)
        if(!userFol) {
            throw new Error({ err: 'A user with this id does not exist.' })
        }
        const idx = req.user.follows.findIndex(id => userFol._id === id)
        req.user.follows.splice(idx, 1)
        await req.user.save()

        res.status(200).send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, heigth: 250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()

        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()

    res.send()
})

router.get('/:id/avatar', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar)
            throw new Error({ err: 'The user does not exist or does not have an avatar image!'})
        
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/me/image', auth, upload.single('image'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 450, heigth: 300}).png().toBuffer()
        req.user.images.push(buffer)
        await req.user.save()

        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/me/image/:id', auth, async (req, res) => {
    try {
        req.user.images = req.user.images.filter(img => img.id !== req.params.id)
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/:id/image/:imageId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        
        if(!user || !user.images)
            throw new Error({ err: 'The user does not exist or does not have any image!'})
        
        const image = user.images.filter(img => img.id === req.params.imageId)
        res.set('Content-Type', 'image/png')
        res.send(image)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
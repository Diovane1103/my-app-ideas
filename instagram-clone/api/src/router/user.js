const express = require('express')
const moment = require('moment')
const multer = require('multer')
const sharp = require('sharp')
const account = require('./../email/account')

const User = require('./../models/user')
const Story = require('./../models/story')
const Post = require('./../models/post')
const permission = require('./../middleware/permission')
const auth = require('./../middleware/auth')

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

router.delete('/signout', auth, async ({user}, res) => {
    await user.remove()
    account.cancelationEmail(user.email, user.name)
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

router.post('/logout', auth, async ({user, tokenUser}, res) => {
    try {
        user.tokens = user.tokens.filter((token) => tokenUser !== token.token)
        await user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/logoutAll', auth, async ({ user }, res) => {
    try {
        user.tokens = []
        await user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/me', auth, async ({ user }, res) => {
    const stories = await Story.find({ owner: user._id })
    const posts = await Post.find({ owner: user._id })

    res.status(200).send({
        _id: user._id,
        avatar: user.avatar || null,
        description: user.description || null,
        gender: user.gender,
        name: user.name,
        posts: posts,
        stories: stories,
        follows: user.follows,
        birthday: moment(user.birthDay).format('L'),
        age: user.getAge() || null
    })
})

router.patch('/me', auth, async ({user, body}, res) => {
    const updates = Object.keys(body)
    const validUpdates = ['description', 'name', 'gender', 'email']
    const isValidOp = updates.every(update => validUpdates.includes(update))

    if(!isValidOp)
        return res.status(400).send({ err: 'Invalid Update!' })
    
    try {
        updates.forEach(update => user[update] = body[update])
        await user.save()

        res.send(user)
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

router.get('/:id/stories', auth, permission, async (req, res) => {
    try {
        const stories = await Story.find({ owner: req.params.id })

        res.set('Content-Type', 'multipart/form-data')
        res.status(200).send(stories)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/:id/posts', auth, permission, async (req, res) => {
    try {
        const posts = await Post.find({ owner: req.params.id })

        res.set('Content-Type', 'multipart/form-data')
        res.status(200).send(posts)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/:id/profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const stories = await Story.find({ owner: req.params.id })
        const posts = await Post.find({ owner: req.params.id })

        res.status(200).send({ user, posts, stories })
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
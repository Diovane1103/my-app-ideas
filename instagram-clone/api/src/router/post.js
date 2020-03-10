const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const Post = require('./../models/post')
const auth = require('./../middleware/auth')

const router = new express.Router()
const upload = multer({
    limits: {
        fileSize: 100000000
    }
})

router.post('/upload/image', auth, upload.single('image'), async (req, res) => {
    const post = new Post({
        comment: req.body.comment,
        owner: req.user._id,
        images: []
    })
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 450, heigth: 300 }).png().toBuffer()
        post.images.push(buffer)
        await post.save()

        res.status(201).send(post)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/upload/video', auth, upload.single('video'), async (req, res) => {
    const post = new Post({
        comment: req.body.comment,
        owner: req.user._id,
        videos: []
    })
    try {
        const buffer = await sharp(req.file.buffer).toBuffer()
        post.videos.push(buffer)
        await post.save()

        res.status(201).send(post)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/:id', auth, async (req, res) => {
    await Post.findById(req.params.id)
    res.send()
})

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        
        if(!post || !post.image || !post.video)
            throw new Error({ err: 'The post does not exist or does not have any image or video!'})
        
        const file = {
            type: post.video ? 'video/mp4' : 'image/png',
            buffer: post.video ? post.video : post.image
        }
        res.set('Content-Type', file.type)
        res.send(file.buffer)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
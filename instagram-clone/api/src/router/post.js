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

router.post('/upload', auth, upload.array('file', 12), async (req, res) => {
    const post = new Post({
        comment: req.body.comment,
        owner: req.user._id
    })
    try {
        post.files = await Promise.all(req.files.map(async (f) => {
            if(!f.originalname.match(/\.(jpg|jpeg|png|mp4)$/))
                throw new Error('Just accept video and image!')
            return f.originalname.match(/\.(jpg|jpeg|png)$/) ? 
                   await sharp(f.buffer).resize({ width: 350, heigth: 300 }).png().toBuffer() :
                   f.buffer
        }));
        await post.save()
        
        res.status(201).send({ _id: post._id, comment: post.comment, owner: post.owner })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/:id', auth, async (req, res) => {
    await Post.findByIdAndDelete(req.params.id)
    res.send()
})

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post || !post.files) {
            throw new Error({ err: 'The post does not exist or does not have any image or video!'})
        }

        res.set('Content-Type', 'multipart/form-data')
        res.send(post)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
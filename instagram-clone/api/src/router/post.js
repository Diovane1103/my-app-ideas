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

router.post('/upload', upload.single('file'), auth, async (req, res) => {
    const post = new Post({
        comment: req.body.comment,
        owner: req.user._id,
        images: [],
        videos: []
    })
    try {
        const buffer = await sharp(req.file.buffer).toBuffer()

    } catch (error) {
        
    }
})

module.exports = router
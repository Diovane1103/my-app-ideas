const auth = require('./../middleware/auth')
const Story = require('./../models/story')

const multer = require('multer')
const sharp = require('sharp')
const express = require('express')

const router = new express.Router()
const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4)$/)){
            cb(new Error('Story just support .gif, video and images!'))
        }
        cb(undefined, true)
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)

        res.set('Content-Type', `${story.typeOf}/${story.dataType}`)
        res.status(200).send(story.data)
    } catch (error) {
        res.status(500).send(error)   
    }
})

router.post('/', auth, upload.single('data'), async (req, res) => {
    const story = new Story({
        owner: req.user._id,
        links: []
    })
    try {
        story.typeOf = req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'video'
        story.dataType = req.file.originalname.split(".")[1]
        story.links.push(req.body.links.split(","))
        story.data = req.file.originalname.match(/\.(jpg|jpeg|png)$/) ? 
                     await sharp(req.file.buffer).resize({ width: 350, heigth: 300 }).png().toBuffer() :
                     req.file.buffer
        await story.save()
        
        res.status(201).send({ _id: story._id, links: story.links, owner: story.owner })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/:id', auth, async (req, res) => {

})

module.exports = router
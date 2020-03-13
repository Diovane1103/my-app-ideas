const auth = require('./../middleware/auth')
const Story = require('./../models/story')
const httpRequest = require('./../middleware/request') 

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
            cb(new Error('Story just support gif, video and images!'))
        }
        cb(undefined, true)
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
        if(!story.data.buffer) {
            httpRequest(story.data, (error, data) => {
                if(error)
                    throw new Error(error)
                else
                    story.data = data
            })
        }
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
        const data = req.body.data ? req.body : req.file
        story.data = data.data ? data.data : data.originalname.match(/\.(jpg|jpeg|png)$/) ? 
                                             await sharp(data.buffer).resize({ width: 350, heigth: 300 }).png().toBuffer() : 
                                             data.buffer
        story.markModified('data')
        story.typeOf = data.data ? data.data.match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'video' : data.originalname.match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'video'
        story.dataType = data.data ? data.data.split('.')[data.data.split('.').length - 1] : data.originalname.split('.')[data.originalname.split('.').length - 1]
        
        story.links.push(req.body.links.split(','))
        await story.save()
        
        res.status(201).send({ _id: story._id, links: story.links, owner: story.owner })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/:id', auth, async (req, res) => {
    try {
        const story = await Story.findByIdAndDelete(req.params.id)
        if(!story)
            throw new Error({ err: 'A story with this id does not exist.' })
        res.status(200).send(story)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
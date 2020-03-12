const express = require('express')
const userRoute = require('./router/user')
const postRoute = require('./router/post')
const storyRoute = require('./router/story')
const chatRoute = require('./router/chat')
const bodyParser = require('body-parser')
const moment = require('moment')

const app = express()
require('./db/mongoose.js')

app.use(bodyParser.json())
app.use('/user', userRoute)
app.use('/post', postRoute)
app.use('/story', storyRoute)
app.use('/chat', chatRoute)

module.exports = app
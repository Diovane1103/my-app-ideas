const express = require('express')
const userRoute = require('./router/user')
const postRoute = require('./router/post')
const storyRoute = require('./router/story')
const app = express()
require('./db/mongoose.js')

app.use(express.json())
app.use('/user', userRoute)
app.use('/post', postRoute)
app.use('/story', storyRoute)

module.exports = app
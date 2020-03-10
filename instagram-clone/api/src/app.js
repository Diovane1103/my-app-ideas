const express = require('express')
const userRoute = require('./router/user')
const postRoute = require('./router/post')
const app = express()
require('./db/mongoose.js')

app.use(express.json())
app.use('/user', userRoute)
app.use('/post', postRoute)

module.exports = app
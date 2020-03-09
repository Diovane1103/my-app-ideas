const express = require('express')
const userRoute = require('./router/user')
const app = express()
require('./db/mongoose.js')

app.use(express.json())
app.use('/user', userRoute)

module.exports = app
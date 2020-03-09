const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    birthDay: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    images: [{
        image: {
            type: Buffer
        }   
    }],
    avatar: {
        type: Buffer
    },
    follows: [{
        follow: mongoose.Schema.Types.ObjectId
    }]
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.methods.validatePassword = function() {
    return (this.password == moment(this.birthDay).format('L').replace(/\//g, ''))
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.avatar
    delete userObject.images
    delete userObject.tokens

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!email)
        throw new Error('Unable to login.')

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
        throw new Error('Unable to login.')
    
    return user
}

userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password'))
       user.password = await bcrypt.hash(user.password, 8)

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
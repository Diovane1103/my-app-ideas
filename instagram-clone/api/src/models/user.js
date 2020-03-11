const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const genders = require('./genders')
const Post = require('./post')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
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
    avatar: {
        type: Buffer
    },
    follows: [{
        follow: mongoose.Schema.Types.ObjectId
    }]
}, {
    timestamps: true
})

userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('stories', {
    ref: 'Story',
    localField: '_id',
    foreignField: 'owner'
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

userSchema.methods.validateGender = function() {
    return genders[this.gender.toUpperCase()] == undefined
}

userSchema.methods.getAge = function() {
    const user = this
    const actualDate = new Date()
    let age = actualDate.getFullYear() - user.birthDay.getFullYear()
    if(actualDate.getMonth() < user.birthDay.getMonth()) {
        console.log('Month', user.birthDay.getMonth())
        age--
    } else if(actualDate.getMonth() == user.birthDay.getMonth() && actualDate.getDay < user.birthDay.getDay()) {
        console.log('Day')
        age--
    }
    return age
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.avatar
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

userSchema.pre('remove', async function(next){
    const user = this
    await Post.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
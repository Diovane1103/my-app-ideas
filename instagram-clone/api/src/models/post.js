const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    files: [Buffer],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
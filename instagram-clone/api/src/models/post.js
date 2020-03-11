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

// postSchema.methods.toJSON = function() {
//     const post = this
//     const postObject = post.toObject()

//     delete postObject.files

//     return postObject
// }

const Post = mongoose.model('Post', postSchema)

module.exports = Post
const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    links: [{
        link: mongoose.Schema.Types.ObjectId
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    data: {
        type: Buffer
    },
    dataType: {
        type: String
    },
    typeOf: {
        type: String
    }
}, {
    timestamps: true
})

const Story = mongoose.model('Story', storySchema)

module.exports = Story

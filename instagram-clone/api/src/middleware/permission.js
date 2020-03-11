const User = require('./../models/user')

const permission = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        const filteredFollows = user.follows.filter(f => f === req.params.id)
        if(!filteredFollows) {
            throw new Error()
        }
        next()   
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = permission
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const interestedUser = mongoose.model('interestedUser', new Schema({
    fullName: {
        type: String,
        min: 3,
        max: 100,
        required: [true, 'Full Name must be entered']
    },
    email: {
        type: String,
        required: [true, 'Email address must be entered']
    },
    city: {
        type: String,
        min: 3,
        max: 100,
        required: [true, 'There must be a City']
    }
}))

module.exports = interestedUser

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const checkType = mongoose.model('checkType', new Schema({
    caption: {
        type: String,
        min: 1,
        max: 20,
        required: [true, 'Check type caption must be entered']
    },
    base: {
        type: Number,
        required: [true, 'Check type base must have a Check type price base']
    },
    description: {
        type: String,
        min: 1,
        max: 100,
        required: [true, 'Description must provided']
    }
}))

module.exports = checkType

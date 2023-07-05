const mongoose = require('mongoose')
const Schema = mongoose.Schema

const category = mongoose.model('category', new Schema({
    name: {
        type: String,
        min: 3,
        max: 50,
        required: [true, 'Category must be entered']
    },
    description: {
        type: String,
        min: 1,
        max: 300,
        required: [true, 'Description must provided']
    },
    image: {
        type: String
    }
}))

module.exports = category

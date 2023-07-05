const mongoose = require('mongoose')
const Schema = mongoose.Schema

const city = mongoose.model('city', new Schema({
    name: {
        type: String,
        min: 3,
        max: 50,
        required: [true, 'City must be entered']
    },
    zip_code: {
        type: String,
        min: 1,
        max: 4,
        required: [true, 'Zip code must provided']
    },
    
}))

module.exports = city
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const review = mongoose.model('review', new Schema({
    fullName:{
        type: String,
        min: 3,
        max: 100,
        required: [true, 'Full Name of user that makes the comment must be provided']
    },
    user_id: {
        // type: Schema.Types.ObjectId,
        type: String,
        required: [true, 'User _id of user that makes the comment must be provided']
    },
    comment: {
        type: String,
        min: 3,
        max: 240
    },
    user_picture: {
        type: String,   
    },
    checker_id: {
        // type: Schema.Types.ObjectId,
        type: String,
        required: [true, 'User _id that makes the comment is required']
    },

}))

module.exports = review
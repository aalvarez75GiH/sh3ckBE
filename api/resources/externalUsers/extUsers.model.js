const mongoose = require('mongoose')
const Schema = mongoose.Schema


const externalUser = mongoose.model('externalUsers', new Schema({
    typeUser: {
        type: String,
        required: [true, 'This field must be specified by us']
    },
    fullName: {
        type: String,
        min: 3,
        max: 100,
        required: [true, 'Failed name extraction from facebook']
    },
    goID: {
        type: String,
        required:  [true, 'Failed ID extraction from Google']
    },
    email: {
        type: String,
        required: [true, 'Failed email extraction from source api']
    },
    picture: {
        type: String,
        required: [true, 'Failed picture url extraction from source api']
    },
    phoneNumber: {
        type: String,
        match: /^[0-9]+$/
    },
    role:{
        type: String
    } 
}))

module.exports = externalUser
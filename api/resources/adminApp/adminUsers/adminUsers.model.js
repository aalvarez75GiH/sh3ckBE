const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminUser = mongoose.model('adminUser', new Schema({
    fullName: {
        type: String,
        min: 3,
        max: 100,
        required: [true, 'You must enter a Full Name']
    },
    email: {
        type: String,
        required: [true, 'You must enter an Email']
    },
    phoneNumber: {
        type: String,
        length: 11,
        match: /^[0-9]+$/,
        required: [true, 'You must enter a Phone Number']

    },
    address: {
        type: String,
        length: 300,
        required: [true, 'You must enter an address']

    },
    ID: {
        type: String,
        match: /^[0-9]+$/,
        required: [true, 'You must enter an ID number']
    },
    pin: {
        type: String,
        min: 4,
        max: 4,
        required: [true, 'Please enter a PIN number']
    },
    role: {
        type: String,
        required: [true, 'You must enter a role for this type of user']
    }

}))

module.exports = adminUser
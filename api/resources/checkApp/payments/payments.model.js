const mongoose = require('mongoose')
const Schema = mongoose.Schema

const payment = mongoose.model('payments', new Schema({
    name: {
        type: String,
        min: 3,
        max: 50,
        required: [true, 'Payment caption must be entered']
    },
    description: {
        type: String,
        min: 1,
        max: 300,
        required: [true, 'Description must provided']
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
    bank_name:{
        type: String,
        min: 3,
        max: 150,
        required: [true, 'must a Bank name']
    },
    identification:{
        type: String,
        min: 3,
        max: 15,
        required: [true, 'Please enter an identification number']
    },
    picture: {
        type: String
    }
}))

module.exports = payment
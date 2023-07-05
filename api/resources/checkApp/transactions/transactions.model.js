const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transaction = mongoose.model('transactions', new Schema({
    user_name: {
        type: String,
        max: 50
    },
    reference_number:{
        type: String,
        min:1,
        max: 12,
        required: [true, 'Must enter a reference number']
    },
    date: {
        type: String,
        required: [true, 'Must enter a date']
    },
    amount: {
        type: Number,
        required: [true, 'Service time must have a service price base']
    }
    
}))

module.exports = transaction

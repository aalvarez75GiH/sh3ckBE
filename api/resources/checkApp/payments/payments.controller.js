const payment = require('./payments.model')
const logger = require('../../../../utils/logger')

const getPayment = () => {
    return payment.find({}) 
}
const findPayment = (name) => {
    logger.info(`name at controller: ${name}`)
    if (name) return payment.findOne({ name: name })
    throw new Error ('Get Payment function from controller was called without specifying a caption')
}
const findOnePayment = (id) => {
    return payment.findById(id)
}

const createPayment = (newPayment) => {
    return new payment({
        ...newPayment,
    }).save()      
}

const editPayment = (id, newPayment) => {
    return payment.findOneAndUpdate({_id: id}, {
        ...newPayment,
        name: newPayment.name,
        description: newPayment.description,
        email: newPayment.email,
        phoneNumber: newPayment.phoneNumber,
        bank_name: newPayment.bank_name,
        identification: newPayment.identification
    },{
        new: true //This option is in order to return the new document modified
    })
}

const deletePayment = (id) => {
    return payment.findByIdAndRemove(id)
}

const saveImageUrl = (id, imageUrl) => {
    return payment.findOneAndUpdate({_id: id},{
        picture: imageUrl
    },{
        new: true //This option is in order to return the new document modified
    })
}

module.exports = {
    getPayment,
    findPayment,
    findOnePayment, 
    createPayment,
    editPayment,
    deletePayment,
    saveImageUrl
}
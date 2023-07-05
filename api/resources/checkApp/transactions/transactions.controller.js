const transaction = require('./transactions.model')
const logger = require('../../../../utils/logger')

const getTransactions = () => {
    return transaction.find({}) 
}

const getOneTransactionById = (id) => {
    return transaction.findById(id)
}

const findTransactionByReferenceNumber = (reference_number) => {
    if (reference_number) return transaction.findOne({ reference_number: reference_number })
    throw new Error ('Get Transaction function from controller was called without specifying a reference number')
}

const createTransaction = (newTransaction) => {
    return new transaction({
        ...newTransaction,
    }).save()      
}

const editTransaction = (id, transactionToUpdate) => {
    return transaction.findOneAndUpdate({_id: id}, {
        ...transactionToUpdate,
        user_name: transactionToUpdate.user_name,
        amount: transactionToUpdate.amount,
        date: transactionToUpdate.date,
        reference_number: transactionToUpdate.reference_number,

    },{
        new: true //This option is in order to return the new document modified
    })
}

const deleteTransaction = (id) => {
    return transaction.findByIdAndRemove(id)
}


module.exports = {
    getTransactions,
    getOneTransactionById,
    findTransactionByReferenceNumber,
    createTransaction,
    editTransaction,
    deleteTransaction
}
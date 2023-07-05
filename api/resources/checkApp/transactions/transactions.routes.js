const express = require('express')
const passport = require('passport')
const jwtAuthorization = passport.authenticate('jwt', { session: false })
const Intl = require("intl")

const logger = require('../../../../utils/logger')
const transactionController = require('./transactions.controller')
const processingErrors = require('../../../libs/errorHandler').processingErrors 
const validateTransaction = require('./transactions.validate')
const {paymentNotFoundFound} = require('./transactions.errors')
const emailSender = require('../../../../utils/emailSender').emailSenderModule
const transactionRouter = express.Router()

transactionRouter.get('/', processingErrors(async(req,res) => {
    return await transactionController.getTransactions()
    .then((transactions) => {
        logger.info(transactions)
        res.status(200).json(transactions)
    }) 
}))

transactionRouter.get('/:ref_number', processingErrors(async(req,res) => {
    let reference_number = req.params.ref_number
    let foundTransaction = await transactionController.findTransactionByReferenceNumber(reference_number)
    if (!foundTransaction){
        logger.info(`foundTransaction with ref #: ${reference_number} has not been found`)
        throw new paymentNotFoundFound()
        // res.status(404).send(`la transacción con # de referencia:${reference_number} no se ha encontrado en nuestra BD`)
        // res.status(404).json(foundTransaction)
        // return
    }
    if (foundTransaction){
        logger.info(`Transaction with ref#: ${reference_number} has been found at our DB`)
        res.status(200).json(foundTransaction)
        return
    }
   
}))

// Transaction created by Admin User
transactionRouter.post('/',[validateTransaction, jwtAuthorization] , processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let newTransaction = req.body
    
     
    logger.info(`Transaction Ref #: ${newTransaction.reference_number}`)
    logger.info(`newTransaction: ${newTransaction}`)
    let foundTransaction
    foundTransaction = await transactionController.findTransactionByReferenceNumber(newTransaction.reference_number)
    if (foundTransaction){
        logger.info(`Transaction with Ref #:${foundTransaction.reference_number} already exists and can not be duplicated`)
        res.status(409).send(foundTransaction.reference_number)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'collections'){
        await transactionController.createTransaction(newTransaction)
        logger.info(`Transaction with ref # ${newTransaction.reference_number} has been created successfully at DB`)
        res.status(201).send(newTransaction)
        return
    }
 
}))

// ************************** Bank simulator
transactionRouter.post('/bankUser', processingErrors(async(req,res) => {
    let emailInfoToSend = req.body
    logger.info(`Email to send #: ${emailInfoToSend}`)
    
    return new Promise((resolve,reject) => {
        resolve(emailSender('userFromBank', emailInfoToSend))
    }).then((response) => {
        logger.info(response)
        res.status(200).send(response)
    }).catch(error => {
        logger.info(error)
    })
    
 
}))
transactionRouter.post('/bankSh3ck', processingErrors(async(req,res) => {
    let emailInfoToSend = req.body
    logger.info(`Email to send #: ${emailInfoToSend}`)
    
    return new Promise((resolve,reject) => {
        resolve(emailSender('sh3ckFromBank', emailInfoToSend))
    }).then((response) => {
        logger.info(response)
        res.status(200).send(response)
    }).catch(error => {
        logger.info(error)
    })
    
 
}))

module.exports = transactionRouter
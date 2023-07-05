const express = require('express')
const passport = require('passport')
const { v4: uuidv4 } = require('uuid')
const jwtAuthorization = passport.authenticate('jwt', { session: false })

const paymentController = require('./payments.controller')
const logger = require('../../../../utils/logger')
const processingErrors = require('../../../libs/errorHandler').processingErrors 
const validatePayment = require('./payments.validate').validatePayment
const validatePaymentImage = require('./payments.validate').validatePaymentImage
const { savePaymentPicture } = require('../../../../aws/images.controller')


const paymentRouter = express.Router()

const validarID = (req, res, next) => {
    let id = req.params.id
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400). send(`id [${id}] entered is not valid...`)
        return
    }
    next()
}

paymentRouter.get('/', processingErrors((req,res) => {
    return paymentController.getPayment()
    .then((payments) => {
        res.status(200).json(payments)
        logger.info(`Payments were found at DB and have been sent to requester`)
        return
    })   
}))


paymentRouter.post('/',[validatePayment,jwtAuthorization] , processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let newPayment = req.body
    logger.info(`payment caption: ${newPayment.name}`)
    logger.info(`newPayment: ${newPayment}`)
    let foundPayment
    foundPayment = await paymentController.findPayment(newPayment.name)
    if (foundPayment){
        logger.info(`foundPayment: ${foundPayment}`)
        res.status(409).send(`payment:${foundPayment} is already created at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await paymentController.createPayment(newPayment)
        logger.info(`Payment with name ${newPayment.name} has been created successfully at DB`)
        res.status(201).send(newPayment.name)
        return
    }
 
}))

paymentRouter.put('/:id', [validarID, validatePayment, jwtAuthorization ], async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    let newPayment = req.body
    let id = req.params.id
    
    let foundPayment
    foundPayment = await paymentController.findOnePayment(id)
    // foundPayment = await categoryController.findCategory(newPayment.name)
    
    if (!foundPayment){
        logger.info(`foundPayment: ${foundPayment}`)
        res.status(409).send(`Payment:${foundPayment} has not been found at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await paymentController.editPayment(id, newPayment)
        logger.info(`Payment with name "${foundPayment.name}" has been updated to "${newPayment.name}" at DB`)
        res.status(201).send(newPayment.name)
        return
    }
    
})

paymentRouter.put('/:id/images', [jwtAuthorization, validatePaymentImage], processingErrors(async(req, res ) => {
    const id = req.params.id
    const user = req.user.fullName    
    logger.info(`Request from User [${user}] was received. We are processing image with payment ID [${id}] `)
    
    const randomizedName = `${uuidv4()}.${req.fileExtension}`
    logger.info(randomizedName)
    const imageURL = await savePaymentPicture(req.body, randomizedName) //Amazon s3 process
    logger.info(`imageURL: ${imageURL}`)
    const paymentUpdated = await paymentController.saveImageUrl(id, imageURL)
    logger.info(`Payment with ID [${id}] was updated with new image link [${imageURL}]
    changed by user [${user}]`)
    res.json(paymentUpdated)
}))

paymentRouter.delete('/:id', [validarID, jwtAuthorization ], async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    let id = req.params.id
    
    let foundPayment
    foundPayment = await paymentController.findOnePayment(id)
    // foundPayment = await categoryController.findCategory(newCategory.name)
    
    if (!foundPayment){
        logger.info(`foundPayment: ${foundPayment}`)
        res.status(409).send(`Payment with ID: ${id} has not been found at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await paymentController.deletePayment(id)
        logger.info(`Payment with name "${foundPayment.name}" has been deleted from DB`)
        res.status(200).send('El tipo de pago ha sido eliminado con exito de la BD')
        return
    }
    
})

module.exports = paymentRouter



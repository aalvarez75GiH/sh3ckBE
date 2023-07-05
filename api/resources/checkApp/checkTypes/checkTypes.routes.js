const express = require('express')
const passport = require('passport')
const jwtAuthorization = passport.authenticate('jwt', { session: false })

const logger = require('../../../../utils/logger')
const checkTypesController = require('./checkType.controller')
const processingErrors = require('../../../libs/errorHandler').processingErrors
const validateCheckTypes = require('./checkTypes.validate')

const CTRouter = express.Router()

CTRouter.get('/', processingErrors(async(req,res) => {
    return await checkTypesController.getCheckTypes()
    .then((checkTypes) => {
        logger.info(checkTypes)
        res.status(200).json(checkTypes) 
        return
    }) 
}))


CTRouter.get('/:id', processingErrors(async(req,res) => {
    let id = req.params.id
    return await checkTypesController.getOneCheckTypeById(id)
    .then((checkType) => {
        logger.info(checkType)
        res.status(200).json(checkType)
        return 
    }) 
}))

CTRouter.post('/', [validateCheckTypes, jwtAuthorization], processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let newCheckType = req.body
    logger.info(`CheckTypeTime caption: ${newCheckType.caption}`)
    logger.info(`newCheckType: ${newCheckType}`)
    let foundCheckType
    foundCheckType = await checkTypesController.findCheckTypeByCaption(newCheckType.caption)
    if (foundCheckType){
        logger.info(`foundCheckType: ${foundCheckType}`)
        res.status(409).send(`Check Tipe:${foundCheckType} is already created at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to create elements in this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await checkTypesController.createCheckType(newCheckType)
        logger.info(`Check Type with caption ${newCheckType.caption} has been created successfully at DB`)
        res.status(201).send(newCheckType.caption)
        return
    }
 
}))

CTRouter.put('/:id', [validateCheckTypes, jwtAuthorization], processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let id = req.params.id
    let newCheckType = req.body
    logger.info(`CheckTypeTime caption: ${newCheckType.caption}`)
    logger.info(`newCheckType: ${newCheckType}`)
    let foundCheckType
    foundCheckType = await checkTypesController.getOneCheckTypeById(id)
    if (!foundCheckType){
        logger.info(`foundCheckType: ${foundCheckType}`)
        res.status(409).send(`Check Tipe:${foundCheckType} does NOT exists at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para actualizar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await checkTypesController.editCheckType(id, newCheckType)
        logger.info(`Check Type with caption ${newCheckType.caption} has been updated successfully at DB`)
        res.status(200).send(newCheckType.caption)
        return
    }
 
}))

CTRouter.delete('/:id', jwtAuthorization, processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let id = req.params.id
    
    let foundCheckType
    foundCheckType = await checkTypesController.getOneCheckTypeById(id)
    
    if (!foundCheckType){
        logger.info(`foundCheckType: ${foundCheckType}`)
        res.status(404).send(`Check Type with Id:${id} does NOT exists at DB...`)
        return
    }

    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Delete elements in this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para eliminar datos de esta colección')
        return
    }
    if (role === 'admin'){
        await checkTypesController.deleteCheckType(id)
        logger.info(`Check Type with ID ${id} has been deleted successfully at DB`)
        res.status(200).send(`El tipo de chequeo con id: ${id} fué eliminado con exito`)
        return
    }
 
}))

module.exports = CTRouter
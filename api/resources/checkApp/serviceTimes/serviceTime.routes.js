const express = require('express')
const passport = require('passport')
const jwtAuthorization = passport.authenticate('jwt', { session: false })

const logger = require('../../../../utils/logger')
const serviceTimeController = require('./serviceTime.controller')
const processingErrors = require('../../../libs/errorHandler').processingErrors 
const validateServiceTime = require('./serviceTime.validate')

const STRouter = express.Router()

STRouter.get('/', processingErrors(async(req,res) => {
    return await serviceTimeController.getServiceTime()
    .then((serviceTimes) => {
        logger.info(serviceTimes)
        res.status(200).json(serviceTimes)
    }) 
}))

STRouter.get('/:id', processingErrors(async(req,res) => {
    let id = req.params.id
    return await serviceTimeController.getOneServiceTimeById(id)
    .then((serviceTime) => {
        logger.info(serviceTime)
        res.status(200).json(serviceTime)
    }) 
}))

STRouter.post('/',[jwtAuthorization] , processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let newServiceTime = req.body
    logger.info(`ServiceTime caption: ${newServiceTime.caption}`)
    logger.info(`newServiceTime: ${newServiceTime}`)
    let foundServiceTime
    foundServiceTime = await serviceTimeController.findServiceTimeByCaption(newServiceTime.caption)
    if (foundServiceTime){
        logger.info(`foundServiceTime: ${foundServiceTime}`)
        res.status(409).send(`Service Time:${foundServiceTime} is already created at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await serviceTimeController.createServiceTime(newServiceTime)
        logger.info(`Service time with caption ${newServiceTime.caption} has been created successfully at DB`)
        res.status(201).send(newServiceTime.caption)
        return
    }
 
}))

STRouter.put('/:id',[jwtAuthorization, validateServiceTime ] , processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let newServiceTime = req.body
    let id = req.params.id

    logger.info(`ServiceTime caption: ${newServiceTime.caption}`)
    logger.info(`newServiceTime: ${newServiceTime}`)
    let foundServiceTime
    foundServiceTime = await serviceTimeController.getOneServiceTimeById(id)
    if (!foundServiceTime){
        logger.info(`foundServiceTime: ${foundServiceTime}`)
        res.status(404).send(`Service Time:${foundServiceTime} has not been found at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await serviceTimeController.editServiceTime(id, newServiceTime)
        logger.info(`Service time with caption ${newServiceTime.caption} has been updated successfully at DB`)
        res.status(200).send(newServiceTime.caption)
        return
    }
 
}))

STRouter.delete('/:id',jwtAuthorization , processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let id = req.params.id


    // logger.info(`ServiceTime caption: ${newServiceTime.caption}`)
    // logger.info(`newServiceTime: ${newServiceTime}`)
    let foundServiceTime
    foundServiceTime = await serviceTimeController.getOneServiceTimeById(id)
    if (!foundServiceTime){
        logger.info(`foundServiceTime: ${foundServiceTime}`)
        res.status(404).send(`Service Time:${foundServiceTime} has not been found at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await serviceTimeController.deleteServiceTime(id)
        logger.info(`Service time with caption ${foundServiceTime.caption} has been deleted successfully at DB`)
        res.status(200).send(foundServiceTime)
        return
    }
 
}))



module.exports = STRouter
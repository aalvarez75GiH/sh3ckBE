const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const adminUsersRouter = express.Router()


const processingErrors = require('../../../libs/errorHandler').processingErrors 
const config = require('../../../../config')
const adminUserController = require('../adminUsers/adminUsers.controller')
const logger = require('../../../../utils/logger')
const emailSender = require('../../../../utils/emailSender').emailSenderModule
const validateAdminUsers = require('./adminUsers.validate').validateAdminUsers
const validateAdminLoginRequest = require('./adminUsers.validate').validateAdminLoginRequest 
const jwtAuthorization = passport.authenticate('jwt', { session: false })
const { ErrorHashingData } = require('./adminUsers.errors')

     

const transformBodyToLowerCase = (req, res, next) => {
    req.body.fullName && (req.body.fullName = req.body.fullName.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

adminUsersRouter.get('/', processingErrors((req,res)=> {
    return adminUserController.getAdminUsers()
    .then(users => {
        res.json(users)
    })
}))

adminUsersRouter.post('/', [validateAdminUsers, transformBodyToLowerCase], processingErrors(async(req, res)=>{
    let newUser = req.body
    let foundUser
    logger.info(newUser)
    foundUser = await adminUserController.findAdminUser(newUser)  
    logger.info(foundUser)   
    
    if (foundUser){
        logger.info(`User with email ${newUser.email} already registered...`)
        res.status(409).send(`${newUser.fullName}`)
        return
    }
    const randomPIN = Math.floor(1000 + Math.random() * 9000)
    const PIN = randomPIN.toString()
    logger.info(PIN)
    bcrypt.hash(PIN, 10, async(error, hashedPIN) => {
        if (error){
            logger.info(`Error trying hashing PIN...`)
            throw new ErrorHashingData()
        }
        await adminUserController.createAdminUser(newUser, hashedPIN)
        logger.info(`User with email [${newUser.email}] has been created...`)
        emailSender('users', newUser.email, randomPIN)
        res.status(201).send(newUser.fullName)

    })
    
}))

adminUsersRouter.post('/login', [validateAdminLoginRequest, transformBodyToLowerCase], processingErrors(async(req,res) => {
    const notAuthUser = req.body
    let foundUser
    let dataUser
    console.log(notAuthUser)

    foundUser = await adminUserController.findAdminUserForLogin({ email: notAuthUser.email })    
    
    if (!foundUser){
        dataUser = {
            name: 'Amig@',
            email: notAuthUser.email
        }
        logger.info(`User with email ${notAuthUser.email} was not found at DB`)
        res.status(404).send(dataUser)
        // res.status(400).send(`${notAuthUser.email}`)
        return
    }

    const hashedPIN = foundUser.pin
    let correctPIN

    correctPIN = await bcrypt.compare(notAuthUser.pin, hashedPIN)
    
    if(correctPIN){
        console.log('PIN correcto...')
        const token = jwt.sign({id: foundUser.id},
        config.jwt.secret, {
            expiresIn: 60 * 60 * 24 * 365
        })
        logger.info(`User [${notAuthUser.email}] have authenticated as an Admin User`)
        res.status(200).send({token})
        return        
    }else{
        dataUser = {
            name: foundUser.fullName,
            email: foundUser.email,
            role: foundUser.role
        }
        logger.info(`User with email ${notAuthUser.email} entered a wrong PIN number and we couldn't find it`)
        res.status(400).send(dataUser)     
    }
}))

adminUsersRouter.put('/:id', [validateAdminUsers, transformBodyToLowerCase, jwtAuthorization], processingErrors(async(req, res)=>{
    let role = req.user.role
    let user = req.user.fullName
    let updatedUser = req.body
    let foundUser
    let id = req.params.id
    
    foundUser = await adminUserController.findOneAdminUser(id)     
    
    if (!foundUser){
        logger.info(`foundUser: ${updatedUser}`)
        res.status(409).send(`Admin User:${updatedUser} has not been found at DB...`)
        return
    }
    
    if (role === 'checker' || role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send(`Usuario ${user} sin privilégios suficientes para actualizar datos en esta colección`)
        return
    }
    if (role === 'admin'){
        await adminUserController.updateAdminUser(updatedUser, id)
        logger.info(`User with name "${foundUser.fullName}" has been updated at DB`)
        res.status(200).send(`El usuario con nombre ${updatedUser.fullName} fué actualizado con éxito`)
        return
    }else{
        logger.info(`Token NOT valid to update this user account`)
        res.status(404).send(`El token usado no es valido o  No tiene privilegios para actualizar esta cuenta`)
        return
    }
}))

adminUsersRouter.delete('/:id', jwtAuthorization, processingErrors(async(req, res)=>{
    let role = req.user.role
    let user = req.user.fullName
    let foundUser
    let id = req.params.id
    
    foundUser = await adminUserController.findOneAdminUser(id)     
    
    if (!foundUser){
        logger.info(`foundUser: ${id}`)
        res.status(409).send(`Admin User with ID:${id} has not been found at DB...`)
        return
    }
    
    if (role === 'checker' || role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to delete from this collection`)
        res.status(403).send(`Usuario ${user} sin privilégios suficientes para eliminar datos en esta colección`)
        return
    }
    if (role === 'admin'){
        await adminUserController.deleteAdminUser(id)
        logger.info(`User with ID "${id}" and name ${foundUser.fullName} has been deleted from DB`)
        res.status(200).send(`El usuario de ID ${id} fué eliminado con éxito`)
        return
    }else{
        logger.info(`Token NOT valid to update this user account`)
        res.status(404).send(`El token usado no es valido o  no tiene privilegios para eliminar esta cuenta`)
        return
    }
}))

adminUsersRouter.get('/me', jwtAuthorization, (req,res) => {
    // let dataUser = req.user.fullName
    let dataUser = {
        name: req.user.fullName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        address: req.user.address,
        role: req.user.role
    }
    logger.info(dataUser)
    res.send(dataUser)
})



module.exports = adminUsersRouter

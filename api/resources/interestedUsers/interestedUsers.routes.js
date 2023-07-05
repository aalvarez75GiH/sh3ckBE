const express = require('express')
const logger = require('../../../utils/logger')
const validateUsers = require('./interestedUsers.validate')
const interestedUsersController = require('./interestedUsers.controller')
const processingErrors  = require('../../libs/errorHandler').processingErrors
const emailSender = require('../../../utils/emailSender').emailSenderModule
const intUsersRouter = express.Router()

const transformBodyToLowerCase = (req, res, next) => {
    req.body.fullName && (req.body.fullName = req.body.fullName.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}


intUsersRouter.get('/', processingErrors((req,res)=> {
    return interestedUsersController.getInterestedUsers()
    .then(interestedUsers => {
        res.json(interestedUsers)
    })
}))

// turn into try/catch and refactoring with error handler
intUsersRouter.post('/', [validateUsers, transformBodyToLowerCase], processingErrors(async(req, res)=>{
    let newUser = req.body
    let foundInterestedUser
    
    foundInterestedUser = await interestedUsersController.findInterestedUserByEmail({email: newUser.email}) 
    
    if (foundInterestedUser){
        
        let dataInterestedUser = {
            name: foundInterestedUser.fullName,
            email: foundInterestedUser.email,
            city: foundInterestedUser.city
        }
        
        logger.info(` User with email ${newUser.email} is already registered as interested User `)
        res.status(409).send(dataInterestedUser)
        return
    }

    const interestedUser = await interestedUsersController.createInterestedUser(newUser)
    logger.info(`User [${interestedUser.email}] has been created...`)
    const userCreationConfirmation = await interestedUsersController.findInterestedUserByEmail({email: newUser.email})
    logger.info(`This is userCreationConfirmation: ${userCreationConfirmation}`)
        if (userCreationConfirmation){
            let dataInterestedUser = {
                    name: userCreationConfirmation.fullName,
                    email: userCreationConfirmation.email,
                    city: userCreationConfirmation.city
            }
            emailSender('interestedUsers', interestedUser.email)
            res.status(201).send(dataInterestedUser)        
            
        }else{
            logger.error(`There was a problem with creation process at DB`)
            res.status(400).send(`Ha ocurrido un problema al momento de crear el usuario interesado en la Base de datos`)
        }
    // sendingEmailToInterestedUsers()
    // emailSender('interestedUsers', interestedUser.email)
    // res.status(201).send(`${interestedUser.fullName}`)
    
           
}))


module.exports = intUsersRouter
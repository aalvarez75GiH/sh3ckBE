const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const jwtAuthorization = passport.authenticate('jwt', { session: false })
const { v4: uuidv4 } = require('uuid')

const logger = require('../../../../utils/logger')
const emailSender = require('../../../../utils/emailSender').emailSenderModule
const config = require('../../../../config')
const authCentersController = require('./authCenter.controller')
const validateAuthCenters = require('./authCenter.validate').validateAuthCenters
const validateAuthCentersLoginRequest = require('./authCenter.validate').validateAuthCentersLoginRequest
const validateAuthCentersPicture = require('./authCenter.validate').validateAuthCentersPicture
const { saveAuthCenterPicture } = require('../../../../aws/images.controller')
const processingErrors = require('../../../libs/errorHandler').processingErrors
const authCenterRouter = express.Router()


const transformBodyToLowerCase = (req, res, next) => {
    req.body.fullName && (req.body.fullName = req.body.fullName.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

const validateID = (req, res, next) => {
    let id = req.params.id
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400). send(`id [${id}] entered is not valid...`)
        return
    }
    next()
}

authCenterRouter.get('/', (req,res)=> {
    return authCentersController.getAuthCenters()
    .then(AuthCenters => {
        res.json(AuthCenters)
    })
})

authCenterRouter.get('/:id', processingErrors(async(req,res)=> {
    let id = req.params.id
    return authCentersController.findOneAuthCenter(id)
    .then(foundAuthCenter => {
        res.json(foundAuthCenter)
    })
}))

// filtering just by city 
authCenterRouter.get('/:cityId/cities', processingErrors(async(req,res)=> {
    let cityId = req.params.cityId
    logger.info(cityId)
    // const categoryId = req.body.categoryId
    return authCentersController.findAuthCenterByCity(cityId)
    .then(authCenter => {
        res.json(authCenter)
    })
}))

// filtering just by category 
authCenterRouter.get('/:categoryId/categories', processingErrors(async(req,res)=> {
    let categoryId = req.params.categoryId
    logger.info(categoryId)
    // const categoryId = req.body.categoryId
    return authCentersController.findAuthCenterByCategory(categoryId)
    .then(authCenters => {
        res.json(authCenters)
    })
}))

// filtering just by service time 
authCenterRouter.get('/:service_time_id/servicetimes', processingErrors(async(req,res)=> {
    let service_time_id = req.params.service_time_id
    logger.info(service_time_id)
    // const categoryId = req.body.categoryId
    return authCentersController.findAuthCenterByServiceTime(service_time_id)
    .then(authCenters => {
        res.json(authCenters)
    })
}))
// filtering by city and category
authCenterRouter.get('/:cityId/:categoryId/cityandcategory', processingErrors(async(req,res)=> {
    let cityId = req.params.cityId
    let categoryId = req.params.categoryId
    // let categoryId = req.body.categoryId
    logger.info(cityId)
    logger.info(categoryId)
    // const categoryId = req.body.categoryId
    return authCentersController.findAuthCenterByCityAndCategory(cityId, categoryId)
    .then(authCenters => {
        res.json(authCenters)
    })
}))

// filtering by city, category and Service time
authCenterRouter.get('/:cityId/:categoryId/:serviceTimeId/searches', processingErrors(async(req,res)=> {
    let cityId = req.params.cityId
    let categoryId = req.params.categoryId
    let serviceTimeId = req.params.serviceTimeId
    // let categoryId = req.body.categoryId
    logger.info(cityId)
    logger.info(categoryId)
    logger.info(serviceTimeId)
    // const categoryId = req.body.categoryId
    return authCentersController.findAuthCenterByEveryThing(cityId, categoryId, serviceTimeId)
    .then(authCenters => {
        res.json(authCenters)
    })
}))


authCenterRouter.post('/', [validateAuthCenters, transformBodyToLowerCase], processingErrors(async(req, res)=>{
    let newAuthCenter = req.body
    let foundAuthCenter
    
    foundAuthCenter = await authCentersController.findAuthCenter(newAuthCenter)     
    
    if (foundAuthCenter){
        logger.info(`Checker with email ${newAuthCenter.email} already registered...`)
        res.status(409).send(`${newAuthCenter.businessName}`)
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
        await authCentersController.createAuthCenter(newAuthCenter, hashedPIN)
        logger.info(`Auth center with email [${newAuthCenter.email}] has been created...`)
        emailSender('Auth center', newAuthCenter.email, randomPIN)
        res.status(201).send(newAuthCenter.businessName)
    })
    
}))

authCenterRouter.post('/login', [validateAuthCentersLoginRequest, transformBodyToLowerCase], processingErrors(async(req,res) => {
    const notAuthAuthCenter = req.body
    let foundAuthCenter
    
    foundAuthCenter = await authCentersController.findAuthCenterForLogin({ email: notAuthAuthCenter.email })    
    
    if (!foundAuthCenter){
        logger.info(`Checker with email ${notAuthAuthCenter.email} was not found at DB`)
        res.status(400).send(`Amig@`)
        return
    }

    const hashedPIN = foundAuthCenter.pin
    let correctPIN

    correctPIN = await bcrypt.compare(notAuthAuthCenter.pin, hashedPIN)
    logger.info(correctPIN)
    
    if(correctPIN){
        console.log('PIN correcto...')
        const token = jwt.sign({id: foundAuthCenter.id},
        config.jwt.secret, {
            expiresIn: 60 * 60 * 24 * 365
        })
        logger.info(`Checker [${notAuthAuthCenter.email}] has been authenticated succesfully...`)
        res.status(200).send({token})
        return        
    }else{
        logger.info(`checker with email ${notAuthAuthCenter.email} didn't complete authentication process`)
        res.status(400).send(`El numero PIN enviado por ${notAuthAuthCenter.email} es incorrecto`)     
    }
}))





authCenterRouter.put('/:id', [validateID, validateAuthCenters, transformBodyToLowerCase, jwtAuthorization], processingErrors(async(req, res)=>{
    let role = req.user.role
    let user = req.user.fullName
    let updatedAuthCenter = req.body
    let foundAuthCenter
    let id = req.params.id
    
    foundAuthCenter = await authCentersController.findOneAuthCenter(id)     
    
    if (!foundAuthCenter){
        logger.info(`foundAuthCenter: ${updatedAuthCenter}`)
        res.status(409).send(`Auth center:${updatedAuthCenter.businessName} has not been found at DB...`)
        return
    }
    
    if (role === 'user' || role === 'checker') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send(`Usuario ${user} sin privilégios suficientes para actualizar datos en esta colección`)
        return
    }
    if (role === 'auth center'){
        await authCentersController.editAuthCenter(updatedAuthCenter, id)
        logger.info(`Auth Center with name "${foundAuthCenter.businessName}" has been updated at DB`)
        res.status(200).send(`El chequeador con nombre ${updatedAuthCenter.businessName} fué actualizado con éxito`)
        return
    }
    
    
}))


authCenterRouter.delete('/:id', [validateID, jwtAuthorization], processingErrors(async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    let id = req.params.id
    
    let foundAuthCenter
    foundAuthCenter = await authCentersController.findOneAuthCenter(id)
    // foundAuthCenter = await categoryController.findCategory(newCategory.name)
    
    if (!foundAuthCenter){
        logger.info(`foundAuthCenter: ${foundAuthCenter} has not been found at DB`)
        res.status(404).send(`Auth center with id: ${id} has not been found at DB...`)
        return
    }

    if (role === 'user' || role === 'checker') {
        logger.info(`The user with name: ${user} does NOT have privileges to delete from this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para eliminar datos de esta colección')
        return
    }
    if (role === 'admin'){
        await authCentersController.deleteAuthCenter(id)
        logger.info(`Auth Center  of name "${foundAuthCenter.businessName}" has been deleted from DB`)
        res.status(200).send(`Centro autorizado de nombre: ${foundAuthCenter.businessName} ha sido eliminad@ con exito.`)
        return
    }
    
}))

authCenterRouter.put('/:id/pictures', [validateAuthCentersPicture, jwtAuthorization], processingErrors(async(req, res ) => {
    let id = req.params.id
    let user = req.user.fullName
    let role = req.user.role
    let foundID = req.user.id
    logger.info(role)
    logger.info(id)
    logger.info(foundID)
    logger.info(`Request from Auth center [${user}] was received. We are processing image with category ID [${id}] `)
    
 
    if (role === 'user' || role === 'checker') {
        logger.info(`The user with name: ${user} does NOT have privileges to upload images to this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar una imágen a esta colección')
        return
    }
    if (role === 'admin') {
        logger.info(`Admin user with name ${user} is going to proceed to update a checker profile picture`)
        const randomizedName = `${uuidv4()}.${req.fileExtension}`
        logger.info(randomizedName)
        const pictureURL = await saveAuthCenterPicture(req.body, randomizedName) //Amazon s3 process
        logger.info(`Picture URL: ${pictureURL}`)
        const authCenterUpdated = await authCentersController.savePictureUrl(id, pictureURL)
        logger.info(`Auth center with ID [${id}] was updated with new picture link [${pictureURL}]
        changed by user [${user}]`)
        res.json(authCenterUpdated)
        return
    }
        
    if (role === 'auth center' && JSON.stringify(id) === foundID){
        logger.info(`Auth center with name ${user} wants to update its own profile picture`)
        const randomizedName = `${uuidv4()}.${req.fileExtension}`
        logger.info(randomizedName)
        const pictureURL = await saveAuthCenterPicture(req.body, randomizedName) //Amazon s3 process
        logger.info(`Picture URL: ${pictureURL}`)
        const authCenterUpdated = await authCentersController.savePictureUrl(id, pictureURL)
        logger.info(`Auth center with ID [${id}] was updated with new picture link [${pictureURL}]
        changed by user [${user}]`)
        res.json(authCenterUpdated)
        return
    }
}))


authCenterRouter.put('/:id/ratings', processingErrors(async(req, res)=>{
    let raitingsToUpdate = req.body
    let foundAuthCenter
    let id = req.params.id
    let overallRating
    foundAuthCenter = await authCentersController.findOneAuthCenter(id)     
    
    if (!foundAuthCenter){
        logger.info(`foundAuthCenter: ${updatedChecker}`)
        res.status(409).send(`Checker:${updatedChecker} has not been found at DB...`)
        return
    }
    // logger.info(foundAuthCenter)
    const newRatings = {
        rating_r: foundAuthCenter.ratings.rating_r + raitingsToUpdate.ratings.rating_r,
        rating_p: foundAuthCenter.ratings.rating_p + raitingsToUpdate.ratings.rating_p,
        rating_k: foundAuthCenter.ratings.rating_k + raitingsToUpdate.ratings.rating_k,
        rating_kw: foundAuthCenter.ratings.rating_kw + raitingsToUpdate.ratings.rating_kw,
        rating_t: foundAuthCenter.ratings.rating_t + raitingsToUpdate.ratings.rating_t,
        rating_c: foundAuthCenter.ratings.rating_c + raitingsToUpdate.ratings.rating_c,
        number_of_checks: foundAuthCenter.number_of_checks + 1
    }
    overallRating = (newRatings.rating_r + newRatings.rating_p + newRatings.rating_k + newRatings.rating_kw + newRatings.rating_t + newRatings.rating_c)/6/(newRatings.number_of_checks)
    await authCentersController.updatingRatingAndChecksNumberByAuthCenter(newRatings, id, overallRating)
    logger.info(`Ratings of Checker with name "${foundAuthCenter.businessName}" has been updated at DB`)
    res.status(200).send(`Los ratings del Centro autorizado con nombre ${foundAuthCenter.businessName} fuéron actualizados con éxito`)
}))






module.exports = authCenterRouter

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const jwtAuthorization = passport.authenticate('jwt', { session: false })
const { v4: uuidv4 } = require('uuid')

const logger = require('../../../../utils/logger')
const emailSender = require('../../../../utils/emailSender').emailSenderModule
const config = require('../../../../config')
const checkersController = require('./checkers.controller')
const validateCheckers = require('./checkers.validate').validateCheckers
const validateCheckersLoginRequest = require('./checkers.validate').validateCheckersLoginRequest
const validateCheckerPicture = require('./checkers.validate').validateCheckerPicture
const { saveCheckerPicture } = require('../../../../aws/images.controller')
const processingErrors = require('../../../libs/errorHandler').processingErrors
const checkersRouter = express.Router()


const transformBodyToLowerCase = (req, res, next) => {
    req.body.fullName && (req.body.fullName = req.body.fullName.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}

const validarID = (req, res, next) => {
    let id = req.params.id
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400). send(`id [${id}] entered is not valid...`)
        return
    }
    next()
}

checkersRouter.get('/', (req,res)=> {
    return checkersController.getCheckers()
    .then(checkers => {
        res.json(checkers)
    })
})

checkersRouter.get('/:id', processingErrors(async(req,res)=> {
    let id = req.params.id
    return checkersController.findOneChecker(id)
    .then(foundChecker => {
        res.json(foundChecker)
    })
}))

// filtering just by city 
checkersRouter.get('/:cityId/cities', processingErrors(async(req,res)=> {
    let cityId = req.params.cityId
    logger.info(cityId)
    // const categoryId = req.body.categoryId
    return checkersController.findCheckerByCity(cityId)
    .then(checkers => {
        res.json(checkers)
    })
}))

// filtering just by category 
checkersRouter.get('/:categoryId/categories', processingErrors(async(req,res)=> {
    let categoryId = req.params.categoryId
    logger.info(categoryId)
    // const categoryId = req.body.categoryId
    return checkersController.findCheckerByCategory(categoryId)
    .then(checkers => {
        res.json(checkers)
    })
}))

// filtering just by service time 
checkersRouter.get('/:service_time_id/servicetimes', processingErrors(async(req,res)=> {
    let service_time_id = req.params.service_time_id
    logger.info(service_time_id)
    // const categoryId = req.body.categoryId
    return checkersController.findCheckerByServiceTime(service_time_id)
    .then(checkers => {
        res.json(checkers)
    })
}))
// filtering by city and category
checkersRouter.get('/:cityId/:categoryId/cityandcategory', processingErrors(async(req,res)=> {
    let cityId = req.params.cityId
    let categoryId = req.params.categoryId
    // let categoryId = req.body.categoryId
    logger.info(cityId)
    logger.info(categoryId)
    // const categoryId = req.body.categoryId
    return checkersController.findCheckerByCityAndCategory(cityId, categoryId)
    .then(checkers => {
        res.json(checkers)
    })
}))

// filtering by city, category and Service time
checkersRouter.get('/:cityId/:categoryId/:serviceTimeId/searches', processingErrors(async(req,res)=> {
    let cityId = req.params.cityId
    let categoryId = req.params.categoryId
    let serviceTimeId = req.params.serviceTimeId
    // let categoryId = req.body.categoryId
    logger.info(cityId)
    logger.info(categoryId)
    logger.info(serviceTimeId)
    // const categoryId = req.body.categoryId
    return checkersController.findCheckerByEveryThing(cityId, categoryId, serviceTimeId)
    .then(checkers => {
        res.json(checkers)
    })
}))


checkersRouter.post('/', [validateCheckers, transformBodyToLowerCase], processingErrors(async(req, res)=>{
    let newChecker = req.body
    let foundChecker
    
    foundChecker = await checkersController.findChecker(newChecker)     
    
    if (foundChecker){
        logger.info(`Checker with email ${newChecker.email} already registered...`)
        res.status(409).send(`${newChecker.fullName}`)
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
        await checkersController.createChecker(newChecker, hashedPIN)
        logger.info(`Checker with email [${newChecker.email}] has been created...`)
        emailSender('checkers', newChecker.email, randomPIN)
        res.status(201).send(newChecker.fullName)
    })
    
}))

checkersRouter.post('/login', [validateCheckersLoginRequest, transformBodyToLowerCase], processingErrors(async(req,res) => {
    const notAuthChecker = req.body
    let foundChecker
    
    foundChecker = await checkersController.findCheckerForLogin({ email: notAuthChecker.email })    
    
    if (!foundChecker){
        logger.info(`Checker with email ${notAuthChecker.email} was not found at DB`)
        res.status(400).send(`Amig@`)
        return
    }

    const hashedPIN = foundChecker.pin
    let correctPIN

    correctPIN = await bcrypt.compare(notAuthChecker.pin, hashedPIN)
    
    if(correctPIN){
        console.log('PIN correcto...')
        const token = jwt.sign({id: foundChecker.id},
        config.jwt.secret, {
            expiresIn: 60 * 60 * 24 * 365
        })
        logger.info(`Checker [${notAuthChecker.email}] has been authenticated succesfully...`)
        res.status(200).send({token})
        return        
    }else{
        logger.info(`checker with email ${notAuthChecker.email} didn't complete authentication process`)
        res.status(400).send(`${foundChecker.fullName}`)     
    }
}))





checkersRouter.put('/:id', [validateCheckers, transformBodyToLowerCase, jwtAuthorization], processingErrors(async(req, res)=>{
    let role = req.user.role
    let user = req.user.fullName
    let updatedChecker = req.body
    let foundChecker
    let id = req.params.id
    
    foundChecker = await checkersController.findOneChecker(id)
    // logger.info(foundChecker)     
    logger.info(`foundChecker: ${updatedChecker.category[0].category_name}`)
    
    if (!foundChecker){
        res.status(409).send(`Checker:${updatedChecker} has not been found at DB...`)
        return
    }
    
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send(`Usuario ${user} sin privilégios suficientes para actualizar datos en esta colección`)
        return
    }
    if (role === 'admin'){
        await checkersController.editChecker(updatedChecker, id)
        logger.info(`Checker with name "${foundChecker.fullName}" has been updated at DB`)
        res.status(200).send(`El chequeador con nombre ${updatedChecker.fullName} fué actualizado con éxito`)
        return
    }
    
    
}))

checkersRouter.put('/:id/ratings', processingErrors(async(req, res)=>{
    // let role = req.user.role
    // let user = req.user.fullName
    let raitingsToUpdate = req.body
    let foundChecker
    let id = req.params.id
    let overallRating
    foundChecker = await checkersController.findOneChecker(id)     
    
    if (!foundChecker){
        logger.info(`foundChecker: ${updatedChecker}`)
        res.status(409).send(`Checker:${updatedChecker} has not been found at DB...`)
        return
    }
    // logger.info(foundChecker)
    const newRatings = {
        rating_r: foundChecker.ratings.rating_r + raitingsToUpdate.ratings.rating_r,
        rating_p: foundChecker.ratings.rating_p + raitingsToUpdate.ratings.rating_p,
        rating_k: foundChecker.ratings.rating_k + raitingsToUpdate.ratings.rating_k,
        rating_kw: foundChecker.ratings.rating_kw + raitingsToUpdate.ratings.rating_kw,
        rating_t: foundChecker.ratings.rating_t + raitingsToUpdate.ratings.rating_t,
        rating_c: foundChecker.ratings.rating_c + raitingsToUpdate.ratings.rating_c,
        number_of_checks: foundChecker.number_of_checks + 1
    }
    overallRating = (newRatings.rating_r + newRatings.rating_p + newRatings.rating_k + newRatings.rating_kw + newRatings.rating_t + newRatings.rating_c)/6/(newRatings.number_of_checks)
    await checkersController.updatingRatingAndChecksNumberByChecker(newRatings, id, overallRating)
    logger.info(`Ratings of Checker with name "${foundChecker.fullName}" has been updated at DB`)
    res.status(200).send(`Los ratings del chequeador con nombre ${foundChecker.fullName} fuéron actualizados con éxito`)
    
}))

checkersRouter.delete('/:id', [jwtAuthorization], processingErrors(async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    let id = req.params.id
    
    let foundChecker
    foundChecker = await checkersController.findOneChecker(id)
    // foundChecker = await categoryController.findCategory(newCategory.name)
    
    if (!foundChecker){
        logger.info(`foundChecker: ${foundChecker}`)
        res.status(409).send(`Checker with id: ${id} has not been found at DB...`)
        return
    }

    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to delete from this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para eliminar datos de esta colección')
        return
    }
    if (role === 'admin'){
        await checkersController.deleteChecker(id)
        logger.info(`Checker of name "${foundChecker.fullName}" has been deleted from DB`)
        res.status(200).send(`Chequeador de nombre: ${foundChecker.fullName} ha sido eliminad@ con exito.`)
        return
    }
    
}))

checkersRouter.put('/:id/pictures', [validateCheckerPicture, jwtAuthorization], processingErrors(async(req, res ) => {
    let id = req.params.id
    let user = req.user.fullName
    let role = req.user.role
    let foundID = req.user.id
    logger.info(role)
    logger.info(id)
    logger.info(foundID)
    logger.info(`Request from User [${user}] was received. We are processing image with category ID [${id}] `)
    
 
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to upload images to this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar una imágen a esta colección')
        return
    }
    if (role === 'admin') {
        logger.info(`Admin user with name ${user} is going to proceed to update a checker profile picture`)
        const randomizedName = `${uuidv4()}.${req.fileExtension}`
        logger.info(randomizedName)
        const pictureURL = await saveCheckerPicture(req.body, randomizedName) //Amazon s3 process
        logger.info(`Picture URL: ${pictureURL}`)
        const checkerUpdated = await checkersController.savePictureUrl(id, pictureURL)
        logger.info(`Checker with ID [${id}] was updated with new picture link [${pictureURL}]
        changed by user [${user}]`)
        res.json(checkerUpdated)
        return
    }
        
    if (role === 'checker' && JSON.stringify(id) === foundID){
        logger.info(`Checker with name ${user} wants to update his/her own profile picture`)
        const randomizedName = `${uuidv4()}.${req.fileExtension}`
        logger.info(randomizedName)
        const pictureURL = await saveCheckerPicture(req.body, randomizedName) //Amazon s3 process
        logger.info(`Picture URL: ${pictureURL}`)
        const checkerUpdated = await checkersController.savePictureUrl(id, pictureURL)
        logger.info(`Checker with ID [${id}] was updated with new picture link [${pictureURL}]
        changed by user [${user}]`)
        res.json(checkerUpdated)
        return
    }
}))


// Reviews End Points ******************************************
checkersRouter.get('/reviews', (req,res) => {
    return checkersController.getReviews()
    .then(foundReviews => {
        res.json(foundReviews)
    })
})

// checkersRouter.get('/', (req,res)=> {
//     return checkersController.getCheckers()
//     .then(checkers => {
//         res.json(checkers)
//     })
// })

checkersRouter.post('/reviews', processingErrors(async(req,res) => {
    const newReview = req.body
    let foundChecker
    foundChecker = await checkersController.findOneChecker(newReview.user_id)

    if (!foundChecker){
        logger.info(`Checker with Id ${newreView.user_id} has not been found at DB`)
        res.status(404).send(`El chequeador con ID ${newreView.user_id} no ha sido encontrado en la BD`)
        return
    }
    await checkersController.createReview(newReview)
    logger.info(`Review for checker: [${foundChecker.fullName}] has been registered`)
    res.status(201).send(newRevie)
    return
}))


module.exports = checkersRouter

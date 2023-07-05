const express = require('express')
const passport = require('passport')
const jwtAuthorization = passport.authenticate('jwt', { session: false })


// const logger = require('../../../utils/logger')
// const jwtAuthorization = passport.authenticate('jwt', { session: false })
// const config = require('../../../config')
const validateCity = require('./city.validate')
const cityController = require('./city.controller')
const logger = require('../../../../utils/logger')
const processingErrors = require('../../../libs/errorHandler').processingErrors 
const cityRouter = express.Router()



const transformFirstLetterToUpperCase = (req, res, next) => {
    // req.body.fullName && (req.body.fullName = req.body.fullName.toLowerCase())
    // req.body.email && (req.body.email = req.body.email.toLowerCase())
    // next()
}

const validarID = (req, res, next) => {
    let id = req.params.id
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400). send(`id [${id}] entered is not valid...`)
        return
    }
    next()
}


cityRouter.get('/', processingErrors((req,res)=> {
    // let user = req.user.fullName
    // let role = req.user.role
    return cityController.getCities()
    .then(cities => {
        // if (role === 'user' || role === 'admin' || role === 'google_user') {
            res.status(200).json(cities)
            logger.info(`Cities were found at DB and have been sent to requester`)
            return
        // }
    })
}))

cityRouter.get('/:id', [validarID, jwtAuthorization], processingErrors((req,res)=> {
    const id = req.params.id
    let user = req.user.fullName
    let role = req.user.role
    logger.info(id)
    // res.send('Hello i am get....')
    return cityController.getOneCity(id)
    .then(foundCity => {
        if (!foundCity) {
            logger.info(`City has not been found at DB`)
            res.status(404).send('La ciudad que intenta encontrar no se encuentra')
            return 
        } 
        if (role === 'admin' || role === 'user' ){
            logger.info(`City with name ${foundCity.name} has been found found at DB`)
            res.status(200).send(foundCity)
            return
        }
        
    })
}))


cityRouter.post('/', [validateCity, jwtAuthorization ], processingErrors(async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    let newCity = req.body
    logger.info('Ciudad llegando en el req.body: ', newCity)
    let foundCity

    foundCity = await cityController.findCity(newCity.name)
    if (foundCity) { 
        logger.info(`City with name ${newCity.name} is already created at DB`)
        res.status(409).send('La ciudad ya ha sido creada anteriormente...')
        return
    }

    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await cityController.createCity(newCity)
        logger.info(`City with name ${newCity.name} has been created successfully at DB`)
        res.status(201).send(newCity.name)
        return
    }

}))

cityRouter.put('/:id', [validarID, validateCity, jwtAuthorization ], async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    logger.info(`Name: ${user}`)
    logger.info(`Role: ${role}`)
    let newCity = req.body
    let id = req.params.id
    logger.info('Ciudad llegando en el req.body: ', newCity)
    let foundCity

    foundCity = await cityController.findOneCity(id)
    if (!foundCity) { 
        logger.info(`City with name ${newCity.name} NOT found at DB`)
        res.status(404).send('La ciudad no se ha conseguido en la BD...')
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para modificar esta colección')
        return
    }
    if (role === 'admin'){
        await cityController.editCity(id, newCity)
        logger.info(`City with name ${newCity.name} has been updated successfully at DB`)
        res.status(201).send('Ciudad actualizada con éxito...')
        return
    }
    
})

cityRouter.delete('/:id', [validarID, jwtAuthorization], async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    logger.info(`Name: ${user}`)
    logger.info(`Role: ${role}`)
    // let newCity = req.body
    let id = req.params.id
    logger.info(`City id to remove: ${id} `)

    cityToDelete = await cityController.findOneCity(id)
    // .then( foundCity => {

        if (!cityToDelete) { 
            logger.info(`City with name NOT found at DB`)
            res.status(404).send('La ciudad no se ha conseguido en la BD...')
            return
        }
        if (role === 'user') {
            logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
            res.status(403).send('Usuario sin privilégios suficientes para modificar esta colección')
            return
        }
        if (role === 'admin'){
            await cityController.deleteCity(id)
            logger.info(`City with name ${cityToDelete.name} has been deleted successfully from DB`)
            res.status(200).send('Ciudad eliminada con éxito...')
            return
        }
})

module.exports = cityRouter
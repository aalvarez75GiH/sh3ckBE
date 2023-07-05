const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')


const bluePrintAdminUsers = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    address: Joi.string().min(3).max(300).required(),
    ID: Joi.string().length(8).pattern(/^[0-9]+$/).required(),
    role: Joi.string().required()
})

const validateAdminUsers = ( req, res, next ) => {
    const result = bluePrintAdminUsers.validate(req.body, {abortEarly: false, convert: false})
    if (result.error === undefined){
        next()
    }else{
        const validationErrors = result.error.details.reduce((accumulator, error)=> {
            return accumulator + `[${error.message}]`
        },"")
        logger.warn(`Information sent by user is not complete ${validationErrors}`)
        res.status(400).send(`Errors at the request: ${validationErrors}`)
    }
}

const bluePrintAdminLoginRequest = Joi.object({
    email: Joi.string().email().required(),
    pin: Joi.string().required()
}) 

const validateAdminLoginRequest = ( req, res, next ) => {
    const result = bluePrintAdminLoginRequest.validate(req.body, {abortEarly:false, convert: false})
    if (result.error === undefined){
        next()
    }else {
        const validationErrors = result.error.details.reduce((accumulator, error)=> {
            return accumulator + `[${error.message}]`
        },"")
        logger.warn(`Creadentials sent by user is not complete ${validationErrors}`)
        res.status(400).send(`Errors at the request: ${validationErrors}`)
    }

}
module.exports = {
    validateAdminUsers,
    validateAdminLoginRequest 
}
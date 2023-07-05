const Joi = require('@hapi/joi')
const logger = require('../../../utils/logger')

const bluePrintInterestedUsers = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(), 
    city: Joi.string().min(3).max(100).required()
})

module.exports = ( req, res, next ) => {
    const result = bluePrintInterestedUsers.validate(req.body, {abortEarly: false, convert: false})
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


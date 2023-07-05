const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')

const bluePrintCity = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    zip_code: Joi.string().min(1).max(4).required(),  
})

module.exports = ( req, res, next ) => {
    const result = bluePrintCity.validate(req.body, {abortEarly: false, convert: false})
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



const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')

const bluePrintServiceTime = Joi.object({
    caption: Joi.string().min(1).max(10).required(),
    base: Joi.number().max(20).required(),
    description: Joi.string().min(1).max(20).required()
})

module.exports = validateServiceTime = (req, res, next) => {
    const result = bluePrintServiceTime.validate(req.body, {abortEarly: false, convert: false})
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
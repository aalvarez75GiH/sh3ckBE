const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')

const bluePrintTransaction = Joi.object({
    user_name: Joi.string().max(50).allow(""),
    reference_number: Joi.string().min(1).max(12).required(),
    date: Joi.string().required(),
    amount: Joi.number().required()
})

module.exports = validateTransaction = (req, res, next) => {
    const result = bluePrintTransaction.validate(req.body, {abortEarly: false, convert: false})
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
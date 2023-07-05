const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')

const bluePrintCheckersReviewsRequest = Joi.object({
    email: Joi.string().email().required(),
    pin: Joi.string().required()
}) 
const validateCheckerReviewRequest = async(req,res,next) => {
    const result = bluePrintCheckersReviewsRequest.validate(req.body, {abortEarly:false, convert: false})
    if (result.error === undefined){
        next()
    }else {
        const validationErrors = result.error.details.reduce((accumulator, error)=> {
            return accumulator + `[${error.message}]`
        },"")
        logger.warn(`Credentials sent by checker is not complete ${validationErrors}`)
        res.status(400).send(`Errors at the request: ${validationErrors}`)
    }
}

module.exports = validateCheckerReviewRequest
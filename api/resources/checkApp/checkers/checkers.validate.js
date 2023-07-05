const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')
const CONTENT_TYPES_ALLOWED = [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg']
const fileType = require('file-type')

const bluePrintCheckers = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    identification: Joi.string().min(3).max(10).required(),
    address: Joi.string().min(3).max(300).required(),
    picture: Joi.string(),
    backgroundCheck: Joi.boolean().required(),
    city_name: Joi.string().min(3).max(100).required(),
    cityToCheck: Joi.string().required(),
    category: Joi.array().items({
        category_name: Joi.string().min(3).max(50).required(),
        categoryToCheck: Joi.string().required(),
    }),
    service_time: Joi.array().items({
        service_time_caption: Joi.string().min(1).max(10).required(),
        service_time_id: Joi.string().required()

    }),
    rating: Joi.number().max(5),
    ratings: Joi.object({
        rating_r: Joi.number().max(5).required(),
        rating_p: Joi.number().max(5).required(),
        rating_k: Joi.number().max(5).required(),
        rating_kw: Joi.number().max(5).required(),
        rating_t: Joi.number().max(5).required(),
        rating_c: Joi.number().max(5).required(),

    }),
    number_of_checks: Joi.number().max(5),
    earnings: Joi.number().required()
})


const validateCheckers = ( req, res, next ) => {
    const result = bluePrintCheckers.validate(req.body, {abortEarly: false, convert: false})
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
const bluePrintCheckersLoginRequest = Joi.object({
    email: Joi.string().email().required(),
    pin: Joi.string().required()
}) 

const validateCheckersLoginRequest = ( req, res, next ) => {
    const result = bluePrintCheckersLoginRequest.validate(req.body, {abortEarly:false, convert: false})
    if (result.error === undefined){
        next()
    }else {
        const validationErrors = result.error.details.reduce((accumulator, error)=> {
            return accumulator + `[${error.message}]`
        },"")
        logger.warn(`Creadentials sent by checker is not complete ${validationErrors}`)
        res.status(400).send(`Errors at the request: ${validationErrors}`)
    }

}

const validateCheckerPicture = async(req, res, next) => {
    const contentType = req.get('Content-Type')
    if (!CONTENT_TYPES_ALLOWED.includes(contentType)){
        logger.warn(`Request to modify picture of checker with ID [${req.params.id}] DO NOT contain a valid content type [${contentType}]`)
        res.status(400).send(`File of type: ${contentType} is not supported. Please, use one
        of these types of images ${CONTENT_TYPES_ALLOWED.join(", ")}`)
        return
    }

    let fileInfo = fileType(req.body)
    // let fileInfo = await fileTypeFromFile(req.body)
    console.log(fileInfo)    
    if(!CONTENT_TYPES_ALLOWED.includes(fileInfo.mime)){
        const message = `Disparity between content type [${contentType}] and type of file [${fileInfo.ext}]. Request won't be processed`
        logger.warn(`${message}. Request directed to checker with ID [${req.params.id}]`)
        res.status(400).send(message)
        return
    }
    req.fileExtension = fileInfo.ext
    next()
}


module.exports = {
    validateCheckers,
    validateCheckerPicture,
    validateCheckersLoginRequest
}



 









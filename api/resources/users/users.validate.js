const Joi = require('@hapi/joi')
const logger = require('../../../utils/logger')
const CONTENT_TYPES_ALLOWED = [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg']
const fileType = require('file-type')

const bluePrintUsers = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().length(11).pattern(/^[0-9]+$/).required(),
    picture: Joi.string()
})

const validateUsers = ( req, res, next ) => {
    const result = bluePrintUsers.validate(req.body, {abortEarly: false, convert: false})
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

const bluePrintLoginRequest = Joi.object({
    email: Joi.string().email().required(),
    pin: Joi.string().required()
}) 

const validateLoginRequest = ( req, res, next ) => {
    const result = bluePrintLoginRequest.validate(req.body, {abortEarly:false, convert: false})
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

const bluePrintNewPINRequest = Joi.object({
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().length(11).pattern(/^[0-9]+$/).required()
})

const validateNewPINRequest = (req, res, next) => {
    const result = bluePrintNewPINRequest.validate(req.body, {abortEarly: false, convert: false })
    if (result.error === undefined) {
        next()
    }else{
        const validationErrors = result.error.details.reduce((accumulator, error)=> {
            return accumulator + `[${error.message}]`
        },"")
        logger.warn(`Credentials sent by user is not complete ${validationErrors}`)
        res.status(400).send(`Errors at the request: ${validationErrors}`)
    }
}

const validateUserPicture = async(req, res, next) => {
    const contentType = req.get('Content-Type')
    if (!CONTENT_TYPES_ALLOWED.includes(contentType)){
        logger.warn(`Request to modify picture of user with ID [${req.params.id}] DO NOT contain a valid content type [${contentType}]`)
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
    validateUsers,
    validateLoginRequest,
    validateNewPINRequest,
    validateUserPicture
}
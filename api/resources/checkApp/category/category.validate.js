const Joi = require('@hapi/joi')
const logger = require('../../../../utils/logger')
const fileType = require('file-type')
// import {fileTypeFromFile} from 'file-type'
const CONTENT_TYPES_ALLOWED = [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg']

const bluePrintCategory = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(1).max(300).required(), 
    image: Joi.string(),
})

const validateCategory = (req, res, next) => {
    const result = bluePrintCategory.validate(req.body, {abortEarly: false, convert: false})
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

const validateCategoryImage = async(req, res, next) => {
    const contentType = req.get('Content-Type')
    if (!CONTENT_TYPES_ALLOWED.includes(contentType)){
        logger.warn(`Request to modify image of category with ID [${req.params.id}] DO NOT contain a valid content type [${contentType}]`)
        res.status(400).send(`File of type: ${contentType} is not supported. Please, use one
        of these types of images ${CONTENT_TYPES_ALLOWED.join(", ")}`)
        return
    }

    let fileInfo = fileType(req.body)
    // let fileInfo = await fileTypeFromFile(req.body)
    console.log(fileInfo)    
    if(!CONTENT_TYPES_ALLOWED.includes(fileInfo.mime)){
        const message = `Disparity between content type [${contentType}] and type of file [${fileInfo.ext}]. Request won't be processed`
        logger.warn(`${message}. Request directed to category with ID [${req.params.id}]`)
        res.status(400).send(message)
        return
    }
    req.fileExtension = fileInfo.ext
    next()
}

module.exports = {
    validateCategory,
    validateCategoryImage
}
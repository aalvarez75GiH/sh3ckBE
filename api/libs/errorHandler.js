const logger = require('../../utils/logger')
const mongoose = require('mongoose')

exports.processingErrors = (fn) => {
    return function(req, res, next) {
        fn(req, res, next).catch(next)
    }
}

exports.processingDBErrors = (err, req, res, next) => {
    console.log('passing for processingDBErrors...')
    if (err instanceof mongoose.Error || err.name === 'MongoError'){
        console.log('its a Mongo Error')
        logger.error('An error related with MongoDB has occurred')
        err.message = 'Ha ocurrido un error inésperado. Para más información contacte al equipo de soporte de Sh3ck'
        err.status = 500
    }
    next(err)
}

exports.processingBodySizeErrors = (error, req, res, next) => {
    if (error.status === 413){
        logger.error(`Request sent to route [${req.path}] has exceeded limit size. Request wont be processed`)
        error.message = `Request sent to route [${req.path}] has exceeded limit size. Request wont be processed`
    }
    next(error)
}

exports.productionErrors = (err, req, res, next) => {
 res.status(err.status || 500)
 res.send({
     message: err.message
 })
}

exports.developmentErrors = (err, req, res, next) => {
    console.log('its a development Error')
    console.log(req.body)
    res.status(err.status || 500)
    res.send({
        message: err.message, 
        stack: err.stack || ''
    }) 
}

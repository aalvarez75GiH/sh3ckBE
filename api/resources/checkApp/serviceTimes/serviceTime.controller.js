const serviceTime = require('./serviceTime.model')
const logger = require('../../../../utils/logger')

const getServiceTime = () => {
    return serviceTime.find({}) 
}

const getOneServiceTimeById = (id) => {
    return serviceTime.findById(id)
}

const findServiceTimeByCaption = (caption) => {
    logger.info(`caption at controller: ${caption}`)
    if (caption) return serviceTime.findOne({ caption: caption })
    throw new Error ('Get Service Time function from controller was called without specifying a name')
}

const createServiceTime = (newServiceTime) => {
    return new serviceTime({
        ...newServiceTime,
    }).save()      
}

const editServiceTime = (id, newServiceTime) => {
    return serviceTime.findOneAndUpdate({_id: id}, {
        ...newServiceTime,
        caption: newServiceTime.caption,
        base: newServiceTime.base,
        description: newServiceTime.description
    },{
        new: true //This option is in order to return the new document modified
    })
}

const deleteServiceTime = (id) => {
    return serviceTime.findByIdAndRemove(id)
}


module.exports = {
    getServiceTime,
    findServiceTimeByCaption,
    createServiceTime,
    editServiceTime,
    deleteServiceTime,
    getOneServiceTimeById
}
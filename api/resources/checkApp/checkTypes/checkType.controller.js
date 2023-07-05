const checkType = require('./checkTypes.model')
const logger = require('../../../../utils/logger')

const getCheckTypes = () => {
    return checkType.find({}) 
}

const getOneCheckTypeById = (id) => {
    return checkType.findById(id)
}

const findCheckTypeByCaption = (caption) => {
    logger.info(`caption at controller: ${caption}`)
    if (caption) return checkType.findOne({ caption: caption })
    throw new Error ('Get Check type function from controller was called without specifying a name')
}


const createCheckType = (newCheckType) => {
    return new checkType({
        ...newCheckType,
    }).save()      
}

const editCheckType = (id, updatedCheckType) => {
    return checkType.findOneAndUpdate({_id: id}, {
        ...updatedCheckType,
        caption: updatedCheckType.caption,
        base: updatedCheckType.base,
        description: updatedCheckType.description
    },{
        new: true //This option is in order to return the new document modified
    })
}

const deleteCheckType = (id) => {
    return checkType.findByIdAndRemove(id)
}

module.exports = {
    getCheckTypes,
    getOneCheckTypeById,
    findCheckTypeByCaption,
    createCheckType,
    editCheckType,
    deleteCheckType
    
}
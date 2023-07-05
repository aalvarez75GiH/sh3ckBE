const category = require('./category.model')
const logger = require('../../../../utils/logger')

const getCategory = () => {
    return category.find({}) 
}
const findCategory = (name) => {
    logger.info(`name at controller: ${name}`)
    if (name) return category.findOne({ name: name })
    throw new Error ('Get category function from controller was called without specifying a name')
}
const findOneCategory = (id) => {
    return category.findById(id)
}

const createCategory = (newCategory) => {
    return new category({
        ...newCategory,
    }).save()      
}

const editCategory = (id, newCategory) => {
    return category.findOneAndUpdate({_id: id}, {
        ...newCategory,
        name: newCategory.name,
        description: newCategory.description
    },{
        new: true //This option is in order to return the new document modified
    })
}

const deleteCategory = (id) => {
    return category.findByIdAndRemove(id)
}

const saveImageUrl = (id, imageUrl) => {
    return category.findOneAndUpdate({_id: id},{
        image: imageUrl
    },{
        new: true //This option is in order to return the new document modified
    })
}

module.exports = {
    getCategory,
    findCategory,
    createCategory, 
    editCategory,
    findOneCategory,
    deleteCategory,
    saveImageUrl
}
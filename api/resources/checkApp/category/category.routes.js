const express = require('express')
const passport = require('passport')
const { v4: uuidv4 } = require('uuid')
const jwtAuthorization = passport.authenticate('jwt', { session: false })

const categoryController = require('./category.controller')
const logger = require('../../../../utils/logger')
const processingErrors = require('../../../libs/errorHandler').processingErrors 
const validateCategory = require('./category.validate').validateCategory
const validateCategoryImage = require('./category.validate').validateCategoryImage
const { saveCategoryImage } = require('../../../../aws/images.controller')
const categoryRouter = express.Router()

const validarID = (req, res, next) => {
    let id = req.params.id
    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400). send(`id [${id}] entered is not valid...`)
        return
    }
    next()
}

categoryRouter.get('/', processingErrors((req,res) => {
    return categoryController.getCategory()
    .then((category) => {
        res.status(200).json(category)
        logger.info(`Categories were found at DB and have been sent to requester`)
        return
    })   
}))

// categoryRouter.get('/subcategory/:id', processingErrors((req,res) => {
//     let id = req.params.id
//     return categoryController.findingElectronicsSubCategories(id)
//     .then((category) => {
//         res.status(200).json(category)
//         logger.info(`Categories were found at DB and have been sent to requester`)
//         return
//     })   
// }))


categoryRouter.post('/',[jwtAuthorization] , processingErrors(async(req,res) => {
    let user = req.user.fullName
    let role = req.user.role
    let newCategory = req.body
    logger.info(`category name: ${newCategory.name}`)
    logger.info(`newCategory: ${newCategory}`)
    let foundCategory
    foundCategory = await categoryController.findCategory(newCategory.name)
    if (foundCategory){
        logger.info(`foundCategory: ${foundCategory}`)
        res.status(409).send(`Category:${foundCategory} is already created at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await categoryController.createCategory(newCategory)
        logger.info(`Category with name ${newCategory.name} has been created successfully at DB`)
        res.status(201).send(newCategory.name)
        return
    }
 
}))

categoryRouter.put('/:id', [validarID, validateCategory, jwtAuthorization ], async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    logger.info(`Name: ${user}`)
    logger.info(`Role: ${role}`)
    let newCategory = req.body
    let id = req.params.id
    
    let foundCategory
    foundCategory = await categoryController.findOneCategory(id)
    // foundCategory = await categoryController.findCategory(newCategory.name)
    
    if (!foundCategory){
        logger.info(`foundCategory: ${foundCategory}`)
        res.status(409).send(`Category:${foundCategory} has not been found at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await categoryController.editCategory(id, newCategory)
        logger.info(`Category with name "${foundCategory.name}" has been updated to "${newCategory.name}" at DB`)
        res.status(201).send(newCategory.name)
        return
    }
    
})

categoryRouter.delete('/:id', [validarID, jwtAuthorization ], async(req,res)=>{
    let user = req.user.fullName
    let role = req.user.role
    logger.info(`Name: ${user}`)
    logger.info(`Role: ${role}`)
    let id = req.params.id
    
    let foundCategory
    foundCategory = await categoryController.findOneCategory(id)
    // foundCategory = await categoryController.findCategory(newCategory.name)
    
    if (!foundCategory){
        logger.info(`foundCategory: ${foundCategory}`)
        res.status(409).send(`Category:${foundCategory} has not been found at DB...`)
        return
    }
    if (role === 'user') {
        logger.info(`The user with name: ${user} does NOT have privileges to Update this collection`)
        res.status(403).send('Usuario sin privilégios suficientes para agregar datos a esta colección')
        return
    }
    if (role === 'admin'){
        await categoryController.deleteCategory(id)
        logger.info(`Category with name "${foundCategory.name}" has been deleted from DB`)
        res.status(200).send('la categoría ha sido eliminada con exito...')
        return
    }
    
})

categoryRouter.put('/:id/images', [jwtAuthorization, validateCategoryImage], processingErrors(async(req, res ) => {
    const id = req.params.id
    const user = req.user.fullName    
    logger.info(`Request from User [${user}] was received. We are processing image with category ID [${id}] `)
    
    const randomizedName = `${uuidv4()}.${req.fileExtension}`
    logger.info(randomizedName)
    const imageURL = await saveCategoryImage(req.body, randomizedName) //Amazon s3 process
    logger.info(`imageURL: ${imageURL}`)
    const categoryUpdated = await categoryController.saveImageUrl(id, imageURL)
    logger.info(`Category with ID [${id}] was updated with new image link [${imageURL}]
    changed by user [${user}]`)
    res.json(categoryUpdated)
}))


module.exports = categoryRouter

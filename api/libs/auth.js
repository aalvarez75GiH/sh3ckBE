const logger = require('../../utils/logger')
const passportJWT = require('passport-jwt')
const config = require('../../config')
const usersController = require('../resources/users/users.controller')
const adminUsersController = require('../resources/adminApp/adminUsers/adminUsers.controller')
const checkersController = require('../resources/checkApp/checkers/checkers.controller')
const authCentersController = require('../resources/checkApp/authCenters/authCenter.controller')

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}
module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    logger.info('jwtPayload:', jwtPayload)
    usersController.findUserForLogin({ id: jwtPayload.id})
    .then( foundUser => {
        if(!foundUser){
            adminUsersController.findAdminUserForLogin({ id: jwtPayload.id})
            .then( foundAdmin => {
                if(!foundAdmin){
                    checkersController.findCheckerForLogin({id: jwtPayload.id })
                    .then(foundChecker => {
                        if(!foundChecker){
                            authCentersController.findAuthCenterForLogin({id: jwtPayload.id})
                            .then(foundAuthCenter => {
                                if(!foundAuthCenter){
                                    logger.warn(`JWT not valid. Token couldn't be found...`)
                                    next(null, false)
                                    return
                                }
                                next(null,{
                                    fullName: foundAuthCenter.businessName,
                                    role: foundAuthCenter.role,
                                    id: JSON.stringify(foundAuthCenter._id)
                                })
                            })
                            return 
                        }
                        next(null, {
                            fullName: foundChecker.fullName,
                            role: foundChecker.role,
                            id: JSON.stringify(foundChecker._id)    
                        })
                    }).catch(error => {
                        logger.error(error)
                        next(error, false)                
                    })
                }else{
                    next(null, {
                        fullName: foundAdmin.fullName,
                        email: foundAdmin.email,
                        phoneNumber: foundAdmin.phoneNumber,
                        address: foundAdmin.address,
                        role: foundAdmin.role
                            
                    }) 
                }
                
            }) 
            return
        }
        logger.info(`User ${ foundUser.email } has provided a valid token `)
        next(null, {
            fullName: foundUser.fullName,
            email: foundUser.email,
            phoneNumber: foundUser.phoneNumber,
            picture: foundUser.picture,
            role: foundUser.role,
            token_id: jwtPayload.id
        })            
    })
    .catch(error => {
        logger.error(`An error occurred when we tried to find user with id: [${jwtPayload.id}]`, error)
        next(error, false)
    })
})

// module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
//     logger.info('jwtPayload:', jwtPayload)
//     usersController.findUserForLogin({ id: jwtPayload.id})
//     .then( foundUser => {
//         if(!foundUser){
//             adminUsersController.findAdminUserForLogin({ id: jwtPayload.id})
//             .then( foundAdmin => {
//                 if(!foundAdmin){
//                     checkersController.findCheckerForLogin({id: jwtPayload.id })
//                     .then(foundChecker => {
//                         if(!foundChecker){
//                             // logger.warn(`JWT not valid. User with id ${ jwtPayload.id } couldn't be found...`)
//                             logger.warn(`JWT not valid. Token couldn't be found...`)
//                             next(null, false)
//                             return
//                         }
//                         next(null, {
//                             fullName: foundChecker.fullName,
//                             role: foundChecker.role,
//                             id: JSON.stringify(foundChecker._id)    
//                         })
//                         return
//                     })
                    
//                 }
//                 // logger.info('its here tho:', found.fullName)
//                 next(null, {
//                     fullName: foundAdmin.fullName,
//                     role: foundAdmin.role    
//                 }) 
//             }) 
//             return
//         }
//         logger.info(`User ${ foundUser.email } has provided a valid token `)
//         next(null, {
//             fullName: foundUser.fullName,
//             email: foundUser.email,
//             phoneNumber: foundUser.phoneNumber,
//             role: foundUser.role
//         })            
//     })
//     .catch(error => {
//         logger.error(`An error occurred when we tried to find user with id: [${jwtPayload.id}]`, error)
//         next(error, false)
//     })
// })







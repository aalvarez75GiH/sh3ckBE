const logger = require('../../../../utils/logger')
const  checker = require('./checkers.model')


const getCheckers = () => {
    return checker.find({}) 
}
const findChecker = (newChecker) => {
    return new Promise((resolve,reject) => {
        checker.find({email: newChecker.email})
        .then( checkers => {
            resolve( checkers.length > 0)
        })
        .catch(error => {
            reject(error)
        })
    })
}

const findCheckerForLogin = ({
    email,
    id
}) => {
    if (email) return checker.findOne({ email: email })
    if (id) return checker.findOne({ _id: id })
    throw new Error ('Get checker function from controller was called without specifying id or email')
}

const findOneChecker = (id) => {
    logger.info(`at controller: ${id}`)
    return checker.findById(id)
}

const findCheckerByCity = (cityId) => {
    return checker.find({
        cityToCheck: cityId
    })
}

const findCheckerByCategory = (categoryId) => {
    logger.info(categoryId) 
    return checker.find({
        // cityId: cityId,
        category:  
        {$elemMatch:
            {
                categoryToCheck: categoryId 
            }
        }      
    })
}

const findCheckerByServiceTime = (serviceTimeId) => {
    logger.info(serviceTimeId) 
    return checker.find({
        // cityId: cityId,
        service_time:  
        {$elemMatch:
            {
                service_time_id: serviceTimeId 
            }
        }      
    })
}

const findCheckerByCityAndCategory = (cityId, categoryId) => {
    logger.info(cityId)
    logger.info(categoryId) 
    return checker.find({
        // cityId: cityId,
        cityToCheck: cityId,
        category:    {
            $elemMatch: {
                categoryToCheck: categoryId, 
            }
        }
    })
}

const findCheckerByEveryThing = (cityId, categoryId, serviceTimeId) => {
    logger.info(cityId)
    logger.info(categoryId) 
    logger.info(serviceTimeId)
    return checker.find({
        // cityId: cityId,
        cityToCheck: cityId,
        category:    {
            $elemMatch: {
                categoryToCheck: categoryId, 
            }
        },
        service_time:  {
            $elemMatch: {
                service_time_id: serviceTimeId 
            }
        }
    })
}
// .find(
//     {
//         EmployeeDetails: {
//             $elemMatch:{ 
//                 EmployeePerformanceArea : "C++", 
//                 Year : 1998
//             }
//         }
//     }).pretty();
const createChecker = (newChecker, hashedPIN) => {
    return new checker({
        ...newChecker,
        pin: hashedPIN,
        role: 'checker',
        rating: 5,
        ratings: {
           rating_r: 5,
           rating_p: 5,
           rating_k: 5,
           rating_kw: 5,
           rating_t: 5,
           rating_c: 5
        },
        number_of_checks: 0,
        earnings: 0
    }).save()      
}

const editChecker = (updatedChecker, id) => {
    // const editingCategory = updatedChecker.category.map((category) => {
    //     category.push(category)
    // })
    return checker.findOneAndUpdate({_id: id}, {
        ...updatedChecker,
        fullName: updatedChecker.fullName,
        email: updatedChecker.email,
        phoneNumber: updatedChecker.phoneNumber,
        identification: updatedChecker.identification,
        address: updatedChecker.address,
        picture: updatedChecker.picture,
        backgroundCheck: updatedChecker.backgroundCheck,
        cityToCheck: updatedChecker.cityToCheck,
        category: updatedChecker.category, 
        service_time: updatedChecker.service_time,
        earnings:updatedChecker.earnings       
    },{
        new: true //This option is in order to return the new document modified
    })
}

const updatingRatingAndChecksNumberByChecker = (newRatings, id, overallRating) => {
    logger.info(`Overall Raiting at Controller: ${overallRating}`)

    return checker.findOneAndUpdate({ _id: id },{
        ...newRatings,
        rating: overallRating,
        ratings:{
            rating_r: newRatings.rating_r,
            rating_p: newRatings.rating_p,
            rating_k: newRatings.rating_k,
            rating_kw: newRatings.rating_kw,
            rating_t: newRatings.rating_t,
            rating_c: newRatings.rating_c,
        },
        number_of_checks: newRatings.number_of_checks
    })
}

const deleteChecker = (id) => {
    return checker.findByIdAndRemove(id)
}

const savePictureUrl = (id, pictureUrl) => {
    logger.info(`this is pictureUrl at controller: ${pictureUrl}`)
    return checker.findOneAndUpdate({_id: id},{
        picture: pictureUrl
    },{
        new: true //This option is in order to return the new document modified
    })
}

// Review Comments Controllers *****************************




module.exports = {
    getCheckers,
    findOneChecker,
    findChecker,
    createChecker,
    findCheckerByCity,
    findCheckerByCategory,
    findCheckerByServiceTime,
    findCheckerByCityAndCategory,
    findCheckerByEveryThing,
    editChecker,
    deleteChecker,
    savePictureUrl,
    findCheckerForLogin,
    updatingRatingAndChecksNumberByChecker
}

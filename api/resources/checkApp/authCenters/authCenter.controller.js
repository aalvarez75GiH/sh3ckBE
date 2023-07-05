const logger = require('../../../../utils/logger')
const  authCenter = require('./authCenter.model')


const getAuthCenters = () => {
    return authCenter.find({}) 
}

const findAuthCenter = (newAuthCenter) => {
    return new Promise((resolve,reject) => {
        authCenter.find({email: newAuthCenter.email})
        .then( authCenters => {
            resolve( authCenters > 0)
        })
        .catch(error => {
            reject(error)
        })
    })
}

const findAuthCenterForLogin = ({
    email,
    id
}) => {
    if (email) return authCenter.findOne({ email: email })
    if (id) return authCenter.findOne({ _id: id })
    throw new Error ('Get checker function from controller was called without specifying id or email')
}

const findOneAuthCenter = (id) => {
    logger.info(`at controller: ${id}`)
    return authCenter.findById(id)
}

const findAuthCenterByCity = (cityId) => {
    return authCenter.find({
        cityToCheck: cityId
    })
}

const findAuthCenterByCategory = (categoryId) => {
    logger.info(categoryId) 
    return authCenter.find({
        // cityId: cityId,
        category:  
        {$elemMatch:
            {
                categoryToCheck: categoryId 
            }
        }      
    })
}

const findAuthCenterByServiceTime = (serviceTimeId) => {
    logger.info(serviceTimeId) 
    return authCenter.find({
        // cityId: cityId,
        service_time:  
        {$elemMatch:
            {
                service_time_id: serviceTimeId 
            }
        }      
    })
}

const findAuthCenterByCityAndCategory = (cityId, categoryId) => {
    logger.info(cityId)
    logger.info(categoryId) 
    return authCenter.find({
        // cityId: cityId,
        cityToCheck: cityId,
        category:    {
            $elemMatch: {
                categoryToCheck: categoryId, 
            }
        }
    })
}

const findAuthCenterByEveryThing = (cityId, categoryId, serviceTimeId) => {
    logger.info(cityId)
    logger.info(categoryId) 
    logger.info(serviceTimeId)
    return authCenter.find({
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
const createAuthCenter = (newAuthCenter, hashedPIN) => {
    return new authCenter({
        ...newAuthCenter,
        pin: hashedPIN,
        role: 'auth center',
        rating: 5,
        ratings: {
           rating_r: 0,
           rating_p: 0,
           rating_k: 0,
           rating_kw: 0,
           rating_t: 0,
           rating_c: 0
        },
        number_of_checks: 0,
        earnings: 0 
    }).save()      
}

const editAuthCenter = (updatedAuthCenter, id) => {
    return authCenter.findOneAndUpdate({_id: id}, {
        ...updatedAuthCenter,
        businessName: updatedAuthCenter.businessName,
        email: updatedAuthCenter.email,
        businessPhoneNumber: updatedAuthCenter.businessPhoneNumber,
        rifNumber: updatedAuthCenter.rifNumber,
        address: updatedAuthCenter.address,
        representative: updatedAuthCenter.representative,
        picture: updatedAuthCenter.picture,
        backgroundCheck: updatedAuthCenter.backgroundCheck,
        city_name: updatedAuthCenter.city_name,
        cityToCheck: updatedAuthCenter.cityToCheck,
        category: updatedAuthCenter.category,
        service_time: updatedAuthCenter.service_time 
    },{
        new: true //This option is in order to return the new document modified
    })
}

const updatingRatingAndChecksNumberByAuthCenter = (newRatings, id, overallRating) => {
    logger.info(`Overall Raiting at Controller: ${overallRating}`)

    return authCenter.findOneAndUpdate({ _id: id },{
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

const deleteAuthCenter = (id) => {
    return authCenter.findByIdAndRemove(id)
}

const savePictureUrl = (id, pictureUrl) => {
    logger.info(`this is pictureUrl at controller: ${pictureUrl}`)
    return authCenter.findOneAndUpdate({_id: id},{
        picture: pictureUrl
    },{
        new: true //This option is in order to return the new document modified
    })
}

// Review Comments Controllers *****************************




module.exports = {
    getAuthCenters,
    findOneAuthCenter,
    findAuthCenter,
    createAuthCenter,
    findAuthCenterByCity,
    findAuthCenterByCategory,
    findAuthCenterByServiceTime,
    findAuthCenterByCityAndCategory,
    findAuthCenterByEveryThing,
    editAuthCenter,
    deleteAuthCenter,
    savePictureUrl,
    findAuthCenterForLogin,
    updatingRatingAndChecksNumberByAuthCenter
}

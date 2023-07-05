const logger = require('../../../utils/logger')
const user = require('./users.model')


const getUsers = () => {
    return user.find({}) 
}

const findUser = (newUser) => {
    return new Promise((resolve,reject) => {
        user.find({email: newUser.email})
        .then( users => {
            resolve( users.length > 0)
        })
        .catch(error => {
            reject(error)
        })
    })
}

const findOneUser = (id) => {
    return user.findById(id)
}

const findUserByEmail = ({
    email
}) => {
    if (email) return user.findOne({ email: email})
    throw new Error ('Get user function from controller was called without specifying id or email')
}

const findUserForLogin = ({
    email,
    id
}) => {
    if (email) return user.findOne({ email: email })
    if (id) return user.findOne({ _id: id })
    throw new Error ('Get user function from controller was called without specifying id or email')
}

const findUserForPIN = ({
    email
}) => {
    if (email) return user.findOne({ email: email})
    throw new Error ('Get user function from controller was called without specifying id or email')
}



const createUser = (newUser, hashedPIN) => {
    return new user({
        ...newUser,
        picture:"picture",
        pin: hashedPIN,
        role: 'user'
    }).save()      
}

const updateUser = (updatedUser, id) => {
    return user.findOneAndUpdate({_id: id}, {
        ...updatedUser,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        picture: updatedUser.picture
    },{
        new: true //This option is in order to return the new document modified
    })
}

const savePictureUrl = (id, pictureUrl) => {
    logger.info(`this is pictureUrl at controller: ${pictureUrl}`)
    return user.findOneAndUpdate({_id: id},{
        picture: pictureUrl
    },{
        new: true //This option is in order to return the new document modified
    })
}

const updateUserPIN = (id, hashedPIN) => {
    return user.findOneAndUpdate({
        _id: id
    },{
        pin: hashedPIN
    },{
        new: true
    })
}


module.exports = {
    getUsers,
    findUser,
    findUserByEmail,
    findOneUser,
    findUserForLogin,
    createUser,
    findUserForPIN,
    updateUserPIN,
    updateUser,
    savePictureUrl
}

// *************** with Promise
// const findUserForLogin = ({ email, id}) => {
//     return new Promise((resolve, reject) => {
//         if (email){
//             return user.findOne({'email': email})
//             .exec()
//             .then(user => {
//                 resolve(user)
//             })
//             .catch(error => {
//                 reject(error)
//             })
//         }
//         if (id){
//             return user.findOne({'_id': id})
//             .exec()
//             .then(user => {
//                 resolve(user)
//             })
//             .catch(error => {
//                 reject(error)
//             })
//         }
//     })
// }
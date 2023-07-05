const logger = require('../../../../utils/logger')
const adminUser = require('./adminUsers.model')

const getAdminUsers = () => {
    return adminUser.find({}) 
}

const findOneAdminUser = (id) => {
    return adminUser.findById(id)
}

const findAdminUser = (newUser) => {
    return new Promise((resolve,reject) => {
        adminUser.find({email: newUser.email})
        .then( users => {
            resolve( users.length > 0)
        })
        .catch(error => {
            reject(error)
        })
    })
}
const findAdminUserForLogin = ({
    email,
    id
}) => {
    if (email) return adminUser.findOne({ email: email })
    if (id) return adminUser.findOne({ _id: id })
    throw new Error ('Get admin function from controller was called without specifying id or email')
}

const createAdminUser = (newUser, hashedPIN) => {
    return new adminUser({
        ...newUser,
        pin: hashedPIN
    }).save()      
}

const updateAdminUser = (updatedUser, id) => {
    return adminUser.findOneAndUpdate({_id: id}, {
        ...updatedUser,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        role: updatedUser.role
    },{
        new: true //This option is in order to return the new document modified
    })
}

const deleteAdminUser = (id) => {
    return adminUser.findByIdAndRemove(id)
}

module.exports = {
    getAdminUsers,
    findOneAdminUser,
    findAdminUser,
    createAdminUser,
    updateAdminUser,
    findAdminUserForLogin,
    deleteAdminUser
}
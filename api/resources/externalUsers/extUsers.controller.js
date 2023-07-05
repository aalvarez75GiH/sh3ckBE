const logger = require('../../../utils/logger')
const extUser = require('./extUsers.model')


const getExtUsers = () => {
    return extUser.find({})
}

const findUser = (email) => {
    console.log('findUser:', email )
    return new Promise((resolve,reject) => {
        extUser.find({email: email})
        .then( users => {
            resolve( users.length > 0)
        })
        .catch(error => {
            reject(error)
        })
    })
}


const createExtUser = (newExtUser) => {
    return new extUser({
        ...newExtUser,
    }).save()      
}

module.exports = {
    findUser,
    createExtUser,
    getExtUsers
}
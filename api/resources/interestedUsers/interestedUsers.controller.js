const interestedUser = require('./interestedUsers.model')

const getInterestedUsers = () => {
    return interestedUser.find({})
}

const findInterestedUser = (newUser) => {
    return new Promise((resolve, reject) => {
       interestedUser.find({ email: newUser.email})
       .then(interestedUsers => {
            resolve(interestedUsers.length > 0)
       })
       .catch(error => {
           reject(error)
       }) 
    })
}

const findInterestedUserByEmail = ({
    email
}) => {
    if (email) return interestedUser.findOne({ email: email})
    throw new Error ('Get user function from controller was called without specifying id or email')
}

 
const createInterestedUser = (newUser) => {
    return new interestedUser({
        ...newUser
    }).save()
        
}

module.exports = {
    getInterestedUsers,
    findInterestedUser, 
    findInterestedUserByEmail,
    createInterestedUser
}

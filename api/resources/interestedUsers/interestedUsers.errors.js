class UserDataAlreadyInUse extends Error {
    constructor(message){
        super(message)
        this.message = message || 'Email or username already associated to an account'
        this.status = 409
        this.name = 'UserDataAlreadyInUse'
    }
}

module.exports = {
    UserDataAlreadyInUse
}
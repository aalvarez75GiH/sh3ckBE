class ErrorHashingData extends Error {
    constructor(message){
        super(message)
        this.message = message || `An error occurred when we tried to hash password...`
        this.status = 500
        this.name = 'ErrorHashingData'
    }
}

class IncorrectCredentials extends Error {
    constructor(message){
        super(message)
        this.message = message || 'Incorrect credentials'
        this.status = 400
        this.name = 'IncorrectCredentials'
    }
}


module.exports = {
    ErrorHashingData,
    IncorrectCredentials
}

class paymentNotFoundFound extends Error {
    constructor(message){
        super(message)
        this.message = message || 'Payment Not Found'
        this.status = 404
        this.name = 'PaymentNotFound'
    }
}


module.exports = {
    paymentNotFoundFound
}
const review = require('./reviews.model')

const getReviews = () => {
    return review.find({})
}
const getReviewByChecker = (checker_id) => {
    return review.find({checker_id: checker_id})
} 

const createReview = (newReview) => {
    return new review({
        ...newReview
    }).save()
}

module.exports = {
    getReviews,
    getReviewByChecker,
    createReview
}
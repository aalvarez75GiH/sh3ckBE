const AWS = require('aws-sdk')
const config =require('../config')

console.log(config.s3)
const awsCredentials = config.s3
const categoryPath = config.categoryPath
const checkersPath = config.checkersPath
const usersPath = config.usersPath
const paymentPath = config.paymentsPath
const authCentersPath = config.authCentersPath
const bucketName = config.s3BucketName
const bucketPath = config.bucketPath
const s3Client = new AWS.S3(awsCredentials)

const saveCategoryImage = (image, fileName) => {
    s3Client.putObject({
        Body: image,
        Bucket: bucketName,
        Key: `${bucketPath}/${categoryPath}/${fileName}`

    }).promise()
    
    return `https://s3.amazonaws.com/${bucketName}/${bucketPath}/${categoryPath}/${fileName}`
}

const saveCheckerPicture = (picture, fileName) => {
    s3Client.putObject({
        Body: picture,
        Bucket: bucketName,
        Key: `${bucketPath}/${checkersPath}/${fileName}`

    }).promise()
    
    return `https://s3.amazonaws.com/${bucketName}/${bucketPath}/${checkersPath}/${fileName}`
}
const saveUserPicture = (picture, fileName) => {
    s3Client.putObject({
        Body: picture,
        Bucket: bucketName,
        Key: `${bucketPath}/${usersPath}/${fileName}`

    }).promise()
    
    return `https://s3.amazonaws.com/${bucketName}/${bucketPath}/${usersPath}/${fileName}`
}
const saveAuthCenterPicture = (picture, fileName) => {
    s3Client.putObject({
        Body: picture,
        Bucket: bucketName,
        Key: `${bucketPath}/${authCentersPath}/${fileName}`

    }).promise()
    
    return `https://s3.amazonaws.com/${bucketName}/${bucketPath}/${authCentersPath}/${fileName}`
}

const savePaymentPicture = (picture, fileName) => {
    s3Client.putObject({
        Body: picture,
        Bucket: bucketName,
        Key: `${bucketPath}/${paymentPath}/${fileName}`

    }).promise()
    
    return `https://s3.amazonaws.com/${bucketName}/${bucketPath}/${paymentPath}/${fileName}`
}


module.exports = {
    saveCategoryImage,
    saveCheckerPicture,
    saveUserPicture,
    saveAuthCenterPicture,
    savePaymentPicture
}
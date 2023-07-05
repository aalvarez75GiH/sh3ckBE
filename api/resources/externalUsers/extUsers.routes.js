const express = require('express')
const CLIENT_URL = "http://localhost:3000/"
const { OAuth2Client } = require('google-auth-library')
const extUsersRouter = express.Router()
const extUserController = require('./extUsers.controller')
const logger = require('../../../utils/logger')

// REACT_APP_GOOGLE_CLIENT_ID = '257358209041-oje195aop7ppkokdlmdf33676hdl2dbk.apps.googleusercontent.com'
REACT_APP_GOOGLE_CLIENT_ID = '915460618193-dcl1a1f3en6f3h22evu9jqk2aqdh1lcj.apps.googleusercontent.com'
const client = new OAuth2Client(REACT_APP_GOOGLE_CLIENT_ID)

extUsersRouter.get('/', (req,res) => {
  return extUserController.getExtUsers()
    .then(extUsers => {
        res.json(extUsers)
    })
})

extUsersRouter.post('/google', async(req,res) => {
  let foundUser

  const { token } = req.body
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: REACT_APP_GOOGLE_CLIENT_ID,
  })

  const newExtUser = {
    fullName: ticket.getPayload().name,
    email: ticket.getPayload().email,
    goID: ticket.getPayload().sub,
    typeUser:'Google',
    picture: ticket.getPayload().picture,
    phoneNumber:'', 
    role: 'google_user'
  }

  foundUser = await extUserController.findUser(newExtUser.email)
    if (foundUser){
      logger.info(`User with email ${newExtUser.email} already registered...`)
      // res.status(409).send(`${newExtUser.fullName}`)
      res.status(409).send(newExtUser)
      return
    }

    console.log(ticket.getPayload().name)
    await extUserController.createExtUser(newExtUser)
    logger.info(`User with email [${newExtUser.email}] has been created...`)
    res.status(201).json(newExtUser)
})  


  
module.exports = extUsersRouter
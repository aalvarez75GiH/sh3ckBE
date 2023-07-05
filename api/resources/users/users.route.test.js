const request = require('supertest')
const user = require('./users.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const app = require('../../../index').app
const server = require('../../../index').server
const config = require('../../../config')

const usersDummy = [
    {
        fullName: 'Arnoldo Alvarez',
        password: '123456',
        email: 'arnoldo@yahoo.com',
        phoneNumber: '17066124602'
    },
    {
        fullName: 'Kris Summers',
        password: '123456',
        email: 'kris@yahoo.com',
        phoneNumber: '17066124603'
    },
    {
        fullName: 'Ana Pizzingrilli',
        password: '123456',
        email: 'ana@yahoo.com',
        phoneNumber: '17066124604'
    },
    {
        fullName: 'Race Els',
        password: '123456',
        email: 'race@yahoo.com',
        phoneNumber: '17066124605'
    },
    {
        fullName: 'Lorelei Els',
        password: '123456',
        email: 'lorelei@yahoo.com',
        phoneNumber: '17066124606'
    },
]

const  userDoNotExistAndAttributesAreCorrect = (newUser, done) => {
    user.find().or([{email: newUser.email},{phoneNumber: newUser.phoneNumber}])
    .then(user => {
        console.log(user)
        expect(user).toBeInstanceOf(Array)
        expect(user).toHaveLength(1)
        expect(user[0].email).toEqual(newUser.email.toLowerCase())
        expect(user[0].phoneNumber).toEqual(newUser.phoneNumber)
        done()
    })
    .catch( error => {
        done(error)
    })

}

const verifyingUserAtDB = (newUser, done) => {
    user.find().or([{ email: newUser.email},{phoneNumber: newUser.phoneNumber}])
    .then(foundUser => {
        expect(foundUser).toHaveLength(0)
        done()
    })
    .catch(error => {
        done(error)
    })
}


describe('Users', () => {

    beforeEach((done) => {
        user.remove({}, error => {
            done()
        })
    })

    afterAll(async()=> {
        server.close()
        await mongoose.disconnect()
    })

    describe('GET /api/users', () => {
    
        test('If not users then an empty array is returned with a 200 status code', (done) => {
            request(app)
            .get('/api/users')
            .end( (error, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toBeInstanceOf(Array)
                expect(res.body).toHaveLength(0)
                done()
            })
        })
        test('If users then a users accounts array is returned with a 200 status code', (done) => {
            Promise.all(usersDummy.map( userData => new user(userData).save()))
            .then( response => {
                request(app)
                .get('/api/users')
                .end( (error, res) => {
                    expect(res.status).toBe(200)
                    expect(res.body).toBeInstanceOf(Array)
                    expect(res.body).toHaveLength(5)
                    done()
                })
            })
        })
    })

    describe('POST /api/users', () => {
        test('if user passes all validations and it is not found at DB then its created', (done) => {
            request(app)
            .post('/api/users')
            .send(usersDummy[0])
            .end((error,res) => {
                expect(res.status).toBe(201)
                userDoNotExistAndAttributesAreCorrect(usersDummy[0], done)
                done()
            })
        })

        test('if user`s email already exists at DB then registration process must fail returning status code 409', (done) => {
            Promise.all(usersDummy.map((userToRegister) => new user(userToRegister).save()))
            .then((response)=> {
                request(app)
                .post('/api/users')
                .send({
                    fullName: 'Arnoldito Alvarez',
                    password: '123456',
                    email: 'arnoldo@yahoo.com',
                    phoneNumber: '04145275718'
                })
                .end((error,res) => {
                    expect(res.status).toBe(409)
                    done()
                })
            })
            
        })
        test('An user without fullName should not be created', (done) => {
            let user = {
                password: '123456',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('An user without Email should not be created', (done) => {
            let user = {
                fullName:'Arnoldo Alvarez',
                password: '123456',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('An user without Password should not be created', (done) => {
            let user = {
                fullName:'Arnoldo Alvarez',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('An user without Phone Number should not be created', (done) => {
            let user = {
                fullName:'Arnoldo Alvarez',
                password: '123456',
                email:'arnoldo@yahoo.com'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })

        test('An user with an invalid Email should not be created', (done) => {
            const user = {
                fullName: 'Arnoldo Alvarez',
                password: '123456',
                email: 'arnoldo_yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('if Full Name min characters is less than 3 chars then registration process must fail with error status code of 400', (done) => {
            const user = {
                fullName: 'Ar',
                password: '123456',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('if Full Name max characters is more than 30 chars then registration process must fail with error status code of 400', (done) => {
            const user = {
                fullName: 'Arnoldo de la Trinidad De la Rosa Alvarez Soto',
                password: '123456',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        
        test('if Password min characters is less than 6 chars then registration process must fail with error status code of 400', (done) => {
            const user = {
                fullName: 'Arnoldo Alvarez',
                password: '12345',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })

        test('if Password max characters is more than 30 chars then registration process must fail with error status code of 400', (done) => {
            const user = {
                fullName: 'Arnoldo Alvarez',
                password: '1234567890123456789012345678902012017890201201',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('if Phone Number max characters is more than 11 chars then registration process must fail with error status code of 400', (done) => {
            const user = {
                fullName: 'Arnoldo Alvarez',
                password: '1234567890',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '170661246022'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })
        test('if Phone Number pattern receives characters different than numbers then registration process must fail with error status code of 400', (done) => {
            const user = {
                fullName: 'Arnoldo Alvarez',
                password: '1234567890',
                email: 'arnoldo@yahoo.com',
                phoneNumber: '0414-527.57.18'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    verifyingUserAtDB(user, done)
                    done()
                })   
        })

        test('FullName or email must be valid and stored as lowercase', (done) => {
            const user = {
                fullName: 'Arnoldo Alvarez',
                password: '123456',
                email: 'arnOldo@Yahoo.com',
                phoneNumber: '17066124602'
            }
            request(app)
                .post('/api/users')
                .send(user)
                .end((error, res) => {
                    expect(res.status).toBe(201)
                    expect(typeof res.text).toBe('string')
                    userDoNotExistAndAttributesAreCorrect({
                        fullName: user.fullName.toLowerCase(),
                        password: user.password,
                        email: user.email.toLowerCase(),
                        phoneNumber: user.phoneNumber
                    }, done)                
                })   
        })
    })

    describe('POST /api/users/login', () => {
        
        test('Login Process must fail if user is not found at DB', (done) => {
            const notAuthUser = {
                email: 'miguel@yahoo.com',
                password: '123456'
            }
            new user({
                fullName: 'Arnoldo Alvarez',
                email: 'arnoldo@yahoo.com',
                password: bcrypt.hashSync('123456', 10),
                phoneNumber: '17066124602'
            }).save()
            .then((response)=> {
                request(app)
                .post('/api/users/login')
                .send({
                    email: notAuthUser.email,
                    password: notAuthUser.password
                })
                .end((error, res) => {
                    expect(res.status).toBe(400)
                    expect(typeof res.text).toBe('string')
                    expect(res.text).toEqual(notAuthUser.email)
                    done()
                })    
            })
        })

        
        test('Login and authentication process must fail if request does not contain an email returning a error status code 400', (done) => {
            request(app)
            .post('/api/users/login')
            .send({
                password: '123456'
            })
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                done()
            })
        })

        test('Login and authentication process must fail if request does not contain a password returning a error status code 400', (done) => {
            request(app)
            .post('/api/users/login')
            .send({
                email: 'arnoldo@yahoo.com'
            })
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                done()
            })
        })
        
        
        
        test('if user`s credentials are valid and user is registered at DB then user is authenticated and get a token', (done) => {
            const notAuthUser = {
                fullName: 'Arnoldo Alvarez',
                email: 'arnoldo@yahoo.com',
                password: '123456',
                phoneNumber: '17066124602'

            }
            new user({
                fullName: notAuthUser.fullName,
                email: notAuthUser.email,
                password: bcrypt.hashSync(notAuthUser.password, 10),
                phoneNumber: notAuthUser.phoneNumber
            }).save()
            .then(newUser => {
                request(app)
                    .post('/api/users/login')
                    .send({
                        email: notAuthUser.email,
                        password: notAuthUser.password
                    })
                    .end((error, res) => {
                        expect(res.status).toBe(200)
                        expect(res.body.token).toEqual(
                        jwt.sign({id: newUser._id},
                        config.jwt.secret, {
                            expiresIn: 60 * 60 * 24 * 365
                        }))
                        done()
                    })
            })
            .catch(error => {
                done(error)
            })

        })

        test('if user`s password is invalid authentication process must fails returning a error status code 400', (done) => {
            const notAuthUser = {
                fullName: "Arnoldo Alvarez",
                email: "arnoldo@yahoo.com",
                password: "123456",
                phoneNumber: "17066124602"
            }
            new user({
                fullName: notAuthUser.fullName,
                email: notAuthUser.email,
                password: bcrypt.hashSync(notAuthUser.password, 10),
                phoneNumber: notAuthUser.phoneNumber
            }).save()
            .then(newUser => {
                request(app)
                    .post('/api/users/login')
                    .send({
                        email: notAuthUser.email,
                        password: '123457'
                    })
                    .end((error, res) => {
                        expect(res.status).toBe(400)
                        expect(typeof res.text).toBe('string')
                        expect(res.text).toEqual(newUser.fullName)
                        done()
                    })
            })
            .catch(error => {
                done(error)
            })
        })
        test('if user`s email is invalid authentication process must fails returning a error status code 400', (done) => {
            const notAuthUser = {
                fullName: "Arnoldo Alvarez",
                email: "arnoldo@yahoo.com",
                password: "123456",
                phoneNumber: "17066124602"
            }
            new user({
                fullName: notAuthUser.fullName,
                email: notAuthUser.email,
                password: bcrypt.hashSync(notAuthUser.password, 10),
                phoneNumber: notAuthUser.phoneNumber
            }).save()
            .then(newUser => {
                request(app)
                    .post('/api/users/login')
                    .send({
                        email: 'arnol@yahoo.com',
                        password: notAuthUser.password
                    })
                    .end((error, res) => {
                        // console.log('this is res.body:', res)
                        expect(res.status).toBe(400)
                        expect(typeof res.text).toBe('string')
                        expect(res.text).toEqual('arnol@yahoo.com')
                        done()
                    })
            })
            .catch(error => {
                done(error)
            })
        })

    })
})
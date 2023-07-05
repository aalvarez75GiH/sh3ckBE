const request = require('supertest')
const interestedUser = require('./interestedUsers.model')
const mongoose = require('mongoose')

const app = require('../../../index').app
const server = require('../../../index').server

const interestedUserDummy = [
    {
        fullName: 'Arnoldo Alvarez',
        email: 'arnoldo@yahoo.com',
        city: 'Barquisimeto'
    },
    {
        fullName: 'Kris Summers',
        email: 'kris@yahoo.com',
        city: 'Athens'
    },
    {
        fullName: 'Race Els',
        email: 'race@yahoo.com',
        city: 'Athens'
    },
    {
        fullName: 'Lorelei Els',
        email: 'lorelei@yahoo.com',
        city: 'Athens'
    },
    {
        fullName: 'Ana Pizzingrilli',
        email: 'ana@yahoo.com',
        city: 'Barquisimeto'
    },
]

 const  interestedUserExsistAndAttributesAreCorrect = (newUser, done) => {
    interestedUser.find({email: newUser.email})
    .then(user => {
        expect(user).toBeInstanceOf(Array)
        expect(user).toHaveLength(1)
        expect(user[0].fullName).toEqual(newUser.fullName.toLowerCase())
        expect(user[0].email).toEqual(newUser.email.toLowerCase())
        expect(user[0].city).toEqual(newUser.city)
        done()
    })
    .catch( error => {
        done(error)
    })

}

const verifyAtDB = async(userToVerify, done) => {
    try {
        const foundUser = await interestedUser.find().or([{ email: userToVerify.email},{fullName: userToVerify.fullName}])
        expect(foundUser).toHaveLength(0)
        done()
    } catch (error) {
        done(error)
    }
}

describe('InterestedUsers', () => {

    beforeEach((done) => {
        interestedUser.remove({}, error => {
            done()
        })
    })

    afterAll(async() => {
        server.close()
        await mongoose.disconnect()
    })

    describe('GET /api/interestedUsers', ()=> {
       
        test('If interestedUsers do not exists an empty array is returned', (done) => {
            request(app)
            .get('/api/interestedUsers')
            .end((error, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toBeInstanceOf(Array)
                expect(res.body).toHaveLength(0)
                done()
            })
        })
        
        test('If interestedUsers exists at DB an array with the full collection is returned', (done) => {
            Promise.all(interestedUserDummy.map( intUser => new interestedUser(intUser).save()))
            .then((response)=> {
                console.log(response)
                request(app)
                .get('/api/interestedUsers')
                .end((error, res) => {
                    expect(res.status).toBe(200)
                    expect(res.body).toBeInstanceOf(Array)
                    expect(res.body).toHaveLength(5)
                    done()
                })
            })
        })

    })

    describe('POST /api/interestedUsers' , () => {
        test('If interestedUser passes all validations and does not exists at DB then its created', (done) => {
        request(app)
        .post('/api/interestedUsers')
        .send(interestedUserDummy[0])
        .end((error, res) => {
            expect(res.status).toBe(201)
            interestedUserExsistAndAttributesAreCorrect(interestedUserDummy[0], done)
            done()
        })       
        })

        test('If interestedUser`s email already exists at DB then registration process must fail returning a 409 error status', (done) => {
            Promise.all(interestedUserDummy.map(intUser => new interestedUser(intUser).save()))
            .then(response => {
                request(app)
                .post('/api/interestedUsers')
                .send({
                    fullName: 'Kristina Summers',
                    email: 'kris@yahoo.com',
                    city: 'Barquisimeto'
                })
                .end((error,res)=>{
                    expect(res.status).toBe(409)
                    done()
                })
            })            
        })

        test('interestedUser`s fullName is required. Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                email: 'arnoldo@yahoo.com',
                city: 'Athens'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })

        test('interestedUser`s email is required. Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                fullName: 'Arnoldo Alvarez',
                city: 'Athens'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })

        test('interestedUser`s city is required. Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                fullName: 'Arnoldo Alvarez',
                email: 'arnoldo@yahoo.com'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })

        test('interestedUser`s fullName min characters has to be 3. Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                fullName:'Ar',
                email: 'arnoldo@yahoo.com',
                city: 'Athens'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })
        test('interestedUser`s fullName max characters has to be 30. Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                fullName:'Arnoldoaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                email: 'arnoldo@yahoo.com',
                city: 'Athens'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })

        test('interestedUser`s city min characters has to be 3 . Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                fullName: 'Arnoldo Alvarez',
                email: 'arnoldo@yahoo.com',
                city: 'Ba'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })

        test('interestedUser`s city max characters has to be 30 . Otherwise registration process must fail returning a 400 error status', (done) => {
            const userToVerify = {
                fullName: 'Arnoldo Alvarez',
                email: 'arnoldo@yahoo.com',
                city: 'Barquisimeto de la santisima trinidad de la Republica de Venezuela Barquisimeto de la santisima trinidad de la Republica de Venezuela Barquisimeto de la santisima trinidad de la Republica de Venezuela'
            }
            request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(400)
                expect(typeof res.text).toBe('string')
                verifyAtDB(userToVerify, done)
            })
        })

        test('username or email must be valid and stored as lowercase', (done) => {
        const userToVerify = {
            fullName: 'Aalvarez',
            email: 'arnOldo@Yahoo.com',
            city: 'Barquisimeto'
        }
        request(app)
            .post('/api/interestedUsers')
            .send(userToVerify)
            .end((error, res) => {
                expect(res.status).toBe(201)
                expect(typeof res.text).toBe('string')
                interestedUserExsistAndAttributesAreCorrect({
                    fullName: userToVerify.fullName.toLowerCase(),
                    email: userToVerify.email.toLowerCase(),
                    city: userToVerify.city
                }, done)                
            })   
    })    
    })
})



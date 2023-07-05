const FacebookStrategy = require('passport-facebook').Strategy
const passport = require('passport')

const FACEBOOK_APP_ID = "314852847213593"
const FACEBOOK_APP_SECRET = "c4aa2da57550e312d8ede800dc0e73b1"

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})


passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/extUsersAuth/facebook/callback",
    profileFields: ['id','displayName', 'email']
},
    function(accessToken, refreshToken, profile, done) {
    done(null, profile)
  }
))
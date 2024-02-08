import passport from "passport"
import local from 'passport-local'
import UserModel from "../DAO/dbmanagers/models/user.model.js"
import { createHash, passwordValidation } from "../utils/utils.js"
import GitHubStrategy from 'passport-github2'
import { logger } from "../utils/logger.js"

const localStrategy = local.Strategy

const initializePassport = () => {

    passport.use('register', new localStrategy({
       passReqToCallback : true, //acceso al req
       usernameField : 'email'
    }, async (req,username,password,done) => {
         const { first_name, last_name, age,  email } = req.body


         if(!first_name || !last_name || !age || !email || !password ){
            logger.warning('Error creating User. Some fields are required')
            return res.status(404).send('Error creating User. Some fields are required')
         }

         try{
           const user = await UserModel.findOne({email : username})
           if(user){
            logger.debug('user alredy exists')
            return done(null,false)
           }

           const newUser = {
            first_name,
            last_name,
            age,
            email,
            password: createHash(password)
           }

           const result = await UserModel.create(newUser)
           return done(null,result)
         }catch(e){
           logger.fatal('error register',e)
           return done('error register '+e)
         }
    }))


    passport.use('login', new localStrategy({
        usernameField: 'email'
    }, async (username,password,done) => {
        try{

            //if superadmin
            logger.debug(process.env.ADMIN_EMAIL)
            if(username == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD){
                logger.warning('superadmin logged')
                const newUser = await UserModel.create({
                    first_name : 'SuperAdmin',
                    last_name: '',
                    email: process.env.ADMIN_EMAIL,
                    age: 1,
                    password: ''
                })
                return done(null,newUser)
            }

            const user = await  UserModel.findOne({email: username}).lean().exec()
            if(!user){
                logger.debug('user not found')
                return done(null,false)
            }
            if(!passwordValidation(user,password)){
                logger.debug('invalid password')
                return done(null,false)
            }
            return done(null,user)
        }catch(e){
            return done('error login '+e)
        }
    }))

    passport.use('github', new GitHubStrategy( {
        clientID: 'Iv1.398ae6e8a2ad2ddc',
        clientSecret: 'a00c8801d2512d8b3e33b1e46497844b918c24d2',
        callbackURL: 'http://127.0.0.1:8080/api/session/githubcallback'
    }, async (accessToken,refreshToken,profile,done) => {
        logger.debug(profile)
        try{
            const user = await UserModel.findOne({ email : profile._json.email})
            if(user){
                logger.debug('USER was already registered')
                return done(null,user)
            }

            const newUser = await UserModel.create({
                first_name : profile._json.name,
                last_name: '',
                email: profile._json.email,
                age: 1,
                password: ''
            })

            return done(null,newUser)

        }catch(e){
            logger.error('error login with github',e)
            return done('error to login with github '+e)
        }
    }))


    passport.serializeUser((user,done) => {
      done(null,user._id)
    })

    passport.deserializeUser(async (id,done) => {
        const user = await UserModel.findById(id)
        done(null,user)
    })
}


export default initializePassport
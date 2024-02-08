import { Router } from 'express'
import UserModel from "../DAO/dbmanagers/models/user.model.js"
import { createHash, passwordValidation } from '../utils/utils.js'
import passport from 'passport'
import initializePassport from '../config/passport.config.js'
import { logger } from '../utils/logger.js'


const router = Router()

router.get('/error', (req,res) => {
    res.send('ERROR')
})


router.post('/login', passport.authenticate('login', {failureRedirect: '/login'} ), async(req,res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    if(!req.user) return res.status(404).send('Invalid credentials')

    logger.info('user logged in!')

    req.session.user = req.user
    return res.redirect('/products')

})

router.get('/github', passport.authenticate('github', {scope : ['user:email']}), async (req,res) => {

})

router.get('/githubcallback', passport.authenticate('github', {failureRedirect : '/error'} ), async (req,res) => {
    req.session.user = req.user
    logger.debug('user session for github setted')

    return res.redirect('/products')

})


router.post('/register', passport.authenticate('register', {failureRedirect: '/register'} ),  async (req, res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    logger.info('user registered!')
    return res.redirect('/products')
})


router.get('/logout', (req,res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)
    logger.info(req.url)

    req.session.destroy(err => {
        if(err) res.status(404).send('logout error')
        return res.redirect('/login')
    })
})

export default router

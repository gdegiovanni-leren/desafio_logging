import { Router } from 'express'
import {  auth, sessionActive } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'


const router = Router()

export default router

//Renders ---------------------------
router.get('/login', sessionActive,  (req,res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    return res.render('login', {
        style: 'index.css'
    } )
})

router.get('/register', sessionActive,  (req,res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    return res.render('register', {
        style: 'index.css'
    } )
})


//render listado de productos con websockets + alta y baja de producto
router.get('/realtimeproducts', auth, async (req,res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    res.render('realTimeProducts', {
        style: 'index.css',
        title : 'LISTADO DE PRODUCTOS WEBSOCKET'
    })

})

//render
router.get('/chat', auth , (req,res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    res.render('chat',{
    style: 'index.css',
    title : 'CHAT'
    })
})

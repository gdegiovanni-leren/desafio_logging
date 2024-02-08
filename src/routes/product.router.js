import { Router } from 'express'
import productController from '../controllers/productController.js'
import {  auth } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
const router = Router()

export default router


//solo listado de productos
router.get('/', auth, async (req, res) => {

    logger.http(`Request http ${req.url} call from ${req.hostname} | ${req.ip} | `)

    const user = req.session.user

    const PC = new productController()
    const products = await PC.getProducts()

    return res.render('index', {
        products,
        user,
        style: 'index.css',
        title : 'LISTADO DE PRODUCTOS ESTATICO'
    })
})

import { Router } from 'express'
import cartController from '../controllers/cartController.js'
import productController from '../controllers/productController.js'
import {  auth } from '../middleware/auth.js'

const router = Router()

export default router


router.get('/', auth , async (req, res) => {

    const PC = new productController()
    const CC = new cartController()

    let cart_id = await CC.createCart()
    const products = await PC.getProducts()

    res.render('cart', {
        products,
        cart_id,
        style: 'index.css',
        title : 'CARRITO DE COMPRAS'
    })
})
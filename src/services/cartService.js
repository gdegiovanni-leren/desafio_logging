
import mongoose from 'mongoose'
import cartModel from '../DAO/dbmanagers/models/carts.model.js'
import productModel from '../DAO/dbmanagers/models/products.model.js'
import { logger } from '../utils/logger.js'

class cartService {

    constructor(){}


    createCart = async () => {
           try{
            const r = new cartModel()
            r.save()
            logger.info(r)
            return r._id
           }catch(e){
            logger.fatal(e)
           }

       return null
    }


    addProductToCart = async (data) => {

        try{

            const p = await productModel.findById(data.product_id).exec()

            if(!p) return { status: false ,  message : `Producto no encontrado con Id ${data.product_id}`}

            if(p.stock < data.quantity) return { status: false ,  message : `Stock insuficiente.`}

            let cart = await cartModel.findById(data.cart_id).exec()

            if(!cart) return { status: false ,  message : `Error al agregar producto al carrito. Carrito no encontrado`}

            cart.products.push({ product: data.product_id })

            const result = await cartModel.updateOne({_id: data.cart_id }, cart )

            //TODO: descontar stock

            return { status: true ,  message : `Producto agregado con exito !`}

        }catch(e){
            logger.fatal(e)
            return { status: false ,  message : `No se ha podido agregar el producto al carrito.`}
        }

    }

    codeExists = async (code) => {
         //return await productModel.exists({code: code})
         const exists = await productModel.exists({code: code})
         return exists ? true : false

    }

    getNextID = (products) => {
        const count = products.length
        if(count == 0) return 1
        const lastProduct = products[count-1]
        return lastProduct.id + 1
    }


    getProductById = async (id) => {

        const product = await productModel.findById(id).exec()

        logger.debug('product found on delete?')
        logger.debug(product)

        return product ?
        { status: true ,  product : product , message : '' } :
        { status: false , product : null,  message : `Producto no encontrado con Id ${id}`}
    }



    getProducts = async () => {

        try{
            const products = await productModel.find().lean().exec()
            return products
        }catch(e){
            logger.error(e)
        }
    }


    validateFields = async (data) => {

        if(!data) return {status : false, message : 'No se encontraron datos de producto' }

        const { title , description , code, price , status, stock, category , thumbnails } = data

        if(!title) return {status : false, message : 'El producto debe tener un titulo' }
        if(!description) return {status : false, message : 'El producto debe tener una descripción' }
        if(!code) return {status : false, message : 'El producto debe tener un codigo' }
        if(!price) return {status : false, message : 'El producto debe tener un precio' }
        if(status != true && status != false) return {status : false, message : 'El producto debe tener un status y debe ser true o false' }
        if(!stock) return {status : false, message : 'El producto debe tener stock' }
        if(!category) return {status : false, message : 'El producto debe tener una categoría' }
        if(stock < 0 || isNaN(parseInt(stock))) return {status : false, message : 'El stock ingresado es incorrecto' }
        if(isNaN(parseFloat(price))) return {status : false, message : 'El valor del precio es incorrecto' }
        if(!Array.isArray(thumbnails)) return {status : false, message : 'Thumbnails debe ser en formato array' }

        return {status : true, message : 'Validación exitosa' }
    }


    addProduct =  async (data) => {

          try{
            let productsData = await this.validateFields(data)

            if(productsData.status != true) return {status: false, message : productsData.message }

            if(await this.codeExists(data.code)) return {status: false, message : `No se pudo agregar el producto. El codigo ingresado ya existe` }

            const p = {
                title : data.title.trim(),
                description : data.description.trim(),
                code: data.code,
                price : parseFloat(data.price),
                status: true, //por ahora queda en true por defecto
                stock: parseInt(data.stock),
                category : data.category.trim(),
                thumbnails : data.thumbnails
            }

            const result = await productModel.create(p)

            if(result){
                return {status : true , message : 'Producto agregado con exito!'}
            }else{
                return {status : false , message : 'No se ha podido crear el producto'}
            }

        }catch(e){
        logger.fatal(e)
        return {status : false , message : 'Hubo un error en la creación de producto'}
        }

    }




}


export default cartService
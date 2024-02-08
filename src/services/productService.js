
import productModel from '../DAO/dbmanagers/models/products.model.js'
import { logger } from '../utils/logger.js'

class productService {

    constructor(){}

    codeExists = async (code) => {
         const exists = await productModel.exists({code: code})
         return exists ? true : false
    }


    getProductById = async (id) => {
        return await productModel.findById(id).exec()
    }


    getProducts = async () => {

       return await productModel.find().lean().exec()

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



    deleteProduct = async(id) => {

    try{
        let exists = await this.getProductById(id)

        if(exists.status == false){
            return {status : false , message : 'No se encontraró producto para eliminar'}
        }else{
                const result = await productModel.deleteOne({ _id: id })

                if(result){
                    return {status : true , message : 'Producto eliminado con exito!'}
                }else{
                    return {status : false , message : 'No se encontró producto para eliminar'}
                }
        }
    }catch(e){
        logger.fatal(e)
        return {status : false , message : 'No se ha podido eliminar el producto'}
       }
   }


}


export default productService
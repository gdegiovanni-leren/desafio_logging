import fs from 'fs'
import { logger } from '../utils/logger.js'

class ProductController {

    constructor(){
        this.filepath = './src/filesdatabase/products.json'
        this.format = 'utf-8'
        //si no existe archivo, lo creo vacio
        if(!fs.existsSync(this.filepath)){
            fs.writeFileSync(this.filepath, '')
        }
    }

    codeExists = (products,code) => { return products.some((product) => product.code == code) }

    getNextID = (products) => {
        const count = products.length
        if(count == 0) return 1
        const lastProduct = products[count-1]
        return lastProduct.id + 1
    }


    getProductById = async (id) => {

        if(!fs.existsSync(this.filepath)){
           return {status : false, message : 'Archivo no encontrado'}
        }

        let products = await this.getProducts()

        const product = products.find((product) => product.id == id)

        return product ?
        { status: true ,  product : product , message : '' } :
        { status: false , product : null,  message : `Producto no encontrado con Id ${id}`}
    }




    getProducts = async (limit) => {

        if(!fs.existsSync(this.filepath)){
            logger.fatal('ARCHIVO NO ENCONTRADO')
            return []
        }
        let products = fs.readFileSync(this.filepath, this.format)

        if(products.length <= 0 ) return []

        products = JSON.parse(products)
        const productFilter = limit && limit > 0 ? products.slice(0,limit) : products

        return productFilter
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

        if(!fs.existsSync(this.filepath)){
            return {status : false , message : 'ARCHIVO NO ENCONTRADO'}
        }

          try{
            let productsData = await this.validateFields(data)

            if(productsData.status != true) return {status: false, message : productsData.message }

            let products = await this.getProducts()

            if(this.codeExists(products,data.code)) return {status: false, message : `No se pudo agregar el producto. El codigo ingresado ya existe` }

            const id = await this.getNextID(products)

            const p = {
                id ,
                title : data.title.trim(),
                description : data.description.trim(),
                code: data.code,
                price : parseFloat(data.price),
                status: true,
                stock: parseInt(data.stock),
                category : data.category.trim(),
                thumbnails : data.thumbnails
            }

            products.push(p)

            fs.writeFileSync(this.filepath, JSON.stringify(products))

            return {status : true , message : 'Producto agregado con exito!'}

        }catch(e){
        logger.error(e)
        return {status : false , message : 'Hubo un error en la creación de producto'}
        }

    }


 /*
    updateProduct = async (id,data) => {

        if(!fs.existsSync(this.filepath)){
            return {status : false , message : 'ARCHIVO NO ENCONTRADO'}
        }

        try{

        let products = await this.getProducts()

         if(!products){
             return {status : false , message : 'No se encontraron productos para actualizar'}
         }else{
            //verifico qué, si el campo es code, no permita actualizar el producto si se encuentra el codigo repetido
            if(!data.code || await this.codeExists(products,data.code)) return {status : false , message : 'No se pudo actualizar el producto. El codigo no fue ingresado correctamente o el codgo ya existe' }

            //verifco que exista producto por id y obtengo su index
            const index = products.findIndex((product) => product.id == id)

            if(index == undefined || index < 0){
                return { status : false , message : `No se encontró producto para actualizar con Id ${id} `}
            }else{

            products[index].title = data.title ? data.title.trim() : products[index].title
            products[index].description = data.description ? data.description.trim() : products[index].description
            products[index].code = data.code
            products[index].price = data.price && !isNaN(parseFloat(data.price)) ? parseFloat(data.price) : products[index].price
            products[index].status = data.status ? data.status : products[index].status
            products[index].stock = data.stock && !isNaN(parseInt(data.stock)) ? parseInt(data.stock) : products[index].stock
            products[index].category = data.category ? data.category.trim() : products[index].category
            products[index].thumbnails = Array.isArray(data.thumbnails) ? data.thumbnails : products[index].thumbnails


            fs.writeFileSync(this.filepath, JSON.stringify(products))

            return { status : true , message : `El producto ${id} fue actualizado con exito!` }
            }
         }

        }catch(e){
            logger.error(e)
            return {status : false , message : 'Hubo un error en la actualización de producto'}
        }
    }
 */

    deleteProduct = async(id) => {

        let products = await this.getProducts()

        if(!products){
            return {status : false , message : 'No se encontraron productos para eliminar'}
        }else{

           const exists  =  products.some((product) => product.id == id)
           if(!exists){
            return {status : false , message : 'No se encontró producto para eliminar'}
           }else{
               const index =  products.findIndex((product) => product.id == id);
               logger.debug(index)
               products.splice(index, 1);

               fs.writeFileSync(this.filepath, JSON.stringify(products))

               return {status : true , message : 'El producto fue eliminado correctamente'}
           }
        }
   }


}


export default ProductController

import productService from '../services/productService.js'

class productController {

    constructor(){
        this.productService = new productService()
    }

    getProductById = async (id) => {

        const product = await this.productService.getProductById(id)

        return product ?
        { status: true ,  product : product , message : '' } :
        { status: false , product : null,  message : `Producto no encontrado con Id ${id}`}
    }


    getProducts = async () => {
       const result =  await this.productService.getProducts()
       return result
    }


    addProduct =  async (data) => {
      const result = await this.productService.addProduct(data)
      return result
    }

    deleteProduct = async(id) => {
     const result = await this.productService.deleteProduct(id)
     return result
   }

}

export default productController
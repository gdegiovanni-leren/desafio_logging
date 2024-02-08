
import cartService from '../services/cartService.js'

class cartController {

    constructor(){
       this.cartService = new cartService()
    }

    createCart = async () => {
        const id = this.cartService.createCart()
        if(id) return id
        return null
    }

    addProductToCart = async (data) => {
        return await this.cartService.addProductToCart(data)
    }

}

export default cartController
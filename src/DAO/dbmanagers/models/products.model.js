import mongoose from 'mongoose'

//TODO: ADD REQUIRES
const productSchema = mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: Boolean,
    stock: Number,
    category: String,
    thumbnails: {
        type: Array,
        'default': []
      }
})


const productModel = mongoose.model('products', productSchema)

export default productModel

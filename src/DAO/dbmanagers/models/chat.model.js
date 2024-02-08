import mongoose from 'mongoose'

const chatSchema = mongoose.Schema({
    user: String,
    message: String,

}, { timestamps: true } )


const chatModel = mongoose.model('chats', chatSchema)

export default chatModel
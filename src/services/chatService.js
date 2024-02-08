
import chatModel from '../DAO/dbmanagers/models/chat.model.js'

class chatService {

    constructor(){}

    addMessage = async (data) => {
        await chatModel.create(data)
   }

   getMessages = async() => {
       const messages =  await chatModel.find().sort({createdAt: -1}).select({_id: 0, user: 1, message: 1}).lean().exec()
       return messages
   }

}

export default chatService
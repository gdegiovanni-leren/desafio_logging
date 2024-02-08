
import chatService from '../services/chatService.js'

class chatController {

    constructor(){
        this.chatService = new chatService()
    }

    addMessage = async (data) => {
        await this.chatService.addMessage(data)
   }

   getMessages = async() => {
       const messages =  await this.chatService.getMessages()
       return messages
   }

}

export default chatController
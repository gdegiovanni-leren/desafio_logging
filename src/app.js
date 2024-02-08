
import express from 'express'
import handlebars from 'express-handlebars'
import config from './config/config.js'
import viewsRouter from './routes/views.router.js'
import cartRouter from './routes/cart.router.js'
import productRouter from './routes/product.router.js'
import sessionRouter from './routes/session.router.js'
import __dirname from './utils/utils.js'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import productController from './controllers/productController.js'
import cartController from './controllers/cartController.js'
import chatController from './controllers/chatController.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import { logger } from './utils/logger.js'


const app = express()

const PORT = config.PORT
const ENVIROMENT = config.ENVIROMENT
const mongoURL = config.MONGO_URL
const mongoDBName = config.MONGO_DB_NAME

app.use(session({
    store: MongoStore.create({
        mongoUrl : mongoURL,
        dbName : mongoDBName,

    }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())


app.use('/static', express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//handlebars config
app.engine('handlebars',handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')


app.use('/',viewsRouter)
app.use('/products',productRouter)
app.use('/carts',cartRouter)
app.use('/api/session',sessionRouter)

let httpServer = null


await mongoose.connect(mongoURL, {dbName: mongoDBName} ).then( () => {


    logger.info('DB CONNECTION SUCCESSFUL')
    logger.info('Initialization enviroment: '+ENVIROMENT)
    /*
    logger.debug('DEBUG')
    logger.warning('WARN')
    logger.http('HTTP')
    logger.error('ERR')
    logger.fatal('FATAL')
    */

    httpServer =  app.listen(PORT, () => logger.info('Listening on port: '+PORT) )
}).catch((e) => {
    logger.fatal(e)
})


app.get('/loggerTest', (req,res) => {
    logger.debug('LOGGER DEBUG!')
    logger.info('LOGGER INFO!')
    logger.warning('LOGGER WARNING!')
    logger.http('LOGGER HTTP!')
    logger.error('LOGGER ERROR!')
    logger.fatal('LOGGER FATAL!')

    res.send('LOGGER PRINTED, SEE CONSOLE OR FILE TO VIEW LOGS ')
})


const socketServer = new Server(httpServer)

socketServer.on('connection', async socket => {

    logger.info('Client connected')

    const PC = new productController()
    const CC = new cartController()
    const CHATC = new chatController()

    const products = await PC.getProducts()

    socket.emit('products',products)


    /* CREATE PRODUCT */
    socket.on('new-product', async product => {

        logger.debug('NEW PRODUCT SOCKET CALL',product)

        const result = await PC.addProduct(product)
        socket.emit('new-product-message', result)

        const refreshproducts = await PC.getProducts()
        socket.emit('products',refreshproducts)
    })

    /* DELETE PRODUCT */
    socket.on('delete-product', async id => {

        logger.debug('DELETE PRODUCT SOCKET CALL WITH ID',id)

        const result = await PC.deleteProduct(id)
        socket.emit('delete-product-message', result)

        const refreshproducts = await PC.getProducts()
        socket.emit('products',refreshproducts)

    })

    /* ADD PRODUCT TO CART */
    socket.on('add-product', async add_data => {

        logger.debug('ADD PRODUCT SOCKET CALL',add_data)

        const result = await CC.addProductToCart(add_data)

        logger.debug(result)
        socket.emit('add-product-message', result)

    })

    /* CHAT */
    socket.on('new-user-chat', async user => {
        logger.debug('user connected: ',user)

       const messages = await CHATC.getMessages()
        socket.emit('logs', messages )
    })

    socket.on('message', async data => {

       await CHATC.addMessage(data)

       const messages = await CHATC.getMessages()
       socketServer.emit('logs', messages )
    })



})

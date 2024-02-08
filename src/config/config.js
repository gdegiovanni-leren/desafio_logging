import dotenv from 'dotenv'

dotenv.config()

export default {
    PORT: process.env.PORT || 8080,
    ENVIROMENT : process.env.ENVIROMENT,
    MONGO_URL :  process.env.MONGO_URL,
    MONGO_DB_NAME : process.env.MONGO_DB_NAME,
    ADMIN_EMAIL : process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD : process.env.ADMIN_PASSWORD,
}
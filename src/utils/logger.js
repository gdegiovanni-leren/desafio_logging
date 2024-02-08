import winston from 'winston'
import config from '../config/config.js'

const customLevels = {
    levels : {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    }
}

const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} | ${level}: ${message}`;
  });


export const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp({
          format: "DD-M-YYYY HH:mm:ss",
        }),
        myFormat,
        winston.format.colorize({ colors: { info: 'green', http: 'grey', debug: 'blue', error: 'red', warning: 'yellow', fatal: 'red' }})
      ),
    transports: [
        new winston.transports.Console({
            level: config.ENVIROMENT == 'development' ? 'debug' : 'info',
            format: winston.format.simple()
        }),
        new winston.transports.File({
            filename: './logs/error.log', level: 'warning'
        })
    ]
})

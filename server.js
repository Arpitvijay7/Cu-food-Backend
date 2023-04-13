const app = require('./app')
const dotenv = require('dotenv')
const connectDatabase = require('./config/database')

// Handling uncaughtException Errors
process.on('uncaughtException',err => {
    console.log(`Error:- ${err}`);
    console.log(`Shutting down the server because of uncaught exception Errors`);
    server.close(() => {
        process.exit(1);
    })
})

// Config Path
dotenv.config({path : "./config/config.env"})

connectDatabase();

const server = app.listen(process.env.PORT ,()=> {
    console.log(`Server Connected to port ${process.env.PORT}`);
});

// Handling Unhandled Rejection Errors
process.on('UnhandledRejection',err => {
    console.log(`Error:- ${err}`);
    console.log(`Shutting down the server because of Unhandled Rejection Errors`);
    server.close(() => {
        process.exit(1);
    })
})

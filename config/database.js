const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_link,{
        useNewUrlParser : true, useUnifiedTopology: true
    }).then((data) => {
       console.log(`DataBase Connected Successfully`);
    }).catch((error) => {
       console.log(`Error Connecting DataBase: ${error}`);
    })
}

module.exports = connectDatabase;
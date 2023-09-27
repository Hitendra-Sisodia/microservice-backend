const mongoose = require("mongoose");
require("dotenv").config();

function dbConnect(){
    mongoose.connect(process.env.MONGODB_URL , {
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(() => console.log("DB connection successfull"))
    .catch((err) => {
        console.log("DB connection failed");
        console.log(err);
        process.exit(1);
    })
}

module.exports = dbConnect;
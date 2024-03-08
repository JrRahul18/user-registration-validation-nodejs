const mongoose = require("mongoose")

const DB_URI = "mongodb+srv://rahuljeenaworkspace:0eB1Uvn5QyvBUE6r@cluster0.ltcl1ng.mongodb.net/registration&validation?retryWrites=true&w=majority"

const connect = () =>{
    mongoose.connect(DB_URI).then((data) =>{
        console.log(`MONGODB connected with server`, data.connection.host)
    })
}
module.exports = connect
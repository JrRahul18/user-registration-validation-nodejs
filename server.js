const app = require("./app")

const dotenv = require("dotenv")
const connectDB = require("./config/database")

dotenv.config({ path: "config/config.env" });


connectDB();

const PORT = 4000;

const server = app.listen(PORT, ()=>{
    console.log(`SERVER RUNNING ON ${PORT}`)
})



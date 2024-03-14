const express = require("express")
const app = express();
const UserRoutes = require("./routes/User")
const PostRoutes = require("./routes/Post")
const cookieParser = require('cookie-parser');
const errorMiddleware = require("./middleware/Error")


app.use(express.json())
app.use(cookieParser())


app.use("/api/v1",UserRoutes)
app.use("/api/v1", PostRoutes)

app.use(errorMiddleware)


module.exports = app

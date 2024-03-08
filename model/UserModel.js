const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const validator = require("validator")
const jwtToken = require("jsonwebtoken");


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please Enter Your Username"],
    minLength: [4, "Name cannot be less than 4 chars"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter Valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 chars"],
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

//Before adding the user into DB, it will hash the password with 12 salt rounds to maintain privacy
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    const saltRound = 12;
    this.password = await bcrypt.hash(this.password, saltRound);
})

userSchema.methods.comparePassword = async function (extractedPassword){
    return await bcrypt.compare(extractedPassword, this.password);
}

userSchema.methods.resetPassword = function (){
    const token = crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordExpire = Date.now() + 15*60*1000;
    return token
}

userSchema.methods.getToken = function(){
    const JWT_SECRET = "Jkjbsdf$%kjdskjl#@$kjhhbak"
    const JWT_EXPIRE = "5d"
 
    return jwtToken.sign({id: this._id}, JWT_SECRET, {expiresIn: JWT_EXPIRE})
}
module.exports = mongoose.model("User", userSchema)
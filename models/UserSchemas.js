const mongoose =require ("mongoose");
 const UserSchema =new mongoose.Schema({
    userID:String,
    username: String,
    email:String,
    ipAddress:  String,
      timeSpent: Number,
      firstVisit: Date,
      

 })

 const tryUser=mongoose.model("tryUser",UserSchema)

module.exports=tryUser;
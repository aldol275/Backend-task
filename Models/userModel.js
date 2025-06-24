const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type: String,
        required: [true,"Please enter"]
    },

    email:{
        type: String,
        required: [true, "Please add the email"],
        unique: true
    },

    password: {
        type: String,
        required: [true, "Please add password"],
        unique: true
    },

    enrolledCourses: [
    {
        courseId: {
            type: String,
            required: true
        },
        progress: {
            type: Number,
            default: 0,  // progress in %
            min: 0,
            max: 100
         }
        }   
      ]      
    },

    {
        timestamps:true
    }
)

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose")
const express = require("express")
const dotenv = require("dotenv")
const app = express()
// const connectDB = require("./connection")

const URI = process.env.DATABASE

// connectDB()

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(URI)
        console.log("✅ Connected Successfully")
    }catch(err){
        console.log("Not connected with db", err.message);
        process.exit(1)
    }
};

module.exports = connectDB
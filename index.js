const express = require("express")
const app = express()
require("dotenv").config();
const connectDB = require('./connection')
const { swaggerUi, swaggerSpec } = require("./swagger");
const port = process.env.PORT ;

connectDB();
app.use(express.json());
 
app.use("/api/users", require("./Routes/userRoute"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});


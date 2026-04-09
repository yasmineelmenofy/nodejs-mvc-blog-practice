import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port =  process.env.PORT || 5000;

app.get('/', (req,res) => {
    res.send('Hello from homepage');
})

app.listen(port, () => {
    console.log(`I am listening on port ${port}`);
})
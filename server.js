import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/',(req,res) => {
    res.send("Part 1: Prototype in development");
})

app.listen(PORT,() => {
    console.log(`Listening on port: ${PORT}`);
    
})
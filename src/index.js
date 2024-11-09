import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import schoolRouter from './routers/schools.js';
import studentRouter from './routers/students.js';
import resultRouter from './routers/results.js';



const app = express()
mongoose.connect(process.env.MONGODB_URL);
const port = process.env.PORT
app.use(cors());
app.use(express.json())
app.use(schoolRouter)
app.use(studentRouter)
app.use(resultRouter)


app.listen(port, () => {
    console.log('Server is up on '+port)
})












//   cd ../../../../../Program Files\MongoDB\Server\7.0\bin
//   mongod --dbpath C:\Users\Noble\Mongodb-data
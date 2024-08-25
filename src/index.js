import express from 'express';
import mongoose from 'mongoose';
import schoolRouter from './routers/schools.js';
import studentRouter from './routers/students.js';



const app = express()
mongoose.connect(process.env.MONGODB_URL);
const port = process.env.PORT
app.use(express.json())
app.use(schoolRouter)
app.use(studentRouter)


app.listen(port, () => {
    console.log('Server is up on '+port)
})












//   cd ../../../../../Program Files\MongoDB\Server\7.0\bin
//   mongod --dbpath C:\Users\Noble\Mongodb-data
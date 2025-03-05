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


//handle error in result
//there should be a button that moves everyone to a new class.
//if you check a past result, the total students in class will be the students current classmates not at the point of interest.
//provision to upload the school logo and result sheets for different exams and types of results.





//   cd ../../../../../Program Files\MongoDB\Server\8.0\bin
//   mongod --dbpath C:\Users\user\Mongodb-data
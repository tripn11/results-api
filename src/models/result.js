import mongoose from 'mongoose';
import { Student } from './student.js';


const resultSchema = new mongoose.Schema({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:Student,
        required:true
    },
    attendance: Number,
    teachersComment:String,
    session:{
        type:String,
        required:true
    },
    term:{
        type:String,
        required:true
    },
    subjects:{
        type:Map,
        of:Object,
        required:true,
        _id:false
    }
})

export const Result = mongoose.model('Result', resultSchema)
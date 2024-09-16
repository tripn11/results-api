import mongoose from 'mongoose';


const resultSchema = new mongoose.Schema({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    attendance: Number,
    caAverage:Number,
    caTotal:Number,
    average:Number,
    total:Number,
    teachersName:String,
    teachersComment:String,
    principalsComment:String,
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
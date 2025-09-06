import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    attendance: Number,
    population:Number,
    age:Number,
    caAverage:Number,
    caTotal:Number,
    average:Number,
    total:Number,
    teachersName:String,
    teachersComment:String,
    principalsComment:String,
    className: {
        type:String,
        required:true
    },
    session:{
        type:String,
        required:true
    },
    term:{
        type:String,
        required:true
    },
    subjects: {
        type: Object,   
        required: true,
        _id: false,
        default: {},
        validate: {
            validator: function(v) {
                return Object.values(v).every(val => val && typeof val === 'object' && !Array.isArray(val));
            },
            message: 'Each subject must be an object'
        }
    }
})

export const Result = mongoose.model('Result', resultSchema)
import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    school: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
        required:true
    },
    attendance: Number,
    timesSchoolOpened:Number,
    population:Number,
    age:Number,
    teachersName:String,
    teachersTitle:String,
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

resultSchema.pre('save', async function (next) {
    await this.populate("school")
    this.timesSchoolOpened = this.school.termInfo.totalTimesSchoolOpened;
    next();
});

export const Result = mongoose.model('Result', resultSchema)
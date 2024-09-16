import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true,
        immutable:true,
        unique:true
    },
    email: {
        type:String,
        required: true,
        lowercase:true,
        unique:true,
        immutable:true,
        validate (email) {
            if(!validator.isEmail(email)) {
                throw new Error('Email is not valid')
            }
        }
    },
    phoneNumber:{
        type:Number,
        validate(number) {
            if(!validator.isMobilePhone(number,'NG')) {
                throw new Error('Not a Phone Number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate (value) {
            if(validator.isStrongPassword(value,{
                minLength: 6,
                minSymbols:0
            })===false){
                throw new Error('Password must contain lowercase, uppercase and number')
            }
        }
    },
    address: { 
        type: String, 
        trim:true 
    },
    motto: {
        type: String,
        trim:true 
    },
    classes:{
        nursery:{
            classes:[{
                class:String,
                code:String,
                teachersName:String,
                _id:false
            }],
            grading:[String],
            subjects:[String]
        },
        primary:{
            classes:[{
                class:String,
                code:String,
                teachersName:String,
                _id:false
            }],
            grading:[String],
            subjects:[String]
        },
        juniorSecondary:{
            classes:[{
                class:String,
                code:String,
                teachersName:String,
                _id:false
            }],
            grading:[String],
            subjects:[String]
        },
        seniorSecondary:{
            classes:[{
                class:String,
                code:String,
                teachersName:String,
                _id:false
            }],
            grading:[String],
            subjects:[String]
        }
    },
    termInfo: {
        totalTimesSchoolOpened:Number,
        currentSession:String,
        currentTerm:String
    },
    tokens: [String]
})

schoolSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
        next()
    }
    next();
})

schoolSchema.virtual("students", {
    ref:'Student',
    localField:'_id',
    foreignField:'school'
})

schoolSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id:this._id},process.env.JWT_SECRET_CODE)
    this.tokens.push(token)
    return token
}

schoolSchema.methods.toJSON = function () {
    const school = this.toObject();
    delete school.password;
    delete school.__v
    return school
}

export const School = mongoose.model('School', schoolSchema)
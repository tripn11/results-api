import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true,
        immutable:true
    },
    email: {
        type:String,
        required: true,
        lowercase:true,
        unique:true,
        immutable:true,
        validate (value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid')
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
            classes:[String],
            subjects:[String]
        },
        primary:{
            classes:[String],
            subjects:[String]
        },
        secondary:{
            classes:[String],
            subjects:[String]
        }
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

schoolSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id:this._id},process.env.JWT_SECRET_CODE)
    this.tokens.push(token)
    return token
}

export const School = mongoose.model('School', schoolSchema)
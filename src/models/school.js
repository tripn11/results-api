import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {codeGenerator} from '../middleware/codeGenerator.js';

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true,
        immutable:true,
        unique:true,
        lowercase:true
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
        type:String,
        validate(number) {
            if(!validator.isMobilePhone(number,'en-NG')) {
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
    termInfo: {
        totalTimesSchoolOpened:Number,
        currentSession:String,
        currentTerm:String
    },
    tokens: [String],
    classes:{
        nursery:{
            classes:{
                type:[{
                    class:String,
                    code:String,
                    teachersName:String,
                    _id:false
                }],
                default:[
                    {class:'nursery 1'},
                    {class:'nursery 2'},
                    {class:'nursery 3'}
                ]
            },
            grading:{
                type:[String],
                default:['note-10','classwork-5','homework-5','test-20']
            },
            subjects:{
                type:[String],
                default:['mathematics','english language','verbal reasoning']
            }
        },
        primary:{
            classes:{
                type:[{
                    class:String,
                    code:String,
                    teachersName:String,
                    _id:false
                }],
                default:[
                    {class:'year 1'},
                    {class:'year 2'},
                    {class:'year 3'},
                    {class:'year 4'},
                    {class:'year 5'}
                ]
            },
            grading:{
                type:[String],
                default:['note-10','classwork-5','homework-5','test-20']
            },
            subjects:{
                type:[String],
                default:['mathematics','english language','verbal reasoning','quantitative reasoning']
            }
        },
        juniorSecondary:{
            classes:{
                type:[{
                    class:String,
                    code:String,
                    teachersName:String,
                    _id:false
                }],
                default:[
                    {class:'jss 1'},
                    {class:'jss 2'},
                    {class:'jss 3'}
                ],
            },
            grading:{
                type:[String],
                default:['note-10','classwork-5','homework-5','test-20']
            },
            subjects:{
                type:[String],
                default:['mathematics','english language','basic science','basic technology','business studies']
            }
        },
        seniorSecondary:{
            classes:{
                type:[{
                    class:String,
                    code:String,
                    teachersName:String,
                    _id:false
                }],
                default:[
                    {class:'ss 1'},
                    {class:'ss 2'},
                    {class:'ss 3'}
                ],
            },
            grading:{
                type:[String],
                default:['note-10','classwork-5','homework-5','test-20']
            },
            subjects:{
                type:[String],
                default:['mathematics','english language','physics','chemistry','biology','government','economics']
            }
        }
    }
})

schoolSchema.pre('save', async function (next) {
    if(this.isNew) {
        const sections = Object.keys(this.classes)
        sections.forEach(section=>{
            const classes = this.classes[section].classes.map(eachClass=>{
                const code = codeGenerator(6)
                return {...eachClass,code}
            })
            this.classes[section].classes=classes;
        })
        
    }if(this.isNew || this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
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
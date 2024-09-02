import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name:{
        type: new mongoose.Schema({
            firstName:{
                type:String, 
                trim:true, 
                required:true
            },
            surName:{
                type:String, 
                trim:true, 
                required:true
            },
            otherName:{
                type:String,
                trim:true
            },
            _id:false
        }),
        required:true,
    },
    dateOfBirth:{
        type:Number, 
        required:true 
    },
    sex:{
        type:String, 
        required:true
    },
    class:{
        type:String,
        required:true
    },
    height:Number,
    weight:Number,
    school:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})

studentSchema.virtual('age').get(function () {
    if(!this.dateOfBirth) {
        return null
    }

    const dateOfBirth = new Date(this.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - dateOfBirth.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
  
    return age;
})

studentSchema.virtual('fullName').get(function () {
    const othername = this.name.otherName?this.name.otherName:'';
    return this.name.surName+' '+this.name.firstName+' '+othername
})

studentSchema.virtual('results', {
    ref:'Result',
    localField:'_id',
    foreignField:'owner'
})

studentSchema.methods.getTermResult = async function (school,section) {
    const grading= school.classes[section].grading;
    const sectionSubjects = school.classes[section].subjects;
    const currentTerm = school.termInfo.currentTerm
    const currentSession = school.termInfo.currentSession
   
    const grade = {}
    const subjects = {}



    const result = await this.populate({
        path:'results',
        match:{
            session:currentSession,
            term:currentTerm
        }
    })
    
    if(result.length>0) {
        return result
    }else{
        grading.forEach(each=>{
            const[area,score]= each.split('-')
            grade[area]=score
        })

        sectionSubjects.forEach(each=>{
            subjects[each]=grade
        })

        const initialResult = {
            owner:this._id,
            session:currentSession,
            term:currentTerm,
            subjects
        }
    
        return initialResult
    }     
}

studentSchema.statics.getStudentsInClass = async (schoolId,level,page=1) => {
    let skip = (page-1) * 10
    const students = await Student.find({school:schoolId,class:level})
    .sort({"name.surName":1})
    .limit(10)
    .skip(skip)
    
    return students
}

export const Student = mongoose.model('Student', studentSchema)
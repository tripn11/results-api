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
        required:true,
        ref:"School"
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

studentSchema.methods.getTermResult = async function (school,section,teachersName) {
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
            teachersName,
            subjects
        }
    
        return initialResult
    }     
}

studentSchema.methods.totalStudentsInClass = async function () {
    await this.populate('school');
    const totalStudents = await Student.countDocuments({school:this.school._id,class:this.class});
    return totalStudents;
}


studentSchema.statics.getStudentsInClass = async (schoolId,level,page=1) => {
    let skip = (page-1) * 10
    const students = await Student.find({school:schoolId,class:level})
    .sort({"name.surName":1})
    .limit(10)
    .skip(skip)
    
    return students
}

studentSchema.statics.promoteStudents = async school => {
    const nurseryClasses = school.classes.nursery.classes.map(eachClass=>eachClass.class)
    const primaryClasses = school.classes.primary.classes.map(eachClass=>eachClass.class)
    const juniorSecondaryClasses = school.classes.juniorSecondary.classes.map(eachClass=>eachClass.class)
    const seniorSecondaryClasses = school.classes.seniorSecondary.classes.map(eachClass=>eachClass.class)
    const allClasses = nurseryClasses.concat(primaryClasses,juniorSecondaryClasses,seniorSecondaryClasses)

    await school.populate('students')

    await Promise.all(school.students.forEach( async student=>{
        let index = allClasses.findIndex(student.class)
        if(index === (allClasses.length-1)){
            student.class = 'graduated'
            await student.save();
        }else {
            index++;
            student.class = allClasses[index]
            await student.save()
        }
    }))
}

export const Student = mongoose.model('Student', studentSchema)
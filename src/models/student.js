import mongoose from "mongoose";
import codeGenerator from '../middleware/codeGenerator.js';

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
        type:Date, 
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
    code:String,
    status:{
        type:String,
        default:'active'
    },
    school:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"School"
    }
},{ timestamps:true })

studentSchema.pre('save', async function (next) {
    if(this.isNew) {
        this.code = codeGenerator(7)
    }

    next();
})

studentSchema.virtual('age').get(function () {
    const today = new Date()
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - this.dateOfBirth.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < this.dateOfBirth.getDate())) {
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

studentSchema.methods.getTermResult = async function (school,section,teachersName,teachersTitle) {
    const grading= school.classes[section].grading;
    const sectionSubjects = school.classes[section].subjects;
    const currentTerm = school.termInfo.currentTerm
    const currentSession = school.termInfo.currentSession

    const grade = {}
    const subjects = {}


    await this.populate({
        path:'results',
        match:{
            session:currentSession,
            term:currentTerm
        }
    })

    if(this.results.length>0) {
        return this.results[0]
    }else{
        grading.forEach(each=>{
            grade[each]=each.split('-')[1]
        })
        const examGrade = 100 - Object.values(grade).reduce((total,val)=> total + Number(val),0)
        grade[`exam-${examGrade}`] = examGrade;

        sectionSubjects.forEach(each=>{
            subjects[each]=grade
        })

        const initialResult = {
            owner:this._id,
            school:this.school,
            session:currentSession,
            term:currentTerm,
            className:this.class,
            teachersName,
            teachersTitle,
            subjects
        }
    
        return initialResult
    }     
}

studentSchema.methods.totalStudentsInClass = async function () {
    const totalStudents = await Student.countDocuments({school:this.school,class:this.class});
    return totalStudents;
}


studentSchema.statics.getStudentsInClass = async (schoolId, level, page = 1) => {
    let skip = (page - 1) * 10;
    const students = await Student.find({ school: schoolId, class: level })
        .sort({ "name.surName": 1 })
        .limit(10)
        .skip(skip);

    const total = await Student.countDocuments({ school: schoolId, class: level });

    return { students, total };
}

studentSchema.statics.totalStudentsInSchool = async (schoolId) => {
    const total = await Student.countDocuments({school:schoolId,status:'active'})
    return total
}

studentSchema.statics.promoteStudents = async school => {
    const nurseryClasses = school.classes.nursery.classes.map(eachClass=>eachClass.class)
    const primaryClasses = school.classes.primary.classes.map(eachClass=>eachClass.class)
    const juniorSecondaryClasses = school.classes.juniorSecondary.classes.map(eachClass=>eachClass.class)
    const seniorSecondaryClasses = school.classes.seniorSecondary.classes.map(eachClass=>eachClass.class)
    const allClasses = nurseryClasses.concat(primaryClasses,juniorSecondaryClasses,seniorSecondaryClasses)

    await school.populate('students')

    await Promise.all(school.students.map( async student=>{
        let index = allClasses.findIndex(c=> c === student.class)
        if(index === -1) {
            return
        }
        if(index === (allClasses.length-1)){
            student.class = 'graduated'
            student.status = 'graduated'
            await student.save();
        }else {
            index++;
            student.class = allClasses[index]
            await student.save()
        }
    }))
}

studentSchema.statics.resetCodes = async (schoolId) => {
    const students = await Student.find({ school: schoolId });
    await Promise.all(students.map(async (student) => {
        student.code = codeGenerator(7);
        await student.save();
    }));
}

export const Student = mongoose.model('Student', studentSchema)
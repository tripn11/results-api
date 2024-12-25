import express from 'express';
import auth from '../middleware/auth.js'
import teacherAuth from '../middleware/teacherAuth.js';
import { Student } from "../models/student.js";

const router = new express.Router()

router.post('/students', auth, async(req,res) =>{
    try {
        const student = new Student({...req.body,school:req.school._id});
        await student.save()
        res.send(student)
    }catch(e){
        res.status(400).send(e.message)
    }
})

router.get('/sectionStudents', auth, async(req,res) => {
    try {
        const section = req.query.section;
        const classes = req.school.classes[section].classes.map(eachClass=>eachClass.class)
        const students = await Student.find({school:req.school._id,class:classes})
        if(students.length===0){
            throw new Error('No students in this section')
        }
        res.status(200).send(students)
    }catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/classStudents',teacherAuth, async(req,res) => {
    try{
        const grading= req.school.classes[req.section].grading.length>0;
        const sectionSubjects = req.school.classes[req.section].subjects.length>0;
        const currentTerm = req.school.termInfo.currentTerm !== undefined
        const currentSession = req.school.termInfo.currentSession !== undefined
        const isAdminReady = grading && sectionSubjects && currentTerm && currentSession

        const page = req.query.page;
        const students = await Student.getStudentsInClass(req.school._id,req.class,page)
        if(!students) {
            throw new Error('No students found')
        }

        if(isAdminReady) {
            const results = await Promise.all(students.map(async(student)=>{
                const studentResult = await student.getTermResult(req.school,req.section,req.teachersName)
                return studentResult;
            }))
            res.send({students,results})
        }else {
            throw new Error ("Admin must set the grading,subjects, and term info")
        }
    }catch(e) {
        res.send(e.message)
    }
})

router.patch('/students/:id', auth, async(req,res) =>{
    const _id = req.params.id
    try{
        const student = await Student.findOne({_id,school:req.school._id})
        student.set(req.body)
        await student.save()
        res.send(student)
    } catch(e) {
        res.status(400).send(e.message)
    }
})

router.delete('/students/:id', auth, async(req,res) => {
    const _id =req.params.id
    try{
        const student = await Student.findOne({_id,school:req.school._id})
        await student.deleteOne()
        res.send(student)
    } catch (e) {
        res.status(400).send(e.message)
    }
})


export default router;
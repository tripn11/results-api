import express from 'express';
import auth from '../middleware/auth.js'
import teacherAuth from '../middleware/teacherAuth.js';
import studentAuth from '../middleware/studentAuth.js';
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

router.post('/students/promote', auth, async (req, res) => {
    try {
        await Student.promoteStudents(req.school);
        res.send({ message: 'All students have been promoted successfully' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

router.post('/students/resetCodes', auth, async (req, res) => {
    try {
        await Student.resetCodes(req.school._id);
        res.send({ message: 'All student codes have been reset successfully.' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

router.get('/sectionStudents', auth, async(req,res) => {
    try {
        const section = req.query.section;
        const classes = req.school.classes[section].classes.map(eachClass=>eachClass.class)
        const students = await Student.find({school:req.school._id,class:classes})
        res.status(200).send({students})
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
        const response = await Student.getStudentsInClass(req.school._id,req.class,page)
        
        if(response.students.length===0) {
            throw new Error('No students found')
        }

        if(isAdminReady) {
            const results = await Promise.all(response.students.map(async(student)=>{
                const studentResult = await student.getTermResult(req.school,req.section,req.teachersName, req.teachersTitle)
                return studentResult;
            }))
            res.send({
                students: response.students.map(student => student.toJSON({ virtuals: true })),
                results,
                teachersTitle: req.teachersTitle,
                teachersName: req.teachersName,
                teachersClass: req.class,
                totalStudentsInClass: response.total,
                timesSchoolOpened:req.school.termInfo.totalTimesSchoolOpened,
                schoolName: req.school.name,
            })
        } else {
            throw new Error ("Admin must set the grading, subjects, and term info")
        }
    }catch(e) {
        res.status(400).send(e.message)
    }
})

router.get('/students/totalNumber',auth, async(req,res) => {
    try {
        const number = await Student.totalStudentsInSchool(req.school._id)
        res.status(200).send({number})
    } catch (e) {
        res.status(400).send(e.message)
    }   
})

router.get('/student', studentAuth, async(req, res) => {
    try{
        await req.student.populate('school');

        if(req.student.school.approved===false) {
            throw new Error('School Account Inactive. Please contact School Administrator')
        }
        
        const classes = Object.values(req.student.school.classes)
                        .flatMap(section => section.classes.map(c => c.class));
                        
        const details = {
            fullName: req.student.fullName, 
            class:req.student.class, 
            term: req.student.school.termInfo.currentTerm,
            schoolName: req.student.school.name,
            classes
        }
        res.send(details)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/students/:id', auth, async(req,res) =>{
    const _id = req.params.id
    try{
        const student = await Student.findOne({_id,school:req.school._id})
        student.set(req.body)
        await student.save()
        res.send("student has been updated")
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
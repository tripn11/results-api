import express from 'express';
import teacherAuth from '../middleware/teacherAuth.js';
import { Result } from '../models/result.js';
import { Student } from '../models/student.js';
import { pdfGenerator } from '../pdfGeneration/resultGenerator.js';
import auth from '../middleware/auth.js';

const router = new express.Router()

router.post('/addResult',teacherAuth, async(req,res) => {
    try{
        const result = new Result(req.body)
        await result.save()
        res.send(result)
    }catch (e) {
        res.status(400).send(e.message)
    }
})

router.put('/updateResult/:id',teacherAuth, async(req,res) => {
    try {
        await Result.findOneAndUpdate({_id:req.params.id},req.body)
        res.send("updated")
    }catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/finalResult', auth ,async(req,res) => {
    try{
        let results = []
        if(req.body.studentName!==''){
            const [surName, firstName] = req.body.studentName.split(" ")
            const student = await Student.findOne({
                "name.firstName":firstName,
                "name.surName":surName
            })
            if(!student) {
                throw new Error("Student not found")
            }
            const result = await Result.findOne({
                owner:student._id,
                session:req.body.session,
                term:req.body.term,
                className:req.body.className
            })
            if(!result) {
                throw new Error("Result not found")
            }
            results.push(result)            
        }else {
            const classResult = await Result.find({
                session:req.body.session,
                term:req.body.term,
                className:req.body.className
            })
            if(classResult.length === 0) {
                throw new Error("No results found")
            }
            results = classResult
        }
        const finalResults = await pdfGenerator(results,req.body.type)
        res.json(finalResults)
        console.log("done")
    }catch(e) {
        res.status(400).send(e.message)
    }
})

export default router

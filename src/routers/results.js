import express from 'express';
import teacherAuth from '../middleware/teacherAuth.js';
import { Result } from '../models/result.js';
import { pdfGenerator } from '../pdfGeneration/resultGenerator.js';

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


router.get('/finalResult', async(req,res) => {
    try{
        const result = await Result.findOne({_id:req.query.id})
        const finalResult = await pdfGenerator(result)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="result.pdf"');
        res.setHeader('Content-Length', finalResult.length);
        res.send(Buffer.from(finalResult))
        console.log("doone")
    }catch(e) {
        res.status(400).send(e.message)
    }
})

export default router

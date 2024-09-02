import express from 'express';
import teacherAuth from '../middleware/teacherAuth.js';
import { Result } from '../models/result.js';

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

export default router
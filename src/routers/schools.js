import express from 'express';
import bcrypt from 'bcryptjs';
import { School } from '../models/school.js';
import auth from '../middleware/auth.js';


const router = new express.Router();

router.post("/schools", async (req, res) => {
    try {
        const school = new School(req.body)
        const token = school.generateAuthToken()
        await school.save()
        res.send({school,token})
    } catch (e) {
        console.log(e)
        if (e.name === 'ValidationError') {
            const error = {};
            Object.keys(e.errors).forEach((key) => {
                error[key] = e.errors[key].message; 
            });

            return res.status(400).json({ error });
        }
        if (e.code === 11000) {
            const duplicateField = Object.keys(e.keyPattern)[0];
            const message = `The ${duplicateField} is already in use. Please use a different ${duplicateField}.`;
            return res.status(400).json({ error: {duplicate:message} });
        }
        res.status(400).send(e.message)
    }
})

router.post("/schools/login", async (req,res) => {
    try {
        const school = await School.findOne({email:req.body.email}) 
        if(school===null) {
            throw new Error ('Incorrect Login Details')
        }
        const correctPassword = await bcrypt.compare(req.body.password, school.password)

        if(correctPassword) {
            const token = school.generateAuthToken()
            await school.save()
            res.status(200).send({school,token})
        }else{
            throw new Error('Incorrect Login Details')
        }
    }catch (e) {
        res.status(400).send(e.message)
    }
})

router.post("/schools/logout", auth, async (req, res) =>{
    try{
        const index = req.school.tokens.indexOf(req.token)
        req.school.tokens.splice(index,1)
        await req.school.save()
        res.send(req.school.name+' has sucessfully logged out')
    }catch (e) {
        res.status(500).send(e.message)
    }
})

router.post("/schools/logoutAll", auth, (req,res)=>{
    req.school.tokens=[]
    res.send(req.school.name+' has sucessfully logged out on all devices')
})

router.patch("/schools", auth, async (req,res) => {
    try{
        Object.assign(req.school, req.body)        
        await req.school.save()
        res.send('updated')
    }catch(e) {
        res.status(400).send(e.message)
    }
})

router.delete("/schools", auth, async (req,res) => {
    try {
        await req.school.deleteOne()
        res.send('Goodbye '+req.school.name)
    }catch(e) {
        res.status(500).send(e.message)
    }
})


export default router;
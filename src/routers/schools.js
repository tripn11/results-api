import express from 'express';
import bcrypt from 'bcryptjs';
import { School } from '../models/school.js';
import auth from '../middleware/auth.js';


const router = new express.Router();

router.post("/schools", async (req, res) => {
    const school = new School(req.body)
    try {
        const token = school.generateAuthToken()
        await school.save()
        res.send({school,token})
    } catch (e) {
        res.send(e.message)
    }
})

router.post("/schools/login", async (req,res) => {
    try {
        const school = await School.findOne({email:req.body.email}) 
        const correctPassword = await bcrypt.compare(req.body.password, school.password)

        if(school && correctPassword) {
        const token = school.generateAuthToken()
        await school.save()
        res.status(200).send({school,token})
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
    res.send("Logout all successfull")
})

router.patch("/schools/update", auth, async (req,res) => {
    try{
        req.school.set(req.body)
        await req.school.save()
        res.send(req.school)
    }catch(e) {
        res.status(400).send(e.message)
    }
})

router.delete("/schools/delete", auth, async (req,res) => {
    try {
        await req.school.deleteOne()
        res.send('Goodbye '+req.school.name)
    }catch(e) {
        res.status(500).send(e.message)
    }
})


export default router;
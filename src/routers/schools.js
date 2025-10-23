import express from 'express';
import bcrypt from 'bcryptjs';
import { School } from '../models/school.js';
import { Student } from '../models/student.js';
import auth from '../middleware/auth.js';
import ownerAuth from '../middleware/ownerAuth.js';

const router = new express.Router();

router.post("/schools", async (req, res) => {
    try {
        const school = new School(req.body)
        const token = school.generateAuthToken()
        await school.save()
        res.send({school,token})
    } catch (e) {
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
            if(school.approved===false) {
                throw new Error ("Your account is inactive. Please subscribe to activate or contact support");
            }
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

router.post("/schools/logoutAll", auth, async (req,res)=>{
    try{
        req.school.tokens=[]
        await req.school.save();
        res.send(req.school.name+' has sucessfully logged out on all devices')
    }catch (e) {
        res.status(500).send(e)
    }
})

router.get("/schools", ownerAuth, async (_,res) => {
    try{
        const schools = await School.find({});
        const schoolDetails = await Promise.all(schools.map(async school=>{
            const population = await Student.countDocuments({school:school._id,status:"active"})
            return ({
                _id:school._id,
                name: school.name,
                approved: school.approved,
                phoneNumber:school.phoneNumber,
                population,
            })
        }))
        res.send(schoolDetails);
    }catch(e) {
        res.status(500).send(e.message)
    }
})


router.patch("/schools", auth, async (req,res) => {
    try{
        req.school.set(req.body)        
        await req.school.save()
        res.send("updated")
    }catch(e) {
        res.status(400).send(e.message)
    }
})

router.patch("/overallSchools", ownerAuth, async (req, res) => {
    try {
        const operations = Object.values(req.body).map(school => ({
            updateOne: {
                filter: { _id: school._id },
                update: { $set: { approved: school.approved } },
            }
        }));

        await School.bulkWrite(operations, { ordered: false });
        res.send("updated successfully");
    }catch(e) {
        res.status(500).send(e.message)
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
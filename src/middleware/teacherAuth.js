import jwt from 'jsonwebtoken';
import { School } from "../models/school.js";

const teacherAuth = async (req,res,next) =>{
    try{
        let  teachersCode = jwt.verify(req.header('teacherAuth'), process.env.JWT_SECRET_CODE)

        if(!teachersCode) {
            throw new Error('Please get Authorised first')
        }
    
        teachersCode = teachersCode.code

        const [code,teachersClass] = teachersCode.split("-")
        const school = await School.findOne({
            $or: [
                {"classes.nursery.classes":{$elemMatch:{class:teachersClass,code}}},
                {"classes.primary.classes":{$elemMatch:{class:teachersClass,code}}},
                {"classes.juniorSecondary.classes":{$elemMatch:{class:teachersClass,code}}},
                {"classes.seniorSecondary.classes":{$elemMatch:{class:teachersClass,code}}}
            ]
        })
    
        if(!school) {
            throw new Error ('No school found')
        }

        const section = Object.keys(school.classes)
        .find(section => school.classes[section].classes
        .some(c=>c.code===code && c.class===teachersClass))

 
        req.school = school;
        req.section = section;
        req.class = teachersClass;
        next()

    }catch (e) {
        res.status(400).send(e.message)
    }
}

export default teacherAuth;
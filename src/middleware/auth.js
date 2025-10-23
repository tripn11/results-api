import jwt from 'jsonwebtoken';
import { School } from '../models/school.js';


const auth = async (req, res, next) =>{
    try {
        const token = req.header('Authorization').replace("Bearer ",'')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_CODE)
        const school = await School.findOne({_id:decoded._id, tokens:token}) 

        if(!school) {
            throw new Error('Access Denied! Please get Authorized first')
        }

        req.token = token;
        req.school = school;
        next()
    } catch (e){
        return res.status(400).send(e.message)
    }   
}

export default auth
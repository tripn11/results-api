import { Student } from "../models/student.js";

const studentAuth = async(req,res,next) => {
    try {
        const studentsCode = req.header('Authorization').replace("Bearer ",'');
        const student = await Student.findOne({code:studentsCode})
        if(!student) {
            throw new Error('Invalid Access Code')
        }
        req.student = student;
        next()
    } catch (e) {
        res.status(400).send(e.message)
    }
}

export default studentAuth;
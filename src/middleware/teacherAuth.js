import { School } from "../models/school.js";

const teacherAuth = async (req,res,next) =>{
    try{
        let teachersCode = req.header('Authorization').replace("Bearer ",'');   

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
            throw new Error ('Invalid Authorization Code')
        }

        if(school.approved===false) {
            throw new Error('School Account Inactive. Please contact School Administrator')
        }

        const section = Object.keys(school.classes)
        .find(section => school.classes[section].classes
        .some(c=>c.code===code && c.class===teachersClass))

        const classObj = school.classes[section].classes
        .find(clas => clas.class === teachersClass);

        const teachersName = classObj ? classObj.teachersName : undefined;
        const teachersTitle = classObj ? classObj.teachersTitle : undefined;

        req.school = school;
        req.section = section;
        req.class = teachersClass;
        req.teachersName = teachersName;
        req.teachersTitle = teachersTitle
        next()

    }catch (e) {
        res.status(400).send(e.message)
    }
}

export default teacherAuth;
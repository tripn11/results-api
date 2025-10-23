import bcrypt from "bcryptjs";



const ownerAuth = async (req, res, next) =>{
    try {        
        const token = req.header('Authorization').replace("Bearer ",'')
        const isOwner = await bcrypt.compare(token, process.env.PERSONAL_PASSWORD)
        if(!isOwner) {
            throw new Error('You are not authorized to access this route')
        }
        req.token = token;
        next()
    } catch (e){
        res.status(400).send(e.message)
    }   
}

export default ownerAuth;



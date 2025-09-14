import teacherAuth from "./teacherAuth.js";
import studentAuth from "./studentAuth.js";

const studentOrTeacherAuth = async (req, res, next) => {
  const role = req.header("Role");

  if (role === "teacher") {
    return teacherAuth(req, res, next);
  } else if (role === "student") {
    return studentAuth(req, res, next);
  } else {
    return res.status(400).send("Invalid role");
  }
};

export default studentOrTeacherAuth;
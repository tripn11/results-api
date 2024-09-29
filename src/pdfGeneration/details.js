export default async result => {
    await result.populate({
        path:'owner',
        options:{virtuals:true}
    })
    await result.owner.populate('school')
    const student = result.owner;
    const school = result.owner.school;
    const totalStudentsInClass = await student.totalStudentsInClass()
    const fullName = student.fullName;
    const age = student.age
    const schoolName = school.name.split(' ')[0]
    return{student,school,totalStudentsInClass,fullName,age,schoolName}
}
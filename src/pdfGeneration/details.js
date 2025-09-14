export default async (result,results) => {
    await result.populate({
        path:'owner',
        options:{virtuals:true}
    })
    await result.populate('school')

    //ca and total for each subject
    const totals = {};
    const totalsCalc = () => {
        const subjects = Object.keys(result.subjects)
            .filter(sub=> !Object.values(result.subjects[sub]).includes('-'));
        subjects.forEach(subject => {
           const ca = Object.values(result.subjects[subject]).slice(0,-1).reduce((total,score) => total + Number(score),0);
           const total = Object.values(result.subjects[subject]).reduce((total,score) => total + Number(score),0);

           totals[subject] = {ca, total};
        });
    }
    totalsCalc();

    const student = result.owner;
    const school = result.school;
    const schoolName = school.name.split(' ')[0]

    return{student,school,schoolName, totals, classResults:results} //returning classResults is essential for other exported functions 
}

//position based on ca
export const subjectPosition = (result, results) => {
    const subjects = Object.keys(result.subjects)
        .filter(sub=> !Object.values(result.subjects[sub]).includes('-'));
    const resultArrangement = {}
    subjects.forEach((subject => {
        resultArrangement[subject] = results.toSorted((a,b) => {
            const aCa = Object.values(a.subjects[subject])
                .slice(0,-1)
                .map(each=>Number(each))
                .reduce((total,val) => total+val,0)
            const bCa = Object.values(b.subjects[subject])
                .slice(0,-1)
                .map(each=>Number(each))
                .reduce((total,val) => total+val,0)
            return bCa-aCa;
        })
    }))
    return resultArrangement;
}

//class Average calculator
export const classAverage = results => {
    const total = results.reduce((total,result) => {
        const subjects = Object.keys(result.subjects)
            .filter(sub=> !Object.values(result.subjects[sub]).includes('-'));
        const studentTotal = subjects.reduce((studentTotal,subject) => {
            const subjectTotal = Object.values(result.subjects[subject])
                .map(each=>Number(each))
                .reduce((total,val) => total+val,0)
            return studentTotal + subjectTotal
        },0)
        return total + studentTotal
    },0)
    return (total / results.length).toFixed(1);
}

//subject class average calculator
export const subjectClassAverage = (result, results) => {
    const subjectAverage = {};
    const subjects = Object.keys(result.subjects)
            .filter(sub=> !Object.values(result.subjects[sub]).includes('-'));
    subjects.forEach(subject => {
        const subjectTotal = results.reduce((total, result) => {
            const individualTotal = Object.values(result.subjects[subject])
                .map(each => Number(each))
                .reduce((total, val) => total + val, 0);
            return total + individualTotal
        })
        subjectAverage[subject] = (subjectTotal / results.length).toFixed(1);
    })
    return subjectAverage;
}
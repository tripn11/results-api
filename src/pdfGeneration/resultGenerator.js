import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pdfGenerator = async (result) => {
    try {
        const browser = await puppeteer.launch({
            timeout:120000
        })
        console.log("opening new page")
        const page = await browser.newPage();
        console.log("page opened")

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, 'ca.html');
        let html = fs.readFileSync(filePath, 'utf8');
        await page.setContent(html);
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


        await page.evaluate(({ school, student, result, totalStudentsInClass, fullName, age }) => {
            // document.querySelector('header img').src = logoPath;
            document.getElementById('school-name').innerText = school.name;
            document.getElementById('school-address').innerText = school.address;
            document.getElementById('contact').innerText = school.phoneNumber;
            document.getElementById('email').innerText = school.email;
            document.querySelector('#session span').innerText = result.session;
            document.querySelector('#term span').innerText = result.term;
            document.querySelector('#name span').innerText = fullName;
            document.querySelector('#age span').innerText = age;
            document.querySelector('#sex span').innerText = student.sex;
            document.querySelector('#class span').innerText = student.class;
            document.querySelector('#classPop span').innerText = totalStudentsInClass;
            document.querySelector('#teachers-comment span').innerText = result.teachersComment;
            document.querySelector('#teachers-name span').innerText = result.teachersName;
            document.querySelector('#teachers-comment span').innerText = result.teachersComment;

            const tableHead = document.querySelector('thead tr')
            const tableBody = document.getElementById('results-table');
            const section = Object.keys(school.classes)
            .find(section => school.classes[section].classes
            .some(c=>c.class===student.class))
            const grading = school.classes[section].grading.map(each=>each.split("-")[0])
            const gradingScore = school.classes[section].grading.map(each=>each.split("-")[1])


            grading.forEach(each=>{
                if(each==='exam'){
                    console.log('')
                } else {
                    const newData = document.createElement('td');
                    newData.innerText=each
                    tableHead.appendChild(newData)
                }
            })

            const customData = document.createElement('td');
            const customData1 = document.createElement('td');
            const customData2 = document.createElement('td');
            customData.innerText='Total';
            customData1.innerText='Position';
            customData2.innerText='Remarks';
            tableHead.append(customData,customData1,customData2)

            const row = document.createElement('tr');

            for(i=0;i<grading.length;i++){
                let data1 = document.createElement('td')
                if(i===0) {
                    row.appendChild(data1)
                }else {
                    data1.innerText = gradingScore[i-1] + '%'
                    row.appendChild(data1)
                }
            }

            const total = gradingScore
            .map(score=>Number(score))
            .reduce((total,current)=> total+current)

            const data = document.createElement('td')
            data.innerText=total+'%'
            row.appendChild(data)
            tableBody.appendChild(row);



            const subjects=school.classes[section].subjects
            subjects.forEach(subject => {
                const row = document.createElement('tr');

                for(i=0; i < grading.length; i++){
                    let data = document.createElement('td');

                    if(i===0) {
                        data.innerText=subject
                        row.appendChild(data)
                    }else {
                        const subjectData=result.subjects[subject]
                        const field = [grading[i-1]]
                        data.innerText = subjectData[field]
                        row.appendChild(data); 
                    }
                }
                const totalData = document.createElement('td');
                const positionData = document.createElement('td');
                const remarkData = document.createElement('td');
                totalData.innerText=result.subjects[subject].caTotal
                positionData.innerText=result.subjects[subject].caPosition
                remarkData.innerText=result.subjects[subject].caRemark
                
                row.append(totalData,positionData,remarkData)
                
                tableBody.appendChild(row);
            });
            const totalRow = document.createElement('tr')
            const averageRow = document.createElement('tr')
            totalRow.innerHTML = '<td>Total</td><td>'+result.caOverallTotal+'</td>'
            averageRow.innerHTML = '<td>Average</td><td>'+result.caAverage+'</td>'
            tableBody.append(totalRow,averageRow)


        },{ school, student, result, totalStudentsInClass, fullName, age });

        const finalResult = await page.pdf({
        // await page.pdf({
            // path:"result.pdf",
            format: 'A4',
            printBackground: false
        });


        console.log('PDF generated successfully!');
        await browser.close();
        return finalResult
    } catch (e) {
        console.error(e.message);
    }
};

export {pdfGenerator}

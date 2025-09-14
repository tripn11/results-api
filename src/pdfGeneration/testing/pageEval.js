import { subjectPosition, classAverage, subjectClassAverage } from "../details";
import ordinal from "ordinal";

export default async (page, result, details, type) => {
  return await page.evaluate(({ result, details, type }) => {
    const byId = (id,text) => {
      const element = document.getElementById(id);
      if (element&&text!==undefined) element.innerText = text;
      return element;
    };
    const byQuery = (selector,text) => {
      const element = document.querySelector(selector);
      if (element&&text!==undefined) element.innerText = text;
      return element;
    };
    const createElement = (tag, text="") => {
      const element = document.createElement(tag);
      element.innerText = text;
      return element;
    };

    //the result values are used to maintain consistency in case the school has changed some details
    const grading = Object.keys(Object.values(result.subjects)[0]) 
    const subjects = Object.keys(result.subjects)
      .filter(sub=> !Object.values(result.subjects[sub]).includes('-'));
    const caScale = grading.slice(0,-1).reduce((total,score)=>total + Number(score.split('-')[1]),0)
    const total = Object.values(details.totals).reduce((total,each)=>total + each.total,0)
    const average = total/subjects.length

    //result details
    byId('school-name',details.school.name);
    byId('school-address',details.school.address);
    byId('contact',details.school.phoneNumber);
    byId('email',details.school.email);
    byQuery('#session span',result.session);
    byQuery('#term span',result.term);
    byQuery('#name span',details.student.fullName);
    byQuery('#age span',result.age);
    byQuery('#sex span',details.student.sex);
    byQuery('#class span',result.className);
    byQuery('#classPop span',result.population);
    byQuery('#average span',average);
    byQuery('#class-average span',classAverage(details.classResults));
    byQuery('#subjects-recorded span',subjects.length);
    byQuery('#teachers-comment span',result.teachersComment);
    byQuery('#principals-comment span',result.principalsComment);
    byQuery('#teachers-name span',result.teachersName);

    if(type==='ca'){
      //grading heading
      grading.forEach((each,i)=>{
        if(i < grading.length) {
          const row = byQuery("thead tr:first-child");
          const newData = createElement('th', each.split('-')[0]).toUpperCase();
          row.insertBefore(newData, row.querySelector("th:nth-last-child(3)"));
        }
      })

      //scale heading
      const scaleRow = byQuery("thead tr:last-child");
      grading.forEach(grade => {
        const scale = createElement('th', grade.split('-')[1] + '%');
        scaleRow.appendChild(scale);
      });
      scaleRow.appendChild(createElement('th', caScale + '%'));


      //actual result
      subjects.forEach(subject => {
        const row = createElement('tr');
        const remark = () => {
          const score = details.totals[subject].ca;
          if(score>=80) return 'DISTINCTION'
          if(score>=70) return 'EXCELLENT'
          if(score>=60) return 'VERY GOOD'
          if(score>=50) return 'GOOD'
          return 'WORKING ON SKILLS'
        }
        row.appendChild(createElement('td', subject.split('-')[0]).toUpperCase());
        grading.slice(0,-1).forEach(grade => { 
          row.appendChild(createElement('td', result.subjects[subject][grade]));
        });
        row.appendChild(createElement('td', details.totals[subject].ca))
        row.appendChild(createElement('td', ordinal(subjectPosition(result, details.classResults)[subject].indexOf(result)+1)))
        row.appendChild(createElement('td', remark()));
        byQuery('tbody').insertBefore(row, byQuery('tbody tr:nth-last-child(2)'))
      });
      const totalCa = Object.values(details.totals).reduce((total,each)=>total + each.ca,0);
      byQuery('tbody tr:nth-last-child(2) td:last-child',totalCa);
      byQuery('tbody tr:last-child td:last-child',(totalCa/subjects.length).toFixed(1));
    
    }else if (type==='term') {
      //attendance record 
      byQuery('#attendance-record tbody tr:first-child td:last-child', result.timesSchoolOpened);
      byQuery('#attendance-record tbody tr:nth-child(2) td:last-child', result.attendance);
      byQuery('#attendance-record tbody tr:nth-child(3) td:last-child', result.timesSchoolOpened - result.attendance);

      //result
      byQuery('#result thead tr:last-child').appendChild(createElement('th', caScale))
      byQuery('#result thead tr:last-child').appendChild(createElement('th', (100-caScale)))
      byQuery('#result thead tr:last-child').appendChild(createElement('th', 100))

      //actual results
      subjects.forEach(subject => {
        const row = createElement('tr');
        row.appendChild(createElement('td', subject.split('-')[0]).toUpperCase());
        row.appendChild(createElement('td', details.totals[subject].ca));
        row.appendChild(createElement('td', result.subjects[subject][grading.at(-1)]));
        row.appendChild(createElement('td', details.totals[subject].total));
        row.appendChild(createElement('td', subjectClassAverage(result, details.classResults)[subject]))
      })
      
      
 
    }
  )
}
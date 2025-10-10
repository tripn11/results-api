import { subjectPosition, classAverage, subjectClassAverage } from "../details.js";
import ordinal from "ordinal";

export default async (page, result, details, type) => {
  const actualClassAverage = classAverage(details.classResults);
  const actualSubjectClassAverage = subjectClassAverage(result, details.classResults);
  const actualSubjectPosition = subjectPosition(result, details.classResults);
  Object.keys(actualSubjectPosition).forEach(subject => {
    actualSubjectPosition[subject] = ordinal(actualSubjectPosition[subject].findIndex(res=>res._id.equals(result._id))+1);
  })
  const studentName = details.student.fullName; //for some reason, its not seen inside pageEval
 
  return await page.evaluate(({ result, details, type, actualSubjectPosition, actualClassAverage, actualSubjectClassAverage, studentName }) => {
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
    byQuery('#school-name',details.school.name);
    byQuery('#school-address',details.school.address);
    byQuery('#contact span',details.school.phoneNumber);
    byQuery('#email span',details.school.email);
    byQuery('#session span',result.session);
    byQuery('#term span',result.term);
    byQuery('#name span', studentName);
    byQuery('#age span',result.age);
    byQuery('#sex span',details.student.sex);
    byQuery('#class span',result.className);
    byQuery('#classPop span',result.population);
    byQuery('#average span',average);
    byQuery('#class-average span',actualClassAverage);
    byQuery('#subjects-recorded span',subjects.length);
    byQuery('#teachers-comment span',result.teachersComment);
    byQuery('#principals-comment span',result.principalsComment);
    byQuery('#teachers-name span',result.teachersTitle+ ' '+result.teachersName);

    if(type==='ca'){
      //grading heading
      grading.forEach((each,i)=>{
        if(i < grading.length-1) {
          const row = byQuery("thead tr:first-child");
          const newData = createElement('th', each.split('-')[0].toUpperCase());
          row.insertBefore(newData, row.querySelector("th:nth-last-child(3)"));
        }
      })

      //scale heading
      const scaleRow = byQuery("thead tr:last-child");
      grading.forEach((grade, index) => {
        if(index === grading.length -1) return;
        const scale = createElement('th', grade.split('-')[1] + '%');
        scaleRow.insertBefore(scale, scaleRow.querySelector('th:nth-last-child(2)'));
      });
      scaleRow.insertBefore(createElement('th', caScale + '%'), scaleRow.querySelector('th:nth-last-child(2)'));


      //actual result
      subjects.forEach(subject => {
        const row = createElement('tr');
        const remark = () => {
          const score = details.totals[subject].ca;
          if(score>=35) return 'DISTINCTION'
          if(score>=30) return 'EXCELLENT'
          if(score>=25) return 'V. GOOD'
          if(score>=20) return 'GOOD'
          return 'W.O.S'
        }
        row.appendChild(createElement('td', subject.split('-')[0].toUpperCase()));
        grading.slice(0,-1).forEach(grade => { 
          row.appendChild(createElement('td', result.subjects[subject][grade]));
        });
        row.appendChild(createElement('td', details.totals[subject].ca))
        row.appendChild(createElement('td', actualSubjectPosition[subject]))
        row.appendChild(createElement('td', remark()));
        byQuery('tbody').insertBefore(row, byQuery('tbody tr:nth-last-child(2)'))
      });
      const totalCa = Object.values(details.totals).reduce((total,each)=>total + each.ca,0);
      byQuery('tbody tr:nth-last-child(2) td:last-child',totalCa);
      byQuery('tbody tr:last-child td:last-child',(totalCa/subjects.length).toFixed(1));
    
    }else if (type==='term') {
      //attendance record 
      byQuery('#attendance-record tbody tr:first-child td:last-child', result.timesSchoolOpened || 0);
      byQuery('#attendance-record tbody tr:nth-child(2) td:last-child', result.attendance || 0);
      byQuery('#attendance-record tbody tr:nth-child(3) td:last-child', result.timesSchoolOpened - result.attendance);

      //result
      const scaleRow = byQuery('#result thead tr:last-child');
      const lastChild = scaleRow.querySelector("th:last-child");
      scaleRow.insertBefore(createElement('th', caScale), lastChild)
      scaleRow.insertBefore(createElement('th', (100-caScale)), lastChild)
      scaleRow.insertBefore(createElement('th', 100), lastChild)

      //actual results
      subjects.forEach(subject => {
        const row = createElement('tr');
        const evaluation = score => {
          if(score>=80) return {grade:'A', remark:'DISTINCTION'}
          if(score>=70) return {grade:'B', remark:'EXCELLENT'}
          if(score>=60) return {grade:'C', remark:'V. GOOD'}
          if(score>=50) return {grade:'D', remark:'GOOD'}
          if(score>=40) return {grade:'E', remark:'W.O.S'}
          return {grade:'F', remark:'W.O.S'}
        }
        const {grade, remark} = evaluation(details.totals[subject].total);
        row.appendChild(createElement('td', subject.split('-')[0].toUpperCase()));
        row.appendChild(createElement('td', details.totals[subject].ca));
        row.appendChild(createElement('td', result.subjects[subject][grading.at(-1)]));
        row.appendChild(createElement('td', details.totals[subject].total));
        row.appendChild(createElement('td', actualSubjectClassAverage[subject]))
        row.appendChild(createElement('td', grade));
        row.appendChild(createElement('td', remark));
        byQuery('#result tbody').appendChild(row);
      })
      const row = createElement('tr');
      row.appendChild(createElement('td'));
      const cellTotal = createElement('td', 'TOTAL');
      cellTotal.colSpan=2;
      row.appendChild(cellTotal)
      row.appendChild(createElement('td', Object.values(details.totals).reduce((total,each)=>total + each.total,0)))
      byQuery('#result tbody').appendChild(row);
    }
  }, { result, details, type, actualSubjectPosition, actualClassAverage, actualSubjectClassAverage, studentName });
}
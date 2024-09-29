export default async (page, result, details, type) => {
  return await page.evaluate(({ result, details, type }) => {
    const title = type === 'ca' ? 'continuous assessment result' : 'end of term report';
    const tableHeadRow = document.querySelector('thead tr');
    const tableHead = document.querySelector('thead');
    const tableBody = document.getElementById('results-table');
    const section = Object.keys(details.school.classes)
      .find(section => details.school.classes[section].classes
      .some(c => c.class === details.student.class));
    const grading = details.school.classes[section].grading.map(each => each.split("-")[0]);
    const gradingScore = details.school.classes[section].grading.map(each => each.split("-")[1]);
    const row1 = document.createElement('tr');
    const th = document.createElement('th');
    const subjects = details.school.classes[section].subjects;


    //result details
    document.getElementById('school-name').innerText = details.school.name;
    document.getElementById('school-address').innerText = details.school.address;
    document.getElementById('contact').innerText = details.school.phoneNumber;
    document.getElementById('email').innerText = details.school.email;
    document.getElementById('title').innerText = title;
    document.querySelector('#session span').innerText = result.session;
    document.querySelector('#term span').innerText = result.term;
    document.querySelector('#name span').innerText = details.fullName;
    document.querySelector('#age span').innerText = details.age;
    document.querySelector('#sex span').innerText = details.student.sex;
    document.querySelector('#class span').innerText = details.student.class;
    document.querySelector('#classPop span').innerText = details.totalStudentsInClass;
    document.querySelector('#average span').innerText = result.average;
    document.querySelector('#teachers-comment span').innerText = result.teachersComment;
    document.querySelector('#teachers-name span').innerText = result.teachersName;
  

      
    if(type==='ca'){
      const customData = document.createElement('th');
      const customData1 = document.createElement('th');
      const customData2 = document.createElement('th');
      const caScores = gradingScore.slice(0,-1)
      const caScoresNum = caScores.map(score=>Number(score))
      const totalCa = caScoresNum.reduce((total,score)=>total + score)
      const totalRow = document.createElement('tr');
      const averageRow = document.createElement('tr');


      //table heading
      grading.forEach((each,i)=>{
        if(i<grading.length-1) {
          const newData = document.createElement('th');
          newData.innerText = each;
          tableHeadRow.appendChild(newData);
        }
      })
      customData.innerText = 'Total';
      customData1.innerText = 'Position';
      customData2.innerText = 'Remark';
      tableHeadRow.append(customData, customData1, customData2);


      //grading heading
      row1.appendChild(th)
      gradingScore.forEach((score,i) => {
        const data = document.createElement('th');
        if(i<gradingScore.length-1){
          data.innerText = score + '%';
          row1.appendChild(data)
        }else if(i===gradingScore.length-1){
          data.innerText = totalCa+'%';
          row1.appendChild(data)
        }
      });
      tableHead.appendChild(row1)


      //actual result
      subjects.forEach(subject => {
        const row = document.createElement('tr');
        const totalData = document.createElement('td');
        const positionData = document.createElement('td');
        const remarkData = document.createElement('td');
        grading.forEach((_, i) => {
          const data = document.createElement('td');
          if (i === 0) {
            data.innerText = subject;
          } else {
            const subjectData = result.subjects[subject];
            const field = grading[i - 1];
            data.innerText = subjectData[field];
          }
          row.appendChild(data);
        });
        totalData.innerText = result.subjects[subject].caTotal;
        positionData.innerText = result.subjects[subject].caPosition;
        remarkData.innerText = result.subjects[subject].caRemark;
        row.append(totalData, positionData, remarkData);
        tableBody.appendChild(row); 
        totalRow.innerHTML = '<td>Total</td><td>' + result.caTotal + '</td>';
        averageRow.innerHTML = '<td>Average</td><td>' + result.caAverage + '</td>';
        tableBody.append(totalRow, averageRow);
      })  
           
    }else if(type==='term') {
      const customData = document.createElement('th')
      const customData1 = document.createElement('th')
      const customData2 = document.createElement('th')
      const customData3 = document.createElement('th')
      const customData4 = document.createElement('th')
      const customData5 = document.createElement('th')
      const totalRow = document.createElement('tr');



      //table heading
      document.getElementById('table-title').innerHTML='<tr><th>academic report</th></tr>'
      customData.innerText = 'ca'
      customData1.innerText = 'exam'
      customData2.innerText = 'total'
      customData3.innerText = 'class average'
      customData4.innerText = 'grade'
      customData5.innerText = 'remark'
      tableHeadRow.append(customData, customData1, customData2,customData3,customData4, customData5);



      //grading heading
      row1.appendChild(th)
      for(i=0;i<3;i++){
        const data = document.createElement('th');
        let score;
        switch(i) {
          case 0: 
            score = 100 - Number(gradingScore[gradingScore.length-1])
            break
          case 1:
            score = gradingScore[gradingScore.length-1]
            break
          case 2:
            score = 100
        }
        data.innerText=score+'%';
        row1.appendChild(data)
      }
      tableHead.appendChild(row1)



      //for the actual result 
      subjects.forEach(subject=>{
        const row = document.createElement('tr');
        for(i=1;i<8;i++){
          const data = document.createElement('td')
          switch(i) {
            case 1:
              data.innerText = subject;
              break;
            case 2:
              data.innerText = result.subjects[subject].caTotal
              break
            case 3:
              data.innerText = result.subjects[subject].exam
              break
            case 4:
              data.innerText = result.subjects[subject].total
              break
            case 5:
              data.innerText = result.subjects[subject].classAverage
              break
            case 6:
              data.innerText = result.subjects[subject].grade
              break
            case 7:
              data.innerText = result.subjects[subject].remark
          }
          row.appendChild(data);
        }
        tableBody.appendChild(row); 
      })
      totalRow.innerHTML = '<td></td><td>Total</td><td>' + result.total + '</td>';
      tableBody.appendChild(totalRow); 
    }
  }, { result, details, type });
} 
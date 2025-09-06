export default async (page, result, details, type) => {
  return await page.evaluate(({ result, details, type }) => {

    const title = type === 'ca' ? 'continuous assessment result' : 'end of term report';
    const tableHeadRow = document.querySelector('thead tr');
    const tableHead = document.querySelector('thead');
    const tableBody = document.getElementById('results-table');
    const section = Object.keys(details.school.classes)
      .find(section => details.school.classes[section].classes
      .some(c => c.class === details.student.class));
    const grading = details.school.classes[section].grading;
    const row1 = document.createElement('tr');
    const th = document.createElement('th');
    const subjects = details.school.classes[section].subjects;
    const caScores = grading.map(score=>Number(score.split('-')[1]))
    const totalCa = caScores.reduce((total,score)=>total + score,0)

    //result details
    document.getElementById('school-name').innerText = details.school.name;
    document.getElementById('school-address').innerText = details.school.address;
    document.getElementById('contact').innerText = details.school.phoneNumber;
    document.getElementById('email').innerText = details.school.email;
    document.getElementById('title').innerText = title;
    document.querySelector('#session span').innerText = result.session;
    document.querySelector('#term span').innerText = result.term;
    document.querySelector('#name span').innerText = details.student.fullName;
    document.querySelector('#age span').innerText = result.age;
    document.querySelector('#sex span').innerText = details.student.sex;
    document.querySelector('#class span').innerText = result.className;
    document.querySelector('#classPop span').innerText = result.population;
    document.querySelector('#average span').innerText = result.average;
    document.querySelector('#teachers-comment span').innerText = result.teachersComment;
    document.querySelector('#principals-comment span').innerText = result.principalsComment;
    document.querySelector('#teachers-name span').innerText = result.teachersName;
  

      
    if(type==='ca'){
      const customData = document.createElement('th');
      const customData1 = document.createElement('th');
      const customData2 = document.createElement('th');
      const totalRow = document.createElement('tr');
      const averageRow = document.createElement('tr');


      //table heading
      grading.forEach((each,i)=>{
        if(i<grading.length-1) {
          const newData = document.createElement('th');
          newData.innerText = each.split('-')[0];
          tableHeadRow.appendChild(newData);
        }
      })
      customData.innerText = 'Total';
      customData1.innerText = 'Position';
      customData2.innerText = 'Remark';
      tableHeadRow.append(customData, customData1, customData2);


      //grading heading
      row1.appendChild(th)
      grading.forEach((grade,i) => {
        const data = document.createElement('th');
        if(i<grading.length-1){
          data.innerText = grade.split('-')[1] + '%';
          row1.appendChild(data)
        }else if(i===grading.length){
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
            data.innerText = subject.split('-')[0];
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
            score = totalCa
            break
          case 1:
            score = 100-totalCa
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
              data.innerText = subject.split('-')[0];
              break;
            case 2:
              data.innerText = Object.values(result.subjects[subject])
              .slice(0,-1).reduce((total,score)=>total + Number(score),0)
              break
            case 3:
              data.innerText = result.subjects[subject][grading[grading.length-1]]
              break
            case 4:
              data.innerText = Object.values(result.subjects[subject])
              .reduce((total,score)=>total + Number(score),0)
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
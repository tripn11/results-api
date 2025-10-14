export default async (page, result, details, type) => {
    const studentName = details.student.fullName;

  
    return await page.evaluate(({studentName,result}) => {
        const byQuery = (selector,text) => {
            const element = document.querySelector(selector);
            if (element&&text!==undefined) element.innerText = text;
            return element;
        };

        byQuery(".student-name > td:last-child", studentName)
        
        const rows = document.querySelectorAll(".performance-table tbody tr")
        const scores = Object.values(Object.values(result.subjects)[0])
        const total = scores.reduce((total, score) => total + Number(score), 0)

        rows.forEach((row,index) => {
            const lastCell = row.querySelector("td:last-child");
            lastCell.textContent = scores[index] ?? "";
        })

        byQuery(".total span", total)
    },{studentName, result})
}
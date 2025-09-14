import launchBrowser from './launchBrowser.js';
import detailsCompiler from './details.js';
import pageCreator from './pageCreator.js';
import pageEval from './testing/pageEval.js';
import { Result } from "../models/resultModel.js";


const resultGenerator = async (results,type) => {
    try {
        const browser = await launchBrowser()
        const pdfResults = []
        const classResults = results.length===1 ? 
        await Result.find({ 
            school: results[0].school,
            className: results[0].className,
            session: results[0].session,
            term: results[0].term
        }) : results
        
        await Promise.all(results.map(async result=>{             
            const details = await detailsCompiler(result, classResults)
            const page = await pageCreator(browser, details.schoolName, type)
            await pageEval(page,result,details,type)
            const finalResult = await page.pdf({
                format: 'A4',
                printBackground: false
            });
            pdfResults.push({name:details.student.name.firstName+'.pdf',file:finalResult})
        }))

        console.log('PDF generated successfully!');
        await browser.close();
        return pdfResults
    } catch (e) {
        console.error(e.message);
    }
};

export {resultGenerator}

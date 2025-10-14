import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import launchBrowser from './launchBrowser.js';
import detailsCompiler from './details.js';
import pageCreator from './pageCreator.js';
import styler from './styler.js';
import { Result } from "../models/result.js";


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

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const pageEvalPath = path.join(__dirname, details.schoolName, 'pageEval.js');
            const pageEvalUrl = pathToFileURL(pageEvalPath).href;
            const { default: pageEval } = await import(pageEvalUrl);

            await pageEval(page,result,details,type)
            await styler(page, details.schoolName, type)
            const finalResult = await page.pdf({
                format: 'A4',
                printBackground: true,
            });
            pdfResults.push({name:details.student.name.firstName+'.pdf',file:finalResult})
        }))

        console.log('PDF generated successfully!');
        await browser.close();
        return pdfResults
    } catch (e) {
        throw e;
    }
};

export {resultGenerator}

import launchBrowser from './launchBrowser.js';
import detailsCompiler from './details.js';
import pageCreator from './pageCreator.js';
import pageEval from './bloomfields/pageEval.js';

const pdfGenerator = async (results,type) => {
    try {
        const browser = await launchBrowser()
        const pdfResults = []
        
        await Promise.all(results.map(async result=>{             
            const details = await detailsCompiler(result)
            const page = await pageCreator(browser, details.schoolName)
            await pageEval(page,result,details,type)
            const finalResult = await page.pdf({
            // await page.pdf({
            //     path:details.student.name.firstName+'.pdf',
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

export {pdfGenerator}

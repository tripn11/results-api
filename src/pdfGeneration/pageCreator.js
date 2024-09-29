import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async (browser,schoolName)=>{
    console.log("opening new page")
    const page = await browser.newPage();
    console.log("page opened")
            
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '/'+schoolName+'/template.html');
    let html = fs.readFileSync(filePath, 'utf8');
    await page.setContent(html);
    return page
}
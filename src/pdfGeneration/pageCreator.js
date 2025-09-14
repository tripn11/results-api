import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async (browser,schoolName, type)=>{
    console.log("opening new page")
    const page = await browser.newPage();
    const file = type === 'ca' ? 'caTemplate.html' : 'template.html';
    console.log("page opened")
            
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, schoolName, file);
    let html = fs.readFileSync(filePath, 'utf8');
    await page.setContent(html);
    return page
}
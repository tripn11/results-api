import fs from 'fs';
import path from 'path';
import { fileURLToPath} from 'url';

export default async (browser,schoolName, type)=>{
    console.log("opening new page")
    const page = await browser.newPage();
    const file = type === 'ca' ? 'caTemplate.html' : 'template.html';
    console.log("page opened")
            
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, schoolName, file);
    let html = fs.readFileSync(filePath, 'utf8');
    const logoPath = path.join(__dirname, schoolName, 'logo.jpg');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;
    html = html.replace(/<img(?![^>]*\ssrc=)(\s[^>]*)?>/gi, `<img src="${logoDataUri}">`);
    await page.setContent(html);
    return page
}
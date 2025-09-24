import path from 'path';
import { fileURLToPath } from 'url';

export default async (page, schoolName, type) => {
    const file = type === 'ca' ? 'caTemplate.css' : 'template.css';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const cssPath = path.join(__dirname, schoolName, file);

    await page.addStyleTag({path:cssPath})
}
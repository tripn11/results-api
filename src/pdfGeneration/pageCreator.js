import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async (browser, schoolName, type) => {
  console.log("opening new page");
  const page = await browser.newPage();
  const file = type === 'ca' ? 'caTemplate.html' : 'template.html';
  console.log("page opened");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, schoolName, file);

  let html = fs.readFileSync(filePath, 'utf8');

  // ✅ Try both .jpg and .png logos
  const extensions = ['jpg', 'png'];
  const logoDir = path.join(__dirname, schoolName);
  const logoFile = extensions
    .map(ext => path.join(logoDir, `logo.${ext}`))
    .find(filePath => fs.existsSync(filePath));

  if (logoFile) {
    const logoBuffer = fs.readFileSync(logoFile);
    const ext = path.extname(logoFile).slice(1); // e.g., 'jpg' or 'png'
    const logoBase64 = logoBuffer.toString('base64');
    const logoDataUri = `data:image/${ext};base64,${logoBase64}`;
    html = html.replace(/<img(?![^>]*\ssrc=)(\s[^>]*)?>/gi, `<img src="${logoDataUri}">`);
  } else {
    console.warn(`⚠️ No logo found for ${schoolName}`);
  }

  await page.setContent(html);
  return page;
};

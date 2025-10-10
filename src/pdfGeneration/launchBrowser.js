import puppeteer from "puppeteer";

export default async () => {
  let executablePath;

  // Detect if running on Render or another Linux host
  if (process.env.RENDER || process.env.CHROME_PATH) {
    executablePath = "/usr/bin/chromium";
  } else {
    // Local dev: let Puppeteer use its bundled Chromium
    executablePath = puppeteer.executablePath();
  }

  const browser = await puppeteer.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    timeout: 120000,
  });

  return browser;
};

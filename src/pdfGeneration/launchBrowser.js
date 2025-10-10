import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export default async () => {
  const browser = await puppeteer.launch({
    // These args are recommended for cloud environments
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    
    // This is the crucial part: get the path from the chromium package
    executablePath: await chromium.executablePath(),

    // Use the headless mode from the chromium package
    headless: chromium.headless,

    // Other options
    ignoreHTTPSErrors: true,
    timeout: 60000,
  });

  return browser;
};

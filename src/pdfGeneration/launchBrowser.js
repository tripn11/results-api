import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer';

const launchBrowser = async () => {
  let browser;

  if (process.env.NODE_ENV === 'production') {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      timeout: 60000,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      timeout: 60000,
    });
  }

  return browser;
};

export default launchBrowser;
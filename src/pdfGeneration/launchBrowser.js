import puppeteer from 'puppeteer';

export default  async () => {
    const browser = await puppeteer.launch({
        timeout:120000
    })
    return browser
}
const puppeteer = require('puppeteer')

module.exports = async (url, filename) => {
  console.log('PDF生成中...')

  // 启动一个浏览器实例
  const browser = await puppeteer.launch({
    headless: true,
    // timeout: 10 * 60 * 1000,
    // devtools: true,
    // 视窗宽高
    defaultViewport: {
      width: 1200,
      height: 800
    },
    // 关闭沙盒模式，否则在linux服务器中会报错
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  // 打开一个新页面
  // const page = await browser.newPage()
  // await page.goto('http://iot-test.sunac.com.cn/#/auth/login', {
  //   waitUntil: 'networkidle0'
  // })
  // // 登录
  // const accountElement = await page.$('#account')
  // if (accountElement) {
  //   await accountElement.type('15611111183')
  // }
  // const passwordElement = await page.$('#password')
  // if (passwordElement) {
  //   await passwordElement.type('Test1234')
  // }
  // const loginElement = await page.$('button[type=submit]')
  // if (loginElement) {
  //   await loginElement.click()
  // }

  const page2 = await browser.newPage()
  // page2.on('domcontentloaded', async () => {
  //   console.log('domcontentloaded')
  // })
  // page2.on('load', async () => {
  //   console.log('load')
  // })
  await page2.goto(url, {
    waitUntil: 'networkidle0'
  })
  // const kwElement = await page2.$('#kw')
  // if (kwElement) {
  //   await kwElement.type('谷歌搜索比百度搜索牛逼')
  // }
  // const submitElement = await page2.$('input[type=submit]')
  // if (submitElement) {
  //   await submitElement.click()
  // }

  // pdf页眉
  const headerTemplate = `
        <div style="width:100%;font-size:8px;border-bottom:1px solid #ddd;padding:10px 20px;display: flex; justify-content: space-between;">
          <span class="title"></span>
          <span class="date"></span>
        </div>
      `
  // pdf页脚
  const footerTemplate = `
      <div style="width:100%;font-size:8px;border-top:1px solid #ddd;padding:10px 20px;display: flex; justify-content: space-between; ">
        <span class="url"></span>
        <div><span class="pageNumber"></span> / <span class="totalPages"></span></div>
      </div>
    `
  /***********************************
   * 1、pdf分页是由页面html元素或body元素的高度与pdf页面的高度决定
   * 2、下载的pdf无法加载页面中的懒加载图片
   * 3、适合下载数据已完全加载完毕的页面
   ***********************************/
  const pdfBuffer = await page2.pdf({
    path: `./${filename}.pdf`,
    displayHeaderFooter: false,
    headerTemplate,
    footerTemplate,
    // margin: {
    //   top: 80,
    //   bottom: 80
    // },
    printBackground: true,
    '-webkit-print-color-adjust': 'exact',  // 强制渲染精确的颜色
    // landscape: true,
    // format: 'A4',
    height: 1000,  // pdf页面高度
  })
  await browser.close()

  console.log('PDF已生成')
  return pdfBuffer
}

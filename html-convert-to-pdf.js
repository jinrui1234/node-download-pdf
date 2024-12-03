const puppeteer = require("puppeteer");

module.exports = async (url) => {
  console.log("PDF生成中...");

  // 启动一个浏览器实例
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle0",
    // timeout: 2000,
  });

  const headerTemplate = `<div style="width:calc(100% - 28px)"></div>`;
  const footerTemplate = `
      <div style="width:calc(100% - 28px);margin-bottom:-20px;font-size:8px;padding:15px 14px;display:flex;justify-content:center">
        <span style="color:#9a7ff7;font-size:13px;" class="pageNumber"></span>
      </div>
    `;

  const pdfBuffer = await page.pdf({
    headerTemplate,
    footerTemplate,
    scale: 1,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "1mm",
      right: "1mm",
    },
    landscape: false,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    timeout: 60000,
  });

  // const fileName = `${Date.now()}.pdf`;
  // require("fs").writeFileSync(fileName, pdfBuffer);

  await browser.close();

  console.log("PDF已生成");
  return pdfBuffer;
};

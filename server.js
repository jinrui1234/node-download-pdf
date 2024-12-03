const express = require("express");

const app = express();
const htmlConvertToPdf = require("./html-convert-to-pdf");

const port = 8071;
app.listen(port, () => {
  console.log(`服务器已启动：http://localhost:${port}`);
});

app.all("*", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length,Authorization,Accept,X-Requested-With"
  );
  res.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});

// 解析application/json格式
app.use(express.json());
// 解析application/x-www-form-urlencoded格式
app.use(express.urlencoded({ extended: true }));

app.post("/download-pdf", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    res.status(404).json({
      code: 404001,
      msg: "url传参不能为空",
    });
  } else {
    const pdfBuffer = await htmlConvertToPdf(url);
    res.send(pdfBuffer);
  }
});

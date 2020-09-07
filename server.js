// const http = require('http')
// const url = require('url')

// http.createServer((req, res) => {
//   const reqUrl = new url.URL(req.url, `http://${req.headers.host}`)
//   console.log(reqUrl)
//   console.log(req.method)

//   res.setHeader('Content-Type', 'text/html;charset=UTF-8')
//   res.write('访问成功')
//   res.end()
// }).listen(8888, () => {
//   console.log('服务已启动：http://localhost:8888')
// })

const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()
const htmlConvertToPdf = require('./html-convert-to-pdf')
const port = 8888

app.listen(port, () => {
  console.log(`服务器已启动：http://localhost:${port}`)
})

app.all('*', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With')
  res.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  next()
})
// 解析application/json格式
app.use(express.json())
// 解析application/x-www-form-urlencoded格式
app.use(express.urlencoded({ extended: true }))

app.post('/download-pdf', async (req, res) => {
  const { url, fileName } = req.body
  
  if (!url) {
    res.status(404).json({
      code: 404001,
      msg: 'url传参不能为空'
    })
  } else {
    const name = fileName || 'temp'
    const filePath = path.join(__dirname, `./${name}.pdf`)
    const pdfBuffer = await htmlConvertToPdf(url, name)

    // 以下两种方式前端获取的响应内容一致
    // 第一种方式：将生成的pdf buffer传给前端
    res.send(pdfBuffer)
    fs.unlink(filePath, (error) => {
      if (!error) {
        console.log('PDF文件已删除')
      }
    })
    // 第二种方式：将生成的pdf文件传给前端
    // res.sendFile(filePath, () => {
    //   fs.unlink(filePath, (error) => {
    //     if (!error) {
    //       console.log('PDF文件已删除')
    //     }
    //   })
    // })


    // --------------- 前端实现逻辑 begin -----------------------

    // const res = await axios
    //   .create({
    //     baseURL: `http://localhost:8888/`,
    //     responseType: 'blob',
    //   })
    //   .post('download-pdf', params)

    // const blob = new Blob([res.data], { type: 'application/pdf' })
    // const a = document.createElement('a')
    // a.href = URL.createObjectURL(blob)
    // a.download = params.fileName || 'temp.pdf'
    // document.body.appendChild(a)
    // a.click()
    // document.body.removeChild(a)

    // --------------- 前端实现逻辑 end -----------------------
  }
})

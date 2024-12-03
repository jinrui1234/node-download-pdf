# node-download-pdf

基于 Puppeteer 实现页面转 PDF 下载

# git 地址：https://github.com/xueyongwu/node-download-pdf

## 解决思路

搭建 node 服务，使用`Puppeteer`生成页面 PDF 的能力来实现

## 技术选型

- `nodejs v14.5.0`
- `express v4.17.1`
- `pupperteer v4.0.1`

## 实现流程

### 使用 `Puppeteer` 生成页面 PDF

#### 启动一个浏览器实例

```
const puppeteer = require('puppeteer')
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
```

#### 打开一个新的页面

```
const page = await browser.newPage()
await page.goto(url, {
    waitUntil: 'networkidle0'
})
```

#### 将页面生成 PDF

```
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
* 1、pdf分页是由页面body元素的高度与pdf页面的高度决定
* 2、下载的pdf无法加载页面中的懒加载图片
* 3、适合下载数据已完全加载完毕的页面
***********************************/
const pdfBuffer = await page.pdf({
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
```

### 基于 `express` 搭建 node 服务

#### 启动一个服务

```
const express = require('express')
const app = express()

app.listen(port, () => {
  console.log(`服务器已启动：http://localhost:${port}`)
})
```

#### 解决跨域问题

```
app.all('*', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With')
  res.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  next()
})
```

#### 解析请求内容格式

```
// 解析application/json格式
app.use(express.json())
// 解析application/x-www-form-urlencoded格式
app.use(express.urlencoded({ extended: true }))
```

#### 监听接口请求

```
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

  }
})
```

#### 前端实现逻辑

```
const res = await axios
  .create({
    baseURL: `http://localhost:8888/`,
    responseType: 'blob',
  })
  .post('download-pdf', params)

const blob = new Blob([res.data], { type: 'application/pdf' })
const a = document.createElement('a')
a.href = URL.createObjectURL(blob)
a.download = params.fileName || 'temp.pdf'
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
```

### node 服务部署

#### 安装 nodejs

##### apt 安装最新版 nodejs

1. 请求 nodejs14.x 版本

```
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
```

2. 安装 nodejs
   > 安装 nodejs 的同时，也安装了 npm，并自动配好环境变量

```
apt install nodejs
```

##### 二进制安装最新版 nodejs

1. 下载二进制文件
   > 上 nodejs 官网查找最新版二进制文件下载地址

```
wget https://npm.taobao.org/mirrors/node/v14.5.0/node-v14.5.0-linux-x64.tar.xz
```

2. 解压

```
tar -xvf node-v14.5.0-linux-x64.tar.xz
```

3. 配置环境变量

配置 node 环境变量

```
ln -s /root/node-v14.5.0-linux-x64/bin/node /usr/local/bin/node
```

配置 npm 环境变量

```
ln -s /root/node-v14.5.0-linux-x64/bin/npm /usr/local/bin/npm
```

#### 上传源码并安装依赖

_此处省略_

#### 启动服务

##### 安装进程管理工具 pm2

[pm2 工具的使用](https://note.youdao.com/web/#/file/WEB2dc8842057495fe347f638cbbb448c08/markdown/WEB1267114a03ecefa0edb44707c53c9531/)

##### ECS 管理台配置可访问端口

[端口配置说明](https://help.aliyun.com/document_detail/25471.html?spm=a2c4e.11153940.0.0.465214c3Bq7WdM&source=5176.11533457&userCode=r3yteowb&type=copy)

### linux 使用 puppeteer 存在的问题

- 依赖问题：使用 `puppeteer` 需要同时安装以下依赖

```
apt install gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

- 沙箱问题：`puppeteer.launch` 方法传参配置 `args: ['--no-sandbox', '--disable-setuid-sandbox']`
- 超时问题：`puppeteer.launch` 方法传参配置 `timeout` 参数

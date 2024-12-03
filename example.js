// 使用示例
const downloadClick = async () => {
  const url = router.resolve({
    name: "Pdf",
    query: {
      pdfConfig: JSON.stringify(reportRef.value?.dataMap),
    },
  });
  try {
    const param = {
      url: getHost() + url.href,
      fileName: dataMap.keyWord,
    };
    const res = await pdfDownloadAjax(param);
    if (res?.status === 200) {
      const blob = new Blob([res.data], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = param.fileName || new Date().getTime();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error(error);
  }
};

const pdfDownloadAjax = (param) => {
  return axios({
    method: "post",
    // url: 'http://localhost:8071/download-pdf',
    url: "http://47.103.197.242:8071/download-pdf",
    responseType: "blob",
    data: param,
  });
};

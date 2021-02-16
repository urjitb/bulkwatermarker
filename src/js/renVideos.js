const electron = require('electron')
const { ipcRenderer } = electron

var outfolder = document.getElementById("selectOutputDir");
outfolder.onclick = () => {
  var wmLocation = $("input[name='group1']:checked").val();
  ipcRenderer.send('outputDirectory:button', wmLocation, "videos");
}


var infolder = document.getElementById("selectInputDir");
infolder.onclick = () => {

  ipcRenderer.send('inputDirectory:button', "videos");
}

var watermark = document.getElementById("selectWmImg");
watermark.onclick = () => {

  ipcRenderer.send('inputImg:button');
}

ipcRenderer.on('asynchronous-message',(e,data)=>{
  M.toast(data)
});

$(document).ready(function () {
  $("input[type='radio']").click(function () {
    var radioValue = $("input[name='group1']:checked").val();
    if (radioValue) {

      M.toast({ html: 'Watermark Location: ' + radioValue })

    }
  });
});
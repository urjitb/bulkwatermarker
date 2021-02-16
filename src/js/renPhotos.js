const electron = require('electron')
const { ipcRenderer } = electron

var outfolder = document.getElementById("selectOutputDir");
outfolder.onclick = () => {
  var wmLocation = $("input[name='group1']:checked").val();
  ipcRenderer.send('outputDirectory:button', wmLocation, "photos");
}

var infolder = document.getElementById("selectInputDir");
infolder.onclick = () => {

  ipcRenderer.send('inputDirectory:button');
}

var watermark = document.getElementById("selectWmImg");
watermark.onclick = () => {

  ipcRenderer.send('inputImg:button');
}

$(document).ready(function () {
  $("input[type='radio']").click(function () {
    var radioValue = $("input[name='group1']:checked").val();
    if (radioValue) {

      M.toast({ html: 'Watermark Location: ' + radioValue })

    }
  });
});
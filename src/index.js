const { app, BrowserWindow, ipcMain, dialog, webContents } = require('electron');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp')
const ffbinaries = require('ffbinaries');
const ffmpeg = require('fluent-ffmpeg')

let mainWindow;

ffbinaries.downloadBinaries(function () {
  console.log('Downloaded all ffmpeg binaries for current platform.');
});


if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'video-edit.html'));

};

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let outputDir = __dirname

let watermarkImg = ''
let mediaContainer = []
var mediaExtensions = {
  "photos": /\.(jpe?g|png|bmp)$/i,
  "videos": /\.(mp4|avi|flv|gif|ogg|webm)$/i
}
const locationOverlay = {
  "top-right": "-filter_complex overlay=main_w-overlay_w-5:5",
  "top-left": "-filter_complex overlay=5:5",
  "center": "-filter_complex overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2",
  "bottom-right": "-filter_complex overlay=main_w-overlay_w-5:main_h-overlay_h-5",
  "bottom-left": "-filter_complex overlay=5:main_h-overlay_h",
}

function watermarkProcess(folderPath, wmLocation, mediaType) {
  console.log("in watermarkProcess " + mediaType)
  console.log(mediaContainer)
  mediaContainer.forEach(file => {
    //console.log(file)
    //console.log(file + " processed with -> " + wmLocation + watermarkImg + folderPath[0]);
    //console.log(watermarkImg)
    //console.log(folderPath[0] + '/' + path.basename(file))
    if (mediaType === "videos") {
      console.log("Matched-----")
      ffmpeg()
        .input(file)
        .input(watermarkImg[0])
        .addOption(locationOverlay[wmLocation])
        .output(folderPath[0] + '/' + path.basename(file))
        .on("start", function (commandLine) {
          mainWindow.webContents.send('asynchronous-message', { html: 'Started processing ' + path.basename(file) });

          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on("end", function (commandLine) {
          mainWindow.webContents.send('asynchronous-message', { html: 'Finished processing ' + path.basename(file) });

          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .run()
    }
    else {
      console.log(watermarkImg)
      const main = async () => {
        const [image, logo] = await Promise.all([
          Jimp.read(file),
          Jimp.read(watermarkImg[0])
        ]);

        logo.resize(image.bitmap.width / 10, Jimp.AUTO);

        const locations = {
          "top-left": { x: 5, y: 5 },
          "top-right": { x: (image.bitmap.width - 5) - logo.bitmap.width, y: 5 },
          "center": { x: (image.bitmap.width / 2) - (logo.bitmap.width / 2), y: (image.bitmap.height / 2) - (logo.bitmap.height / 2) },
          "bottom-left": { x: 5, y: image.bitmap.width - 5 },
          "bottom-right": { x: (image.bitmap.width - 5) - logo.bitmap.width, y: (image.bitmap.height - 5) - logo.bitmap.height }
        }
        return image.composite(logo, locations[wmLocation].x, locations[wmLocation].y, [
          {
            mode: Jimp.BLEND_SCREEN,
            opacitySource: 0.1,
            opacityDest: 1
          }
        ]);
      };

      main().then(image => image.write(folderPath[0] + '/' + path.basename(file))).catch((error)=>console.log(error));


    }


  })
}


function storeInputFiles(files,extPatt) {
  files.forEach((folder) => {
    fs.readdir(folder, (err, files) => {
      files.forEach(file => {
        if (extPatt.test(file)) {
          mediaContainer.push(path.join(folder, file))
        }
      });

    });
  })
}

//1
ipcMain.on('inputDirectory:button', function (e, mediaType) {


  mediaContainer = []
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {

    if (!result.canceled) {

      storeInputFiles(result.filePaths,mediaExtensions[mediaType])
    }
  }).catch(err => {
    console.log(err)
  })
});

//2
ipcMain.on('inputImg:button', function (e, mediaType) {
 
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png'] },
    ]
  }).then(result => {

    if (!result.canceled) {
      watermarkImg = result.filePaths
    }
    console.log(watermarkImg)
  }).catch(err => {
    console.log(err)
  })
});

//3
ipcMain.on('outputDirectory:button', function (e, wmLocation, mediaType) {
  console.log("triggered")
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled) {

      watermarkProcess(result.filePaths, wmLocation, mediaType)
    }
  }).catch(err => {
    console.log(err)
  })
});

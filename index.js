const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const createWindow = (type) => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (type === 'image') {
        win.loadFile(path.join(__dirname, 'img.jpg'));
    }
    else {
        win.loadFile(path.join(__dirname, '/src/index.html'));
    }
};

app.whenReady().then(() => {
    createWindow();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on("toMain", (event, args) => {
    console.log('[message received]', 'app:display-image');
    axios.get('https://source.unsplash.com/random', {
        responseType: 'arraybuffer',
    })
        .then((response) => {
            const buffer = Buffer.from(response.data, 'binary');

            const outPath = path.resolve(__dirname, 'img.jpg');

            sharp(buffer)
                .resize(600, 300)
                .toFile(outPath)
                .then(() => {
                    createWindow('image');
                });
        });
})



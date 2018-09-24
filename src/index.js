const path = require('path')
const fs = require('fs-extra')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const url = require('url')
const listgen = require('./listgen')
var setting = require('./settings.json')
var osudir = setting.osupath
if (!osudir) {
	osudir = setting.osupath = path.join(process.env.APPDATA, '../local/osu!/Songs')
	console.log(setting.osupath)
	fs.writeFile('./settings.json', JSON.stringify(setting), err => {
		if (err) return
	})
}

let win
app.on('ready', () => {
	win = new BrowserWindow({ width: 400, height: 600, resizable: false, icon: path.join(__dirname, './osu.ico') })
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, './ui/index.html'),
			protocol: 'file:',
			slashes: true
		})
	)
	const menu = Menu.buildFromTemplate(require('./menuTemplate')({ process, win }))
	Menu.setApplicationMenu(menu)
	win.on('closed', () => {
		win = null
	})
})
app.on('window-all-closed', () => {
	app.quit()
})
app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})
ipcMain.on('start', ({ sender }, data) => {
	listgen(osudir).then(list => sender.send('load', JSON.stringify(list)))
})
ipcMain.on('reload', () => {
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file:',
			slashes: true
		})
	)
})

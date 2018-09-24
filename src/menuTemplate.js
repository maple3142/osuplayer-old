module.exports = g => {
	return [
		{
			label: 'Action',
			submenu: [
				{
					label: 'reload',
					role: 'reload',
					click() {
						g.win.webContents.executeJavaScript('reload()')
					}
				},
				{
					label: 'randomPlay',
					click() {
						g.win.webContents.executeJavaScript('randomPlay()')
					}
				},
				{
					label: 'exit',
					role: 'close',
					click() {
						g.process.exit()
					}
				}
			]
		},
		{
			label: 'Mode',
			submenu: [
				{
					label: 'order',
					click() {
						g.win.webContents.executeJavaScript('updmode(1)')
					}
				},
				{
					label: 'shuffle',
					click() {
						g.win.webContents.executeJavaScript('updmode(2)')
					}
				},
				{
					label: 'repeat once',
					click() {
						g.win.webContents.executeJavaScript('updmode(3)')
					}
				}
			]
		},
		{
			label: 'DevTools',
			click() {
				g.win.webContents.openDevTools()
			}
		}
	]
}

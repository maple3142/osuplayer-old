const path = require('path')
const fs = require('fs-extra')
const parser = require('./parser')

module.exports = async osupath => {
	if (!(await fs.exists(osupath))) {
		throw new Error('invalid path')
	}
	const result = []
	const list = (await fs.readdir(osupath)).map(dir => path.join(osupath, dir))
	for (const entry of list) {
		if (!(await fs.stat(entry)).isDirectory()) {
			continue
		}
		const osufiles = (await fs.readdir(entry))
			.filter(file => file.endsWith('.osu'))
			.map(file => path.join(entry, file))
		if (osufiles.length < 1) continue
		const content = await fs.readFile(osufiles[0], 'utf-8')
		try {
			const data = parser.parse(content)
			const regr = /\d+/.exec(entry)
			result.push({
				title: data.Metadata.Title,
				mp3: path.join(entry, data.General.AudioFilename),
				artist: data.Metadata.Artist,
				id: regr ? regr[0] : null,
				bg: data.Metadata.bg ? path.join(entry, data.Metadata.bg) : null
			})
		} catch (e) {
			throw new Error('invalid-content')
			return
		}
	}
	return result
}

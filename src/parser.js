const tryParseNum = num => {
	const n = Number(num)
	return isNaN(n) ? num : n
}
const tryDecodeUri = str => {
	try {
		return decodeURIComponent(str)
	} catch (e) {
		return str
	}
}
const preProcess = ct => {
	const obj = {}
	let mode
	for (const line of ct.split(/(\n|\r\n)/)) {
		if (/^\[\w+\]$/.test(line)) {
			// match [Difficulty] [Metadata]...
			mode = /^\[(\w+)\]$/.exec(line)[1]
			// ignore Events
			if (mode !== 'Events') obj[mode] = {}
		} else if (line.includes(':')) {
			const [k, v] = line.split(':').map(chk => chk.trim())
			obj[mode][k] = tryParseNum(v)
		} else if (mode === 'Events' && line.startsWith('0,0,"')) {
			// get bg file and break
			obj.Metadata.bg = tryDecodeUri(/"(.+?)"/.exec(line)[1])
			break
		}
	}
	return obj
}
const postProcess = obj => {
	if (obj.Metadata.Tags) {
		obj.Metadata.Tags = obj.Metadata.Tags.split('s')
			.filter(x => x)
			.map(chk => chk.trim())
	}
	return obj
}
exports.parse = ct => {
	try {
		return postProcess(preProcess(ct))
	} catch (e) {
		throw new ParseError(ct, e)
	}
}
class ParseError extends Error {
	constructor(content, e) {
		super()
		this.content = content
		this.originalStack = e.stack
	}
}

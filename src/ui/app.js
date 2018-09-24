const path = require('path')
const bm = 'http://osu.ppy.sh/s/'
const { shell, clipboard, ipcRenderer: ipc } = require('electron')
const imgicon = require('./imgicon')
const $ = require('jquery')
window.jQuery = $ // for bootstrap
require('popper.js')
require('bootstrap')
const List = require('list.js')

$(document).on('click', 'a[href^="http"]', e => {
	e.preventDefault()
	shell.openExternal(e.target.href)
})
$('#oip').contextmenu(e => {
	shell.openExternal(e.originalEvent.target.src)
})
$(document).on('contextmenu', 'a[href^="http"]', e => {
	e.preventDefault()
	clipboard.writeText(e.originalEvent.target.innerText)
})
$(document).on('click', '#title', e => {
	let t = $('#title').text()
	$('#search').val(t)
	lst.search(t)
})
function rd(min, max) {
	return Math.random() * (max - min) + min
}
function randomPlay() {
	var ls = $('.list-group-item')
	var el = ls[Math.floor(rd(0, ls.length))]
	play($(el))
}
let now
function updmode(x) {
	$('#audio').on('ended', e => {
		switch (x) {
			case 1:
				play(now.next())
				break
			case 2:
				randomPlay()
				break
			case 3:
				play(now.prev())
				break
		}
	})
}
updmode(1)
function play(f) {
	if (now && f.attr('data-id') === now.attr('data-id')) return
	now = f
	const p = f.attr('data-mp3')
	$('#audio')[0].src = p
	$('#audio')[0].play()
	$('#title').text(f.find('.title').text())
	$('title').text('Osu!Player <' + f.find('.title').text() + '>')
	$.grep(lst.items.map(e => e.elm), e => {
		let el = $(e)
		if (el.hasClass('list-group-item-success')) {
			el.removeClass('list-group-item-success')
				.find('.img')
				.hide()
		}
	})
	now.addClass('list-group-item-success')
		.find('.img')
		.show()
}
ipc.send('start')
ipc.once('load', (e, data) => {
	$('#loading').hide()
	var list = JSON.parse(data)
	var id = 0
	for (i of list) {
		$('.list').append(
			$('<li>')
				.append(
					$('<span>')
						.append(
							(() => {
								const $a = $('<a>').append(i.title)
								if (i.id) $a.attr('href', path.join(bm, i.id))
								return $a
							})()
						)
						.addClass('title')
				)
				.append(
					$('<span>')
						.append(i.artist)
						.addClass('artist')
						.addClass('pull-right')
						.addClass('small')
				)
				.append(
					$('<span>')
						.append(i.orititle)
						.addClass('orititle')
						.hide()
				)
				.append(
					$('<img>')
						.append('img')
						.attr('data-bg', i.bg)
						.addClass('img')
						.hide()
						.on('click', e => {
							$('.imagepreview').attr('src', $(e.target).attr('data-bg'))
							$('#imagemodal').modal('show')
						})
						.attr('src', imgicon)
				)
				.on('click', e => {
					if (e.currentTarget === e.target) play($(e.currentTarget))
				})
				.addClass('list-group-item')
				.attr('data-mp3', i.mp3)
				.attr('data-title', i.title)
				.attr('data-id', id.toString())
		)
		id++
	}
	window.lst = new List('plist', { valueNames: ['title', 'artist', 'orititle'] })
})

function reload() {
	ipc.send('reload', 'none')
}

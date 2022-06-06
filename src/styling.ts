import { dialog as fileDialog, app as remoteApp } from "@electron/remote";
import * as fs from 'fs';
import * as $ from 'jquery'
import { matches } from "lodash";
const hidefile = require('hidefile');
import { app } from 'electron';

type textmateKeyword = 
'storage.type' 
| 'storage.modifier'
| 'string.quoted.single'
| 'string.quoted.double'
| 'string.quoted.triple'
| 'string.quoted.other'
| 'string.unquoted'
| 'string.interpolated'
| 'string.regexp'
| 'string.other'
| 'support.function'
| 'support.class'
| 'support.type'
| 'support.constant'
| 'support.variable'
| 'support.other'
| 'variable.parameter'
| 'variable.language'
| 'variable.other'
| 'markup.underline'
| 'markup.underline.link'
| 'markup.bold'
| `markup.heading.${1 | 2 | 3 | 4 | 5 | 6}`
| 'markup.italic'
| `markup.list.numbered`
| 'markup.list.unnumbered'
| 'markup.quote'
| 'markup.raw'
| 'markup.other'
| 'keyword.control'
| 'keyword.operator'
| 'keyword.other'
| 'invalid.illegal'
| 'invalid.deprecated'
| 'entity.name.function'
| 'entity.name.type'
| 'entity.name.tag'
| 'entity.name.section'
| 'entity.other'
| 'entity.other.inherited-class'
| 'entity.other.attribute-name'
| 'constant.numeric'
| 'constant.character'
| 'constant.character.escape'
| 'constant.language'
| 'constant.other'
| 'comment.line.double-slash'
| 'comment.line.double-dash'
| 'comment.line.number-sign'
| 'comment.line.percentage'
| 'comment.block'
| 'comment.block.documentation'

export class Word {
	regex: RegExp;
	name: textmateKeyword;
	constructor(regex: RegExp, name: textmateKeyword) {
		this.regex = regex;
		this.name = name;
	}
}

// * Builtin styles * //

export const jsStyling: Word[] = [
	new Word(/(?<=[a-zA-Z][a-zA-Z0-9]*\.)[a-zA-Z][a-zA-Z0-9]*(?=\(.*\))/, 'entity.name.function'),
	new Word(/\/{2}.*/, 'comment.line.double-slash'),
	new Word(/"[^"]*"/, 'string.quoted.double'),
	new Word(/'[^']*'/, 'string.quoted.single'),
]


var styling: Word[] = jsStyling
var dialogOpen = false;

const input = () => document.querySelector(".window>textarea") as HTMLTextAreaElement;
const editor = () => document.querySelector(".window>div") as HTMLSpanElement;
const dialogInput = () => document.querySelector('.cmd-input') as HTMLInputElement;
const dialogContent = () => document.querySelector('.cmd-selector') as HTMLDivElement;
const dialogObject = () => document.querySelector('.command-palette') as HTMLDivElement;
const dialogPrompt = () => document.querySelector('.command-palette > h1');
var filename = 'No File Open'
var filedirty = false;
var globalFilePath = ''
var origfile = '';

try {
	var data = JSON.parse(fs.readFileSync(remoteApp.getPath('userData') + '/settings.json', 'utf8'));
	developerMode = data.developerMode
} catch {
	fs.writeFileSync(remoteApp.getPath('userData') + '/settings.json', '{ "developerMode": false }')
	developerMode = false
}

var developerMode = false;
const filenameText = () => document.querySelector('#filename');
const title = 'QuikQode - {filename}{dirty}'
const titleText = () => document.querySelector('#title')

function convertToEscapedHTMLString(str: string): string {
	var temp = document.createElement("h1");
	temp.textContent = str;
	var endtext = temp.innerHTML
	return endtext;
}

function parse(text: string) {

	var textcopy = (' ' + text).slice(1);
	//use (.*?) lazy quantifiers to match content inside
	styling.forEach((style) => {
		textcopy = textcopy.replace(
			new RegExp(style.regex, "gm"),
			`开${style.name.replace(/\./g, '-').split('').join('分')}闭$&开/闭`
		);
	});

	textcopy = textcopy.replace(/开\/闭/g, '</span>');
	const matches = textcopy.match(/开[^开闭]*闭/g);
	(matches ?? []).forEach(match => {
		textcopy = textcopy.replace(match, `<span class="${match.slice(1, -1).split('分').join('')}">`);
	})
	

	return textcopy;
}

input().addEventListener("keydown", e => {
	updateEditor()
})

function updateEditor() {
	setTimeout(
		() => {
			filename = globalFilePath.replace(/^.*[\\\/]/, '')
			editor().innerHTML = parse(input().value)
			filedirty = origfile !== input().value;
			var titlecopy = (' ' + title).slice(1);
			titlecopy = titlecopy.replace(/\{filename\}/g, filename);
			titlecopy = titlecopy.replace(/\{dirty\}/g, filedirty ? '*' : '')
			titleText().textContent = titlecopy
			filenameText().textContent = `${filename}${filedirty ? '*' : ''}`
		}, 10
	);
}

function dialog(prompt: string, options: {name: string, func: () => void}[]) {
	if (!dialogOpen) {
		dialogOpen = true;
		
		dialogObject().style.display = 'block';
		dialogInput().value = '';
		dialogInput().focus()
		dialogPrompt().textContent = prompt;
		
		dialogContent().innerHTML = '';
		for (var i = 0; i < options.length; i++) {
			dialogContent().innerHTML += `
				<div class="command-palette-item cmd-item-${i}">
					${options[i].name}
				</div>
			`
		}
		for (let i = 0; i < options.length; i++) {
			document.querySelector(`.cmd-item-${i}`).addEventListener('click', () => {
				dialogObject().style.display = 'none';
				dialogOpen = false;
				options[i].func()
			})
		}

		

	}
}

async function prompt(str: string) {
	if (!dialogOpen) {
		dialogOpen = true;
		
		dialogObject().style.display = 'block';
		dialogInput().value = '';
		dialogInput().focus()
		dialogPrompt().textContent = str;

		dialogContent().innerHTML = '';

		var promise = new Promise((resolve, reject) => {
			var promptthing = (e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					dialogInput().removeEventListener('keydown', promptthing)
					resolve(dialogInput().value)
					dialogObject().style.display = 'none';
					dialogOpen = false;
				}
				if (e.key === 'Escape') {
					reject('Escaped')
				}
			}
			dialogInput().addEventListener('keydown', promptthing)
		})

		return promise

	}
}

function saveFile() {
	if (globalFilePath === '') {
		return 1;
	}
	fs.writeFileSync(globalFilePath, input().value);
	filedirty = false;
	origfile = input().value;
}

function openFolder() {

	if (globalFilePath === '') {
		return 1;
	}
	var filedir = globalFilePath.split(/[\/\\]/).slice(0, -1).join('/')
	var files = fs.readdirSync(filedir)
	var dialogs: {name: string, func: () => void}[] = [
		{name: 'F | ..', func: () => {
			fs.writeFileSync(filedir.split(/[\/\\]/).slice(0, -1).join('/') + '/quikqode.temp', 'temporary file created by quikqode')
			globalFilePath = filedir.split(/[\/\\]/).slice(0, -1).join('/') + '/quikqode.temp'
			hidefile.hideSync(filedir.split(/[\/\\]/).slice(0, -1).join('/') + '/quikqode.temp')
			openFolder()
		}}
	]

	files.forEach(file => {

		if (file === 'quikqode.temp') return;
		
		var curfiledir = filedir + '/' + file
		
		const isFile = fs.statSync(curfiledir).isFile()

		function filefunc() {
			input().value = fs.readFileSync(curfiledir, 'utf8')
			filename = curfiledir.replace(/^.*[\\\/]/, '')
			globalFilePath = curfiledir
			origfile = input().value
			updateEditor()
		}
		function dirfunc() {
			fs.writeFileSync(`${curfiledir}/quikqode.temp`, `temporary file created by quikqode`)
			globalFilePath = curfiledir + '/quikqode.temp'
			hidefile.hideSync(curfiledir + '/quikqode.temp')
			openFolder()
			
		}

		dialogs.push({name: `${isFile ? 'F' : 'D'} | ${file}`, func: isFile ? filefunc : dirfunc})
	})
	dialog(`Current Folder Path: ${filedir}`, dialogs)
	
}

function getCurrentFolderPath() {
	return globalFilePath.split(/[\/\\]/).slice(0, -1).join('/')
}

function openCommandPalette() {
	dialog("Select a command: ", [
		{name: "Open File", func: () => {
			var filepath = fileDialog.showOpenDialogSync({title: "Open a file.", properties: ["openFile"]})[0]
			input().value = fs.readFileSync(filepath, 'utf8')
			filename = filepath.replace(/^.*[\\\/]/, '')
			globalFilePath = filepath
			origfile = input().value
			updateEditor()
		}},
		{name: "Save Current File", func: () => {
			saveFile()
		}},
		{name: "Open File from File Explorer", func: openFolder},
		{name: "Create new file", func: async () => {
			if (globalFilePath === '') {
				return 1;
			}
			var filename = await prompt("Enter File Name")
			fs.writeFileSync(getCurrentFolderPath() + '/' + filename, "")
		}},
		{name: "Rename Current File", func: async () => {
			if (globalFilePath === '') {
				return 1;
			}
			var rename = await prompt("Enter file name: ")
			fs.rename(globalFilePath, getCurrentFolderPath() + '/' + rename, () => {})
			globalFilePath = getCurrentFolderPath() + '/' + rename
		}},
		{name: `Developer Mode: ${developerMode ? 'On' : "Off"}`, func: async () => {
			var data = JSON.parse(fs.readFileSync(remoteApp.getPath('userData') + '/settings.json', 'utf8'))
			data.developerMode = !data.developerMode;
			developerMode = !developerMode;
			fs.writeFileSync(remoteApp.getPath('userData') + '/settings.json', JSON.stringify(data))
		}}
	])
}

document.addEventListener("keydown", e => {
	if (e.ctrlKey) {
		if (e.code === "KeyP") {
			openCommandPalette()
		}
	}
	if (e.code === 'Escape') {
		if (dialogOpen) {

			dialogObject().style.display = 'none';
			dialogOpen = false;
			
		}
	}

	if (e.code === 'KeyS') {
		if (e.ctrlKey) {
			saveFile()
		}
	}

	if (e.ctrlKey && e.shiftKey && e.code === 'KeyI') {
		if (!developerMode) e.preventDefault();
	}
})

function syncscroll(div: HTMLElement) {
    var d1 = editor();
    d1.scrollTop = div.scrollTop;
	d1.scrollLeft = div.scrollLeft;
	if (d1.scrollTop !== div.scrollTop) {
		div.scrollTop = d1.scrollTop
	}
}

input().addEventListener('scroll', () => {syncscroll(input()); });
setInterval(() => {syncscroll(input())}, 10);



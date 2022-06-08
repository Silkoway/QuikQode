import { dialog as fileDialog, app as remoteApp, BrowserWindow } from "@electron/remote";
import * as fs from "fs";
import * as $ from "jquery";
import { matches } from "lodash";
const hidefile = require("hidefile");
import { app } from "electron";

type textmateKeyword =
	| "storage.type"
	| "storage.modifier"
	| "storage.name"
	| "string.quoted.single"
	| "string.quoted.double"
	| "string.quoted.triple"
	| "string.quoted.other"
	| "string.unquoted"
	| "string.interpolated"
	| "string.regexp"
	| "string.other"
	| "support.function"
	| "support.class"
	| "support.type"
	| "support.constant"
	| "support.variable"
	| "support.other"
	| "variable.parameter"
	| "variable.language"
	| "variable.other"
	| "markup.underline"
	| "markup.underline.link"
	| "markup.bold"
	| `markup.heading.${1 | 2 | 3 | 4 | 5 | 6}`
	| "markup.italic"
	| `markup.list.numbered`
	| "markup.list.unnumbered"
	| "markup.quote"
	| "markup.raw"
	| "markup.other"
	| "keyword.control"
	| "keyword.operator"
	| "keyword.other"
	| "invalid.illegal"
	| "invalid.deprecated"
	| "entity.name.function"
	| "entity.name.type"
	| "entity.name.tag"
	| "entity.name.section"
	| "entity.other"
	| "entity.other.inherited-class"
	| "entity.other.attribute-name"
	| "constant.numeric"
	| "constant.character"
	| "constant.character.escape"
	| "constant.language"
	| "constant.other"
	| "comment.line.double-slash"
	| "comment.line.double-dash"
	| "comment.line.number-sign"
	| "comment.line.percentage"
	| "comment.block"
	| "comment.block.documentation";

class QuikBaseEvent {
	setStyle: (newStyle: QuikWord[]) => void;
	setTitle: (newTitle: string) => void;
	constructor() {
		this.setStyle = (newStyle: QuikWord[]) => {
			styling = newStyle;
		};
		this.setTitle = (newTitle: string) => {
			title = newTitle;
		};
	}
}

class QuikFileLoadEvent extends QuikBaseEvent {
	filename: string;
	filepath: string;
	constructor(filename: string, filepath: string) {
		super();
		this.filename = filename;
		this.filepath = filepath;
	}
}

export class QuikWord {
	regex: RegExp;
	name: textmateKeyword;
	constructor(regex: RegExp, name: textmateKeyword) {
		this.regex = regex;
		this.name = name;
	}
}
export class QuikPlugin {
	name: string;
	update?: () => void;
	load?: () => void;
	fileload?: (e: QuikFileLoadEvent) => void;
	constructor(
		name: string,
		func: {
			update?: () => void;
			load?: () => void;
			fileload?: (e: QuikFileLoadEvent) => void;
		}
	) {
		this.name = name;
		this.load = func.load ?? (() => {});
		this.update = func.update ?? (() => {});
		this.fileload = func.fileload ?? (() => {});
	}
}

import builtinStyles from "./styles";

// * Builtin styles * //
const noStyling: QuikWord[] = [];

var styling: QuikWord[] = noStyling;
var dialogOpen = false;

const input = () =>
	document.querySelector(".window>textarea") as HTMLTextAreaElement;
const editor = () => document.querySelector(".window>div") as HTMLSpanElement;
const dialogInput = () =>
	document.querySelector(".cmd-input") as HTMLInputElement;
const dialogContent = () =>
	document.querySelector(".cmd-selector") as HTMLDivElement;
const dialogObject = () =>
	document.querySelector(".command-palette") as HTMLDivElement;
const dialogPrompt = () => document.querySelector(".command-palette > h1");
var filename = "No File Open";
var filedirty = false;
var globalFilePath = "";
var origfile = "";
var developerMode = false;
try {
	var data = JSON.parse(
		fs.readFileSync(remoteApp.getPath("userData") + "/settings.json", "utf8")
	);
	developerMode = data.developerMode;
} catch {
	fs.writeFileSync(
		remoteApp.getPath("userData") + "/settings.json",
		'{ "developerMode": false }'
	);
	developerMode = false;
}

var plugins: QuikPlugin[] = [builtinStyles];

const filenameText = () => document.querySelector("#filename");
let title = "QuikQode - {filename}{dirty}";
const titleText = () => document.querySelector("#title");

function typeInTextarea(
	newText: string,
	el = document.activeElement as HTMLTextAreaElement
) {
	const [start, end] = [el.selectionStart, el.selectionEnd];
	el.setRangeText(newText, start, end, "end");
}

function convertToEscapedHTMLString(str: string): string {
	var temp = document.createElement("h1");
	temp.textContent = str;
	var endtext = temp.innerHTML;
	return endtext;
}

function parse(text: string) {
	var textcopy = (" " + text).slice(1);
	//use (.*?) lazy quantifiers to match content inside
	styling.forEach((style) => {
		textcopy = textcopy.replace(
			new RegExp(style.regex, "gm"),
			`开${style.name.replace(/\./g, "-").replace(/\-/g, "的").split("").join("分")}闭$&开分闭`
		);
	});

	textcopy = convertToEscapedHTMLString(textcopy);
	textcopy = textcopy.replace(/开分闭/g, "</span>");
	const matches = textcopy.match(/开[^开闭]*闭/g);
	matches?.forEach((match) => {
		textcopy = textcopy.replace(
			match,
			`<span class="${match.slice(1, -1).split("分").join("").replace(/的/g, '-')}">`
		);
	});

	return textcopy;
}

input().addEventListener("keydown", (e) => {
	updateEditor();
	if (e.code === "Tab") {
		e.preventDefault();
		typeInTextarea("\t");
	}
});

function updateEditor() {
	setTimeout(() => {
		plugins.forEach((plugin) => {
			plugin.update();
		});

		filename =
			globalFilePath.replace(/^.*[\\\/]/, "") === ""
				? "No File Open"
				: globalFilePath.replace(/^.*[\\\/]/, "");
		editor().innerHTML = parse(input().value);
		filedirty = origfile !== input().value;
		var titlecopy = (" " + title).slice(1);
		titlecopy = titlecopy.replace(/\{filename\}/g, filename);
		titlecopy = titlecopy.replace(/\{dirty\}/g, filedirty ? "*" : "");
		titleText().textContent = titlecopy;
		filenameText().textContent = `${filename}${filedirty ? "*" : ""}`;
	}, 10);
}
function refreshOptions(options: { name: string; func: () => void }[]) {
	dialogContent().innerHTML = "";
	for (var i = 0; i < options.length; i++) {
		dialogContent().innerHTML += `
				<div tabindex="0" class="command-palette-item cmd-item-${i}">
					${options[i].name}
				</div>
			`;
	}
	for (let i = 0; i < options.length; i++) {
		document.querySelector(`.cmd-item-${i}`).addEventListener("click", () => {
			dialogObject().style.display = "none";
			dialogOpen = false;
			dialogInput().addEventListener("keydown", e => promptfilter(e, options))
			options[i].func();
		});
		(document.querySelector(`.cmd-item-${i}`) as HTMLDivElement).addEventListener('keydown', e => {
			if (e.code === 'Enter') {
				dialogObject().style.display = "none";
				dialogOpen = false;
				dialogInput().addEventListener("keydown", e => promptfilter(e, options))
				options[i].func();
			}
		})
	}
}

function promptfilter(e: KeyboardEvent, options: { name: string, func: () => void }[]) {

	var filtered: { name: string, func: () => void }[] = [];
	options.map(option => option.name).forEach(name => {
		if (name.toLowerCase().startsWith(dialogInput().value.toLowerCase())) {
			filtered.push(...options.filter(option => option.name === name))
		}
	})
	refreshOptions(filtered)
}

function dialog(prompt: string, options: { name: string; func: () => void }[]) {
	if (!dialogOpen) {
		dialogOpen = true;

		dialogObject().style.display = "block";
		dialogInput().value = "";
		dialogInput().focus();
		dialogPrompt().textContent = prompt;

		refreshOptions(options);

		dialogInput().addEventListener("keydown", e => promptfilter(e, options))
	}
}

async function prompt(str: string) {
	if (!dialogOpen) {
		dialogOpen = true;

		dialogObject().style.display = "block";
		dialogInput().value = "";
		dialogInput().focus();
		dialogPrompt().textContent = str;

		dialogContent().innerHTML = "";

		var promise = new Promise((resolve, reject) => {
			var promptthing = (e: KeyboardEvent) => {
				if (e.key === "Enter") {
					dialogInput().removeEventListener("keydown", promptthing);
					resolve(dialogInput().value);
					dialogObject().style.display = "none";
					dialogOpen = false;
				}
				if (e.key === "Escape") {
					reject("Escaped");
				}
			};
			dialogInput().addEventListener("keydown", promptthing);
		});

		return promise;
	}
}
async function alert(str: string, html: boolean = false) {
	if (!dialogOpen) {
		dialogOpen = true;

		dialogObject().style.display = "block";
		dialogInput().value = "";
		dialogInput().focus();
		if (!html) dialogPrompt().textContent = str;
		else
			dialogPrompt().innerHTML = str
				.replace(/\n/g, "<br>")
				.replace(/\t/, "&emsp;");

		dialogContent().innerHTML = "";

		var promise = new Promise((resolve, reject) => {
			var promptthing = (e: KeyboardEvent) => {
				if (e.key === "Enter") {
					dialogInput().removeEventListener("keydown", promptthing);
					resolve("Yes");
					dialogObject().style.display = "none";
					dialogOpen = false;
				}
				if (e.key === "Escape") {
					reject("Escaped");
				}
			};
			dialogInput().addEventListener("keydown", promptthing);
		});

		return promise;
	}
}
function saveFile() {
	if (globalFilePath === "") {
		return 1;
	}
	fs.writeFileSync(globalFilePath, input().value);
	filedirty = false;
	origfile = input().value;
}

function openFolder() {
	if (globalFilePath === "") {
		return 1;
	}
	var filedir = globalFilePath
		.split(/[\/\\]/)
		.slice(0, -1)
		.join("/");
	var files = fs.readdirSync(filedir);
	var dialogs: { name: string; func: () => void }[] = [
		{
			name: "F | ..",
			func: () => {
				fs.writeFileSync(
					filedir
						.split(/[\/\\]/)
						.slice(0, -1)
						.join("/") + "/quikqode.temp",
					"temporary file created by quikqode"
				);
				globalFilePath =
					filedir
						.split(/[\/\\]/)
						.slice(0, -1)
						.join("/") + "/quikqode.temp";
				hidefile.hideSync(
					filedir
						.split(/[\/\\]/)
						.slice(0, -1)
						.join("/") + "/quikqode.temp"
				);
				openFolder();
			},
		},
	];

	files.forEach((file) => {
		if (file === "quikqode.temp") return;

		var curfiledir = filedir + "/" + file;

		const isFile = fs.statSync(curfiledir).isFile();

		function filefunc() {
			input().value = fs.readFileSync(curfiledir, "utf8");
			filename = curfiledir.replace(/^.*[\\\/]/, "");
			globalFilePath = curfiledir;
			origfile = input().value;
			plugins.forEach((plugin) => {
				plugin.fileload(new QuikFileLoadEvent(filename, globalFilePath));
			});
			updateEditor();
		}
		function dirfunc() {
			fs.writeFileSync(
				`${curfiledir}/quikqode.temp`,
				`temporary file created by quikqode`
			);
			globalFilePath = curfiledir + "/quikqode.temp";
			hidefile.hideSync(curfiledir + "/quikqode.temp");
			openFolder();
		}

		dialogs.push({
			name: `${isFile ? "F" : "D"} | ${file}`,
			func: isFile ? filefunc : dirfunc,
		});
	});
	dialog(`Current Folder Path: ${filedir}`, dialogs);
}

function openTerm() {
	if (process.platform === "win32") {
		var child_process = require("child_process");
		child_process.exec("start cmd.exe /K cd /D");
	} else {
		alert("Terminal opening not supported on macos.")
	}

}

function getCurrentFolderPath() {
	return globalFilePath
		.split(/[\/\\]/)
		.slice(0, -1)
		.join("/");
}



function createBrowserWindow(url: string, frame: boolean) {
	const win = new BrowserWindow({
	  height: 600,
	  width: 800,
	  frame: frame,
	  webPreferences: {
		  nodeIntegration: true,
		  contextIsolation: false,
	  }
	});

	win.loadFile(url);

	require('@electron/remote/main').enable(win.webContents)
  
	
  }

async function openCalculator() {
	createBrowserWindow('src/calculator.html', false)
}

function openCommandPalette() {
	dialog("Select a command: ", [
		{
			name: "Open File",
			func: () => {
				var filepath = fileDialog.showOpenDialogSync({
					title: "Open a file.",
					properties: ["openFile"],
				})[0];
				input().value = fs.readFileSync(filepath, "utf8");
				filename = filepath.replace(/^.*[\\\/]/, "");
				globalFilePath = filepath;
				origfile = input().value;
				plugins.forEach((plugin) => {
					plugin.fileload(new QuikFileLoadEvent(filename, globalFilePath));
				});
				updateEditor();
			},
		},
		{
			name: "Save Current File",
			func: () => {
				saveFile();
			},
		},
		{ name: "Open File from File Explorer", func: openFolder },
		{
			name: "Create new file",
			func: async () => {
				if (globalFilePath === "") {
					return 1;
				}
				var filename = await prompt("Enter File Name");
				fs.writeFileSync(getCurrentFolderPath() + "/" + filename, "");
			},
		},
		{
			name: "Create new folder",
			func: async () => {
				if (globalFilePath === "") {
					return 1;
				}
				var filename = await prompt("Enter Folder Name");
				fs.mkdirSync(getCurrentFolderPath() + "/" + filename);
			},
		},
		{
			name: "Rename Current File",
			func: async () => {
				if (globalFilePath === "") {
					return 1;
				}
				var rename = await prompt("Enter file name: ");
				fs.rename(
					globalFilePath,
					getCurrentFolderPath() + "/" + rename,
					() => {}
				);
				globalFilePath = getCurrentFolderPath() + "/" + rename;
				plugins.forEach((plugin) => {
					plugin.fileload(new QuikFileLoadEvent(filename, globalFilePath));
				});
			},
		},
		{
			name: `Developer Mode: ${developerMode ? "On" : "Off"}`,
			func: async () => {
				var data = JSON.parse(
					fs.readFileSync(
						remoteApp.getPath("userData") + "/settings.json",
						"utf8"
					)
				);
				data.developerMode = !data.developerMode;
				developerMode = !developerMode;
				fs.writeFileSync(
					remoteApp.getPath("userData") + "/settings.json",
					JSON.stringify(data)
				);
			},
		},
		{
			name: "Info",
			func: async () => {
				dialog("What to show?", [
					{
						name: "Changelog",
						func: async () => {
							alert(
								`
<h1>Info</h1>
<h3>QuikQode Dev0.2.0</h3>
Better syntax highlighting
+ New Folder
+ Other Features
<h3>QuikQode Dev0.1.0</h3>
Some feature additions!
+ Save As Command
+ Info Command
<h4>QuikQode Dev0.0.1</h4>
Minor Fixes:
+ Editor no longer breaks when editing any type of markup language files.
<h3>QuikQode Dev0.0.0</h3>
+ Editing
+ Minor Syntax Highlighting
+ Renaming files
+ Renaming
+ Built-in file explorer

					`,
								true
							);
						},
					},
					{
						name: "About",
						func: async () => {
							alert("Created by Silkyway. ©Silkyway 2022-2022");
						},
					},
				]);
			},
		},
		{
			name: "Save As",
			func: async () => {
				var filepath = fileDialog.showSaveDialogSync({});
				fs.writeFileSync(filepath, input().value);
				filename = filepath.replace(/^.*[\\\/]/, "");
				globalFilePath = filepath;
				origfile = input().value;
				updateEditor();
			},
		},
		{
			name: "Open Terminal",
			func: async () => {
				openTerm();
			},
		},
		{
			name: "Open Calculator",
			func: openCalculator
		},
	]);
}

document.addEventListener("keydown", (e) => {
	if (e.ctrlKey) {
		if (e.code === "KeyP") {
			openCommandPalette();
		}
	}
	if (e.code === "Escape") {
		if (dialogOpen) {
			dialogObject().style.display = "none";
			dialogOpen = false;
			dialogInput().addEventListener("keydown", e => promptfilter(e, []))
		}
	}

	if (e.code === "KeyS") {
		if (e.ctrlKey) {
			saveFile();
		}
	}

	if (e.ctrlKey && e.shiftKey && e.code === "KeyI") {
		if (!developerMode) e.preventDefault();
	}
});

function syncscroll(div: HTMLElement) {
	var d1 = editor();
	d1.scrollTop = div.scrollTop;
	d1.scrollLeft = div.scrollLeft;
	if (d1.scrollTop !== div.scrollTop) {
		div.scrollTop = d1.scrollTop;
	}
}

input().addEventListener("scroll", () => {
	syncscroll(input());
});
setInterval(() => {
	syncscroll(input());
}, 10);

plugins.forEach((plugin) => {
	plugin.load();
});

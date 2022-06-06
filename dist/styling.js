"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsStyling = exports.Word = void 0;
var remote_1 = require("@electron/remote");
var fs = require("fs");
var hidefile = require('hidefile');
var Word = /** @class */ (function () {
    function Word(regex, name) {
        this.regex = regex;
        this.name = name;
    }
    return Word;
}());
exports.Word = Word;
// * Builtin styles * //
exports.jsStyling = [
    new Word(/(?<=[a-zA-Z][a-zA-Z0-9]*\.)[a-zA-Z][a-zA-Z0-9]*(?=\(.*\))/, 'entity.name.function'),
    new Word(/\/{2}.*/, 'comment.line.double-slash'),
    new Word(/"[^"]*"/, 'string.quoted.double'),
    new Word(/'[^']*'/, 'string.quoted.single'),
];
var styling = exports.jsStyling;
var dialogOpen = false;
var input = function () { return document.querySelector(".window>textarea"); };
var editor = function () { return document.querySelector(".window>div"); };
var dialogInput = function () { return document.querySelector('.cmd-input'); };
var dialogContent = function () { return document.querySelector('.cmd-selector'); };
var dialogObject = function () { return document.querySelector('.command-palette'); };
var dialogPrompt = function () { return document.querySelector('.command-palette > h1'); };
var filename = 'No File Open';
var filedirty = false;
var globalFilePath = '';
var origfile = '';
try {
    var data = JSON.parse(fs.readFileSync(remote_1.app.getPath('userData') + '/settings.json', 'utf8'));
    developerMode = data.developerMode;
}
catch (_a) {
    fs.writeFileSync(remote_1.app.getPath('userData') + '/settings.json', '{ "developerMode": false }');
    developerMode = false;
}
var developerMode = false;
var filenameText = function () { return document.querySelector('#filename'); };
var title = 'QuikQode - {filename}{dirty}';
var titleText = function () { return document.querySelector('#title'); };
function convertToEscapedHTMLString(str) {
    var temp = document.createElement("h1");
    temp.textContent = str;
    var endtext = temp.innerHTML;
    return endtext;
}
function parse(text) {
    var textcopy = (' ' + text).slice(1);
    //use (.*?) lazy quantifiers to match content inside
    styling.forEach(function (style) {
        textcopy = textcopy.replace(new RegExp(style.regex, "gm"), "\u5F00".concat(style.name.replace(/\./g, '-').split('').join('分'), "\u95ED$&\u5F00/\u95ED"));
    });
    textcopy = textcopy.replace(/开\/闭/g, '</span>');
    var matches = textcopy.match(/开[^开闭]*闭/g);
    (matches !== null && matches !== void 0 ? matches : []).forEach(function (match) {
        textcopy = textcopy.replace(match, "<span class=\"".concat(match.slice(1, -1).split('分').join(''), "\">"));
    });
    return textcopy;
}
input().addEventListener("keydown", function (e) {
    updateEditor();
});
function updateEditor() {
    setTimeout(function () {
        filename = globalFilePath.replace(/^.*[\\\/]/, '');
        editor().innerHTML = parse(input().value);
        filedirty = origfile !== input().value;
        var titlecopy = (' ' + title).slice(1);
        titlecopy = titlecopy.replace(/\{filename\}/g, filename);
        titlecopy = titlecopy.replace(/\{dirty\}/g, filedirty ? '*' : '');
        titleText().textContent = titlecopy;
        filenameText().textContent = "".concat(filename).concat(filedirty ? '*' : '');
    }, 10);
}
function dialog(prompt, options) {
    if (!dialogOpen) {
        dialogOpen = true;
        dialogObject().style.display = 'block';
        dialogInput().value = '';
        dialogInput().focus();
        dialogPrompt().textContent = prompt;
        dialogContent().innerHTML = '';
        for (var i = 0; i < options.length; i++) {
            dialogContent().innerHTML += "\n\t\t\t\t<div class=\"command-palette-item cmd-item-".concat(i, "\">\n\t\t\t\t\t").concat(options[i].name, "\n\t\t\t\t</div>\n\t\t\t");
        }
        var _loop_1 = function (i_1) {
            document.querySelector(".cmd-item-".concat(i_1)).addEventListener('click', function () {
                dialogObject().style.display = 'none';
                dialogOpen = false;
                options[i_1].func();
            });
        };
        for (var i_1 = 0; i_1 < options.length; i_1++) {
            _loop_1(i_1);
        }
    }
}
function prompt(str) {
    return __awaiter(this, void 0, void 0, function () {
        var promise;
        return __generator(this, function (_a) {
            if (!dialogOpen) {
                dialogOpen = true;
                dialogObject().style.display = 'block';
                dialogInput().value = '';
                dialogInput().focus();
                dialogPrompt().textContent = str;
                dialogContent().innerHTML = '';
                promise = new Promise(function (resolve, reject) {
                    var promptthing = function (e) {
                        if (e.key === 'Enter') {
                            dialogInput().removeEventListener('keydown', promptthing);
                            resolve(dialogInput().value);
                            dialogObject().style.display = 'none';
                            dialogOpen = false;
                        }
                        if (e.key === 'Escape') {
                            reject('Escaped');
                        }
                    };
                    dialogInput().addEventListener('keydown', promptthing);
                });
                return [2 /*return*/, promise];
            }
            return [2 /*return*/];
        });
    });
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
    var filedir = globalFilePath.split(/[\/\\]/).slice(0, -1).join('/');
    var files = fs.readdirSync(filedir);
    var dialogs = [
        { name: 'F | ..', func: function () {
                fs.writeFileSync(filedir.split(/[\/\\]/).slice(0, -1).join('/') + '/quikqode.temp', 'temporary file created by quikqode');
                globalFilePath = filedir.split(/[\/\\]/).slice(0, -1).join('/') + '/quikqode.temp';
                hidefile.hideSync(filedir.split(/[\/\\]/).slice(0, -1).join('/') + '/quikqode.temp');
                openFolder();
            } }
    ];
    files.forEach(function (file) {
        if (file === 'quikqode.temp')
            return;
        var curfiledir = filedir + '/' + file;
        var isFile = fs.statSync(curfiledir).isFile();
        function filefunc() {
            input().value = fs.readFileSync(curfiledir, 'utf8');
            filename = curfiledir.replace(/^.*[\\\/]/, '');
            globalFilePath = curfiledir;
            origfile = input().value;
            updateEditor();
        }
        function dirfunc() {
            fs.writeFileSync("".concat(curfiledir, "/quikqode.temp"), "temporary file created by quikqode");
            globalFilePath = curfiledir + '/quikqode.temp';
            hidefile.hideSync(curfiledir + '/quikqode.temp');
            openFolder();
        }
        dialogs.push({ name: "".concat(isFile ? 'F' : 'D', " | ").concat(file), func: isFile ? filefunc : dirfunc });
    });
    dialog("Current Folder Path: ".concat(filedir), dialogs);
}
function getCurrentFolderPath() {
    return globalFilePath.split(/[\/\\]/).slice(0, -1).join('/');
}
function openCommandPalette() {
    var _this = this;
    dialog("Select a command: ", [
        { name: "Open File", func: function () {
                var filepath = remote_1.dialog.showOpenDialogSync({ title: "Open a file.", properties: ["openFile"] })[0];
                input().value = fs.readFileSync(filepath, 'utf8');
                filename = filepath.replace(/^.*[\\\/]/, '');
                globalFilePath = filepath;
                origfile = input().value;
                updateEditor();
            } },
        { name: "Save Current File", func: function () {
                saveFile();
            } },
        { name: "Open File from File Explorer", func: openFolder },
        { name: "Create new file", func: function () { return __awaiter(_this, void 0, void 0, function () {
                var filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (globalFilePath === '') {
                                return [2 /*return*/, 1];
                            }
                            return [4 /*yield*/, prompt("Enter File Name")];
                        case 1:
                            filename = _a.sent();
                            fs.writeFileSync(getCurrentFolderPath() + '/' + filename, "");
                            return [2 /*return*/];
                    }
                });
            }); } },
        { name: "Rename Current File", func: function () { return __awaiter(_this, void 0, void 0, function () {
                var rename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (globalFilePath === '') {
                                return [2 /*return*/, 1];
                            }
                            return [4 /*yield*/, prompt("Enter file name: ")];
                        case 1:
                            rename = _a.sent();
                            fs.rename(globalFilePath, getCurrentFolderPath() + '/' + rename, function () { });
                            globalFilePath = getCurrentFolderPath() + '/' + rename;
                            return [2 /*return*/];
                    }
                });
            }); } },
        { name: "Developer Mode: ".concat(developerMode ? 'On' : "Off"), func: function () { return __awaiter(_this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    data = JSON.parse(fs.readFileSync(remote_1.app.getPath('userData') + '/settings.json', 'utf8'));
                    data.developerMode = !data.developerMode;
                    developerMode = !developerMode;
                    fs.writeFileSync(remote_1.app.getPath('userData') + '/settings.json', JSON.stringify(data));
                    return [2 /*return*/];
                });
            }); } }
    ]);
}
document.addEventListener("keydown", function (e) {
    if (e.ctrlKey) {
        if (e.code === "KeyP") {
            openCommandPalette();
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
            saveFile();
        }
    }
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyI') {
        if (!developerMode)
            e.preventDefault();
    }
});
function syncscroll(div) {
    var d1 = editor();
    d1.scrollTop = div.scrollTop;
    d1.scrollLeft = div.scrollLeft;
    if (d1.scrollTop !== div.scrollTop) {
        div.scrollTop = d1.scrollTop;
    }
}
input().addEventListener('scroll', function () { syncscroll(input()); });
setInterval(function () { syncscroll(input()); }, 10);
//# sourceMappingURL=styling.js.map
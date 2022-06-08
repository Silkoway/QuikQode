"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.QuikPlugin = exports.QuikWord = void 0;
var remote_1 = require("@electron/remote");
var fs = require("fs");
var hidefile = require("hidefile");
var QuikBaseEvent = /** @class */ (function () {
    function QuikBaseEvent() {
        this.setStyle = function (newStyle) {
            styling = newStyle;
        };
        this.setTitle = function (newTitle) {
            title = newTitle;
        };
    }
    return QuikBaseEvent;
}());
var QuikFileLoadEvent = /** @class */ (function (_super) {
    __extends(QuikFileLoadEvent, _super);
    function QuikFileLoadEvent(filename, filepath) {
        var _this = _super.call(this) || this;
        _this.filename = filename;
        _this.filepath = filepath;
        return _this;
    }
    return QuikFileLoadEvent;
}(QuikBaseEvent));
var QuikWord = /** @class */ (function () {
    function QuikWord(regex, name) {
        this.regex = regex;
        this.name = name;
    }
    return QuikWord;
}());
exports.QuikWord = QuikWord;
var QuikPlugin = /** @class */ (function () {
    function QuikPlugin(name, func) {
        var _a, _b, _c;
        this.name = name;
        this.load = (_a = func.load) !== null && _a !== void 0 ? _a : (function () { });
        this.update = (_b = func.update) !== null && _b !== void 0 ? _b : (function () { });
        this.fileload = (_c = func.fileload) !== null && _c !== void 0 ? _c : (function () { });
    }
    return QuikPlugin;
}());
exports.QuikPlugin = QuikPlugin;
var styles_1 = require("./styles");
// * Builtin styles * //
var noStyling = [];
var styling = noStyling;
var dialogOpen = false;
var input = function () {
    return document.querySelector(".window>textarea");
};
var editor = function () { return document.querySelector(".window>div"); };
var dialogInput = function () {
    return document.querySelector(".cmd-input");
};
var dialogContent = function () {
    return document.querySelector(".cmd-selector");
};
var dialogObject = function () {
    return document.querySelector(".command-palette");
};
var dialogPrompt = function () { return document.querySelector(".command-palette > h1"); };
var filename = "No File Open";
var filedirty = false;
var globalFilePath = "";
var origfile = "";
var developerMode = false;
try {
    var data = JSON.parse(fs.readFileSync(remote_1.app.getPath("userData") + "/settings.json", "utf8"));
    developerMode = data.developerMode;
}
catch (_a) {
    fs.writeFileSync(remote_1.app.getPath("userData") + "/settings.json", '{ "developerMode": false }');
    developerMode = false;
}
var plugins = [styles_1.default];
var filenameText = function () { return document.querySelector("#filename"); };
var title = "QuikQode - {filename}{dirty}";
var titleText = function () { return document.querySelector("#title"); };
function typeInTextarea(newText, el) {
    if (el === void 0) { el = document.activeElement; }
    var _a = [el.selectionStart, el.selectionEnd], start = _a[0], end = _a[1];
    el.setRangeText(newText, start, end, "end");
}
function convertToEscapedHTMLString(str) {
    var temp = document.createElement("h1");
    temp.textContent = str;
    var endtext = temp.innerHTML;
    return endtext;
}
function parse(text) {
    var textcopy = (" " + text).slice(1);
    //use (.*?) lazy quantifiers to match content inside
    styling.forEach(function (style) {
        textcopy = textcopy.replace(new RegExp(style.regex, "gm"), "\u5F00".concat(style.name.replace(/\./g, "-").replace(/\-/g, "的").split("").join("分"), "\u95ED$&\u5F00\u5206\u95ED"));
    });
    textcopy = convertToEscapedHTMLString(textcopy);
    textcopy = textcopy.replace(/开分闭/g, "</span>");
    var matches = textcopy.match(/开[^开闭]*闭/g);
    matches === null || matches === void 0 ? void 0 : matches.forEach(function (match) {
        textcopy = textcopy.replace(match, "<span class=\"".concat(match.slice(1, -1).split("分").join("").replace(/的/g, '-'), "\">"));
    });
    return textcopy;
}
input().addEventListener("keydown", function (e) {
    updateEditor();
    if (e.code === "Tab") {
        e.preventDefault();
        typeInTextarea("\t");
    }
});
function updateEditor() {
    setTimeout(function () {
        plugins.forEach(function (plugin) {
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
        filenameText().textContent = "".concat(filename).concat(filedirty ? "*" : "");
    }, 10);
}
function refreshOptions(options) {
    dialogContent().innerHTML = "";
    for (var i = 0; i < options.length; i++) {
        dialogContent().innerHTML += "\n\t\t\t\t<div tabindex=\"0\" class=\"command-palette-item cmd-item-".concat(i, "\">\n\t\t\t\t\t").concat(options[i].name, "\n\t\t\t\t</div>\n\t\t\t");
    }
    var _loop_1 = function (i_1) {
        document.querySelector(".cmd-item-".concat(i_1)).addEventListener("click", function () {
            dialogObject().style.display = "none";
            dialogOpen = false;
            dialogInput().addEventListener("keydown", function (e) { return promptfilter(e, options); });
            options[i_1].func();
        });
        document.querySelector(".cmd-item-".concat(i_1)).addEventListener('keydown', function (e) {
            if (e.code === 'Enter') {
                dialogObject().style.display = "none";
                dialogOpen = false;
                dialogInput().addEventListener("keydown", function (e) { return promptfilter(e, options); });
                options[i_1].func();
            }
        });
    };
    for (var i_1 = 0; i_1 < options.length; i_1++) {
        _loop_1(i_1);
    }
}
function promptfilter(e, options) {
    var filtered = [];
    options.map(function (option) { return option.name; }).forEach(function (name) {
        if (name.toLowerCase().startsWith(dialogInput().value.toLowerCase())) {
            filtered.push.apply(filtered, options.filter(function (option) { return option.name === name; }));
        }
    });
    refreshOptions(filtered);
}
function dialog(prompt, options) {
    if (!dialogOpen) {
        dialogOpen = true;
        dialogObject().style.display = "block";
        dialogInput().value = "";
        dialogInput().focus();
        dialogPrompt().textContent = prompt;
        refreshOptions(options);
        dialogInput().addEventListener("keydown", function (e) { return promptfilter(e, options); });
    }
}
function prompt(str) {
    return __awaiter(this, void 0, void 0, function () {
        var promise;
        return __generator(this, function (_a) {
            if (!dialogOpen) {
                dialogOpen = true;
                dialogObject().style.display = "block";
                dialogInput().value = "";
                dialogInput().focus();
                dialogPrompt().textContent = str;
                dialogContent().innerHTML = "";
                promise = new Promise(function (resolve, reject) {
                    var promptthing = function (e) {
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
                return [2 /*return*/, promise];
            }
            return [2 /*return*/];
        });
    });
}
function alert(str, html) {
    if (html === void 0) { html = false; }
    return __awaiter(this, void 0, void 0, function () {
        var promise;
        return __generator(this, function (_a) {
            if (!dialogOpen) {
                dialogOpen = true;
                dialogObject().style.display = "block";
                dialogInput().value = "";
                dialogInput().focus();
                if (!html)
                    dialogPrompt().textContent = str;
                else
                    dialogPrompt().innerHTML = str
                        .replace(/\n/g, "<br>")
                        .replace(/\t/, "&emsp;");
                dialogContent().innerHTML = "";
                promise = new Promise(function (resolve, reject) {
                    var promptthing = function (e) {
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
                return [2 /*return*/, promise];
            }
            return [2 /*return*/];
        });
    });
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
    var dialogs = [
        {
            name: "F | ..",
            func: function () {
                fs.writeFileSync(filedir
                    .split(/[\/\\]/)
                    .slice(0, -1)
                    .join("/") + "/quikqode.temp", "temporary file created by quikqode");
                globalFilePath =
                    filedir
                        .split(/[\/\\]/)
                        .slice(0, -1)
                        .join("/") + "/quikqode.temp";
                hidefile.hideSync(filedir
                    .split(/[\/\\]/)
                    .slice(0, -1)
                    .join("/") + "/quikqode.temp");
                openFolder();
            },
        },
    ];
    files.forEach(function (file) {
        if (file === "quikqode.temp")
            return;
        var curfiledir = filedir + "/" + file;
        var isFile = fs.statSync(curfiledir).isFile();
        function filefunc() {
            input().value = fs.readFileSync(curfiledir, "utf8");
            filename = curfiledir.replace(/^.*[\\\/]/, "");
            globalFilePath = curfiledir;
            origfile = input().value;
            plugins.forEach(function (plugin) {
                plugin.fileload(new QuikFileLoadEvent(filename, globalFilePath));
            });
            updateEditor();
        }
        function dirfunc() {
            fs.writeFileSync("".concat(curfiledir, "/quikqode.temp"), "temporary file created by quikqode");
            globalFilePath = curfiledir + "/quikqode.temp";
            hidefile.hideSync(curfiledir + "/quikqode.temp");
            openFolder();
        }
        dialogs.push({
            name: "".concat(isFile ? "F" : "D", " | ").concat(file),
            func: isFile ? filefunc : dirfunc,
        });
    });
    dialog("Current Folder Path: ".concat(filedir), dialogs);
}
function openTerm() {
    if (process.platform === "win32") {
        var child_process = require("child_process");
        child_process.exec("start cmd.exe /K cd /D");
    }
    else {
        alert("Terminal opening not supported on macos.");
    }
}
function getCurrentFolderPath() {
    return globalFilePath
        .split(/[\/\\]/)
        .slice(0, -1)
        .join("/");
}
function createBrowserWindow(url, frame) {
    var win = new remote_1.BrowserWindow({
        height: 600,
        width: 800,
        frame: frame,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile(url);
    require('@electron/remote/main').enable(win.webContents);
}
function openCalculator() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            createBrowserWindow('src/calculator.html', false);
            return [2 /*return*/];
        });
    });
}
function openCommandPalette() {
    var _this = this;
    dialog("Select a command: ", [
        {
            name: "Open File",
            func: function () {
                var filepath = remote_1.dialog.showOpenDialogSync({
                    title: "Open a file.",
                    properties: ["openFile"],
                })[0];
                input().value = fs.readFileSync(filepath, "utf8");
                filename = filepath.replace(/^.*[\\\/]/, "");
                globalFilePath = filepath;
                origfile = input().value;
                plugins.forEach(function (plugin) {
                    plugin.fileload(new QuikFileLoadEvent(filename, globalFilePath));
                });
                updateEditor();
            },
        },
        {
            name: "Save Current File",
            func: function () {
                saveFile();
            },
        },
        { name: "Open File from File Explorer", func: openFolder },
        {
            name: "Create new file",
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                var filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (globalFilePath === "") {
                                return [2 /*return*/, 1];
                            }
                            return [4 /*yield*/, prompt("Enter File Name")];
                        case 1:
                            filename = _a.sent();
                            fs.writeFileSync(getCurrentFolderPath() + "/" + filename, "");
                            return [2 /*return*/];
                    }
                });
            }); },
        },
        {
            name: "Create new folder",
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                var filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (globalFilePath === "") {
                                return [2 /*return*/, 1];
                            }
                            return [4 /*yield*/, prompt("Enter Folder Name")];
                        case 1:
                            filename = _a.sent();
                            fs.mkdirSync(getCurrentFolderPath() + "/" + filename);
                            return [2 /*return*/];
                    }
                });
            }); },
        },
        {
            name: "Rename Current File",
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                var rename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (globalFilePath === "") {
                                return [2 /*return*/, 1];
                            }
                            return [4 /*yield*/, prompt("Enter file name: ")];
                        case 1:
                            rename = _a.sent();
                            fs.rename(globalFilePath, getCurrentFolderPath() + "/" + rename, function () { });
                            globalFilePath = getCurrentFolderPath() + "/" + rename;
                            plugins.forEach(function (plugin) {
                                plugin.fileload(new QuikFileLoadEvent(filename, globalFilePath));
                            });
                            return [2 /*return*/];
                    }
                });
            }); },
        },
        {
            name: "Developer Mode: ".concat(developerMode ? "On" : "Off"),
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    data = JSON.parse(fs.readFileSync(remote_1.app.getPath("userData") + "/settings.json", "utf8"));
                    data.developerMode = !data.developerMode;
                    developerMode = !developerMode;
                    fs.writeFileSync(remote_1.app.getPath("userData") + "/settings.json", JSON.stringify(data));
                    return [2 /*return*/];
                });
            }); },
        },
        {
            name: "Info",
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    dialog("What to show?", [
                        {
                            name: "Changelog",
                            func: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    alert("\n<h1>Info</h1>\n<h3>QuikQode Dev0.2.0</h3>\nBetter syntax highlighting\n+ New Folder\n+ Other Features\n<h3>QuikQode Dev0.1.0</h3>\nSome feature additions!\n+ Save As Command\n+ Info Command\n<h4>QuikQode Dev0.0.1</h4>\nMinor Fixes:\n+ Editor no longer breaks when editing any type of markup language files.\n<h3>QuikQode Dev0.0.0</h3>\n+ Editing\n+ Minor Syntax Highlighting\n+ Renaming files\n+ Renaming\n+ Built-in file explorer\n\n\t\t\t\t\t", true);
                                    return [2 /*return*/];
                                });
                            }); },
                        },
                        {
                            name: "About",
                            func: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    alert("Created by Silkyway. ©Silkyway 2022-2022");
                                    return [2 /*return*/];
                                });
                            }); },
                        },
                    ]);
                    return [2 /*return*/];
                });
            }); },
        },
        {
            name: "Save As",
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                var filepath;
                return __generator(this, function (_a) {
                    filepath = remote_1.dialog.showSaveDialogSync({});
                    fs.writeFileSync(filepath, input().value);
                    filename = filepath.replace(/^.*[\\\/]/, "");
                    globalFilePath = filepath;
                    origfile = input().value;
                    updateEditor();
                    return [2 /*return*/];
                });
            }); },
        },
        {
            name: "Open Terminal",
            func: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    openTerm();
                    return [2 /*return*/];
                });
            }); },
        },
        {
            name: "Open Calculator",
            func: openCalculator
        },
    ]);
}
document.addEventListener("keydown", function (e) {
    if (e.ctrlKey) {
        if (e.code === "KeyP") {
            openCommandPalette();
        }
    }
    if (e.code === "Escape") {
        if (dialogOpen) {
            dialogObject().style.display = "none";
            dialogOpen = false;
            dialogInput().addEventListener("keydown", function (e) { return promptfilter(e, []); });
        }
    }
    if (e.code === "KeyS") {
        if (e.ctrlKey) {
            saveFile();
        }
    }
    if (e.ctrlKey && e.shiftKey && e.code === "KeyI") {
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
input().addEventListener("scroll", function () {
    syncscroll(input());
});
setInterval(function () {
    syncscroll(input());
}, 10);
plugins.forEach(function (plugin) {
    plugin.load();
});
//# sourceMappingURL=editor.js.map
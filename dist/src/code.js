"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var remote_1 = require("@electron/remote");
var maximiseSvg = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-fullscreen\" viewBox=\"0 0 16 16\">\n  <path d=\"M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z\"/>\n</svg>\n";
var minimiseSvg = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-fullscreen-exit\" viewBox=\"0 0 16 16\">\n  <path d=\"M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z\"/>\n</svg>\n";
window.onload = function () {
    var minimiseBtn = document.querySelector(".minimise");
    var sizeBtn = document.querySelector(".big");
    var closeBtn = document.querySelector(".close");
    minimiseBtn.addEventListener("click", function () {
        remote_1.BrowserWindow.getFocusedWindow().minimize();
    });
    sizeBtn.addEventListener("click", function () {
        if (remote_1.BrowserWindow.getFocusedWindow().isMaximized()) {
            remote_1.BrowserWindow.getFocusedWindow().restore();
            document.querySelector('.big').innerHTML = maximiseSvg;
        }
        else {
            remote_1.BrowserWindow.getFocusedWindow().maximize();
            document.querySelector('.big').innerHTML = minimiseSvg;
        }
    });
    closeBtn.addEventListener("click", function () {
        var choice = remote_1.dialog.showMessageBoxSync({
            type: "warning",
            buttons: ["Yes", "No"],
            title: "Confirm",
            message: "Are you sure you want to quit?",
        });
        if (choice === 0) {
            remote_1.BrowserWindow.getFocusedWindow().close();
        }
    });
};
//# sourceMappingURL=code.js.map
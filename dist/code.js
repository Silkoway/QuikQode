"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var remote_1 = require("@electron/remote");
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
        }
        else {
            remote_1.BrowserWindow.getFocusedWindow().maximize();
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
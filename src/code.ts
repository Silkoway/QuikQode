import { BrowserWindow, dialog } from "@electron/remote";

window.onload = () => {


	const minimiseBtn = document.querySelector(".minimise");
    const sizeBtn = document.querySelector(".big")
    const closeBtn = document.querySelector(".close")

	minimiseBtn.addEventListener("click", () => {
		BrowserWindow.getFocusedWindow().minimize();
	});
    sizeBtn.addEventListener("click", () => {
        if (BrowserWindow.getFocusedWindow().isMaximized()) {
            BrowserWindow.getFocusedWindow().restore()
        } else {
            BrowserWindow.getFocusedWindow().maximize()
        }
        
    })
    closeBtn.addEventListener("click", () => {
        var choice = dialog.showMessageBoxSync({
            type: "warning",
            buttons: ["Yes", "No"],
            title: "Confirm",
            message: "Are you sure you want to quit?",
        });
        if (choice === 0) {
            BrowserWindow.getFocusedWindow().close();
        }
        
    })

    
};
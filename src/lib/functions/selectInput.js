function selectInput(focusedWindow) {
    focusedWindow.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].focus().select()`,
        false
    );
}
module.exports = selectInput;
function addTheme(windowObj, CSSString) {
    for (let i = 1; i <= 3; i++) {
        try {
        
            windowObj.webContents.insertCSS(CSSString);
        
            console.debug(`Theme Added for window ${windowObj.InternalId} attempt ${i}`);
        } catch (e) {
            console.error(`Error adding theme on window ${e} attempt ${i}`);
        }
    }
    windowObj.setBackgroundColor('#FFF');
}

module.exports = addTheme;
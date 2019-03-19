const {dialog} = require('electron')

function errorMessage(windowObject, errorCode, errorDescription) {
    let id = windowObject.InternalId;
    if (errorCode > -6 || errorCode <= -300) {
        return;
    }
    dialog.showMessageBox(
        {
            title: 'Loading Failed',
            message: `loading Failed on window ${id} reason ${errorDescription} code ${errorCode}, do you want to try again?`,
            type: 'error',
            buttons: ['Try again please', 'Quit'],
            defaultId: 0
        },
        function (index) {
            // if clicked "Try again please"
            if (index === 0) {
                windowObject.reload();
            } else {
                process.exit();
            }
        }
    );
}

module.exports = errorMessage;
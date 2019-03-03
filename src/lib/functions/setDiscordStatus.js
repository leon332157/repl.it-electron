async function talkBoard(spliturl, windowObj) {
    let viewing;
    if (spliturl[3] !== undefined) {
        await windowObj.webContents.executeJavaScript(
            "document.getElementsByClassName('board-post-detail-title')[0].textContent",
            function(result) {
                viewing = `Viewing ${result}`;
            }
        ); // gets the repl talk post name
    } else {
        viewing = url;
    }
    let talkBoard = 'error';
    switch (spliturl[1]) {
        case 'announcements':
            talkBoard = 'Announcements';
            break;
        case 'ask':
            talkBoard = 'Ask';
            break;
        case 'challenge':
            talkBoard = 'Challenge';
            break;
        case 'learn':
            talkBoard = 'Learn';
            break;
        case 'share':
            talkBoard = 'Share';
            break;
        default:
            talkBoard = '';
    }
    return { viewing: viewing, talkBoard: talkBoard };
}

module.exports.talkBoard = talkBoard;

async function editing(spliturl, windowObj) {
    let fileName = 'Error';
    //let replName = 'Error';
    let replLanguage = 'Error';
    await windowObj.webContents.executeJavaScript(
        "document.querySelector('.file-header-name div').textContent",
        result => {
            fileName = result;
        }
    );
    /*await windowObj.webContents.executeJavaScript(
        "document.getElementsByTagName('title')[0].textContent.split('-').pop()",
        function (result) {
            replName = result;
        }
    );*/
    await windowObj.webContents.executeJavaScript(
        "document.querySelector('.workspace-header-description-container img')['title']",
        result => {
            replLanguage = result;
        }
    );

    let lang = fileName.split('.').slice(-1)[0]; // gets the file extension
    if (replLanguage === 'Nodejs') {
        lang = 'node';
    }
    const langsJson = {
        py: 'python',
        cpp: 'cpp',
        cs: 'csharp',
        html: 'html',
        css: 'css',
        js: 'javascript',
        node: 'nodejs',
        java: 'java',
        rb: 'ruby',
        txt: 'txt',
        go: 'go',
        lua: 'lua',
        sh: 'sh',
        Unknown: 'txt'
    };

    if (!(lang in langsJson)) {
        lang = 'Unknown';
    }
    return { fileName: fileName, lang: lang };
}
module.exports.editing = editing;

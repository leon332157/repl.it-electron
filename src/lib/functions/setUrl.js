//const getUrl = require('./getUrl');

function setUrl(windowObj) {
    //let urlnow = getUrl();
    if (windowObj === undefined) {
        return;
    }
    try {windowObj.webContents
            .executeJavaScript(
                `
users=document.querySelectorAll('.jsx-1145327309:not(.leaderboard-list-item),a.jsx-774577553')
for (user in users) {
try{
user=users[user]
if (user.textContent.startsWith('ReplTalk ')) {
user.classList.add('bot');
}
}catch(e){}
}`
            )
            .catch(ret => {});
    } catch (e) {}
}

module.exports = setUrl;
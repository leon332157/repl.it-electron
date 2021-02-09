const { ipcRenderer } = require('electron');

// Load all of the themes
let card = ({ name, user: author, img }) => {
    return `
    <div class="Gallery" id="${name}" onclick="theme(this)">
      <img src="${img}">
      <h1 title="${author}">${name}</h1>
    </div>
    `;
};
//
let themes = new Map();
// Load the cards
let start = async () => {
    let html = '';
    // Get all the cards
    let data = await fetch(
        'https://reflux-marketplace.coolcodersj.repl.co/apiv1'
    );
    let { theme } = await data.json();
    theme.map((elm) => {
        themes.set(elm.name, elm);
        html += card(elm);
    });
    let content = document.querySelector('body > section');
    content.innerHTML = html;
};
let search = (key) => {
    const fuse = new Fuse([...themes.values()], {
        includeScore: true,
        keys: [
            {
                name: 'name',
                weight: 0.9
            },
            {
                name: 'user',
                weight: 0.2
            }
        ]
    });
    const result = key
        ? fuse.search(key).map((e) => e.item.name)
        : [...themes.keys()];
    let html = '';
    [...themes.values()].forEach((elm) => {
        if (result.includes(elm.name)) {
            themes.set(elm.name, elm);
            html += card(elm);
        }
    });
    let content = document.querySelector('body > section');
    content.innerHTML = html;
};
// When the user clicks on the button, send a message over ipc
let theme = (c) => {
    let { 'code-jswa': code } = themes.get(c.id);
    ipcRenderer.send('Theme', code);
    window.close();
};
window.onload = () => {
    start();
};

console.log(`${__filename} preloaded`);

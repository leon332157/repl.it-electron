const requests = require('axios');
let Themes = {'Dark (Old)': 'old_dark'};

Array.prototype.append = Array.prototype.push;

String.prototype.capitalize = function () {
    return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
        return p1 + p2.toUpperCase();
    });
};
const print = console.log;

async function getAllThemes() {
    var themes = {};
    try {
        var res = await requests.get('https://www.darktheme.tk/themes.json')
    } catch (e) {
        console.error(e)
    }
    var raw_themes = res.data;
    for (let key in raw_themes) {
        themes[key.capitalize()] = raw_themes[key]
    }


    for (let theme in themes) {
        try {
            var res = await requests.get(`https://www.darktheme.tk/theme.css?${themes[theme]}`)
        } catch (e) {
            console.error(e)
        }
        Themes[theme] = res.data
    }
    print(Themes)
}

getAllThemes().finally();
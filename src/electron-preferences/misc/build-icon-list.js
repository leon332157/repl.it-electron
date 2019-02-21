'use strict';

const Handlebars = require('handlebars');
const glob = require('glob');
const path = require('path');
const srcFolder = path.resolve(__dirname, '../assets/svg');

const tpl = Handlebars.compile(`
<table style="width: 100%;">
    <thead>
        <tr>
            <th>Name</th>
            <th>Icon</th>
        </tr>
    </thead>
<tbody>
    {{#each icons}}
        <tr>
            <td>{{name}}</td>
            <td><img src="{{{path}}}" height="40" width="40" /></td>
        </tr>
    {{/each}}
</tbody>
</table>
`);

const icons = glob.sync('*.svg', {
    'cwd': srcFolder
})
    .map((icon) => {
        return {
            'path': `assets/svg/${icon}`,
            'name': path.basename(icon, '.svg')
        };
    });

const rendered = tpl({
    'icons': icons
});

console.log(rendered);

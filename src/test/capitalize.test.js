let capitalize = require('../lib/functions/capitalize');
let assert = require('assert');

describe('capitalize', () => {
    it('one word', () => {
        let text = 'iota'
        let capitalizedText = capitalize(text);
        assert(capitalizedText, 'Iota');
    });

    it('two words', () => {
        let text = 'delta echo'
        let newString = capitalize(text);
        assert(newString, 'Delta Echo');
    });
});


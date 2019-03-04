let capitalizeFn = require('../capitalize');

describe('capitalize', () => {
    String.prototype.capitalize = capitalizeFn;

    test('one word', () => {
        let text = 'iota'
        let capitalizedText = text.capitalize();
        expect(capitalizedText).toBe('Iota');
    });

    test('two words', () => {
        let text = 'delta echo'
        let newString = text.capitalize();
        expect(newString).toBe('Delta Echo');
    });
});


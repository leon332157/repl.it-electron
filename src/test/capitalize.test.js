const path = require('path');
const capitalizeFn = require(path.join('..', 'lib', 'functions', 'capitalize'));

describe('capitalize', function () {
    test('one word', function() {
        let text = 'iota';
        let capitalizedText = capitalizeFn(text);
        expect(capitalizedText).toBe('Iota');
    });

    test('two words', function() {
        let text = 'delta echo';
        let newString = capitalizeFn(text);
        expect(newString).toBe('Delta Echo');
    });
});

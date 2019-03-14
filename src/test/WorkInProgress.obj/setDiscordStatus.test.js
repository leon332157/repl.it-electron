const path = require('path');
const { talkBoard, editing } = require(path.join(
    '..',
    'lib',
    'functions',
    'setDiscordStatus'
));
const chaiAsPromised = require('chai-as-promised');
const { test, describe } = require('mocha');
const { Application } = require('spectron');
const chai = require('chai');
let assert = chai.assert;

chai.use(chaiAsPromised);
chai.should();
describe('talkBoard', function() {
    beforeEach(function() {
        this.timeout(10e3);
        this.app = new Application({
            // Your electron path can be any binary
            // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
            // But for the sake of the example we fetch it from our node_modules.
            path: require('electron'),
            args: [path.join('.', 'test', 'testBoard')]
        });
        return this.app.start();
    });
    test('announcemants', function() {
        this.timeout(30e3);
        this.app.browserWindow.webContents = this.app.webContents;
        return assert.eventually.equal(
            talkBoard(
                ['talk', 'announcements', 'sparklesIntroduce-yourself', '4944'],
                this.app.browserWindow
            ),
            {
                viewing: 'sparklesIntroduce-yourself',
                talkBoard: 'announcements'
            }
        );
    });
});

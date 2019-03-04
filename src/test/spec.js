const Application = require('spectron').Application
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const electronPath = require('electron');
const path = require('path')

chai.should();
chai.use(chaiAsPromised);

describe('Application launch', function () {
    this.timeout(100000);

    beforeEach(function () {
        this.app = new Application({
            path: electronPath,
            args: [path.join(__dirname, '..')]
        });
        return this.app.start()
    })

    beforeEach(function () {
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness
    })

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    })

    it('opens a window', function () {
        return this.app.client.getWindowCount().then((num)=>{
            console.log(num)
            /*.browserWindow.isMinimized().should.eventually.be.false
            .browserWindow.isVisible().should.eventually.be.true
            .browserWindow.isFocused().should.eventually.be.true
            .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
            .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0)
    */})})
});
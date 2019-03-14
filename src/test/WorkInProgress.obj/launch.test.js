let Application = require('spectron').Application;
let assert = require('assert');

let app = new Application({
    path: 'electron-prebuilt',
    args: [
        '../main'
    ]
});

// Test to verify that visible window is opened with title
app.start()
    .then(function() {
        // Check if the window is visible
        return app.browserWindow.isVisible();
    })
    .then(function(isVisible) {
        // Verify the window is visible
        assert.equal(isVisible, true);
    })
    .then(function() {
        // Get the window's title
        return app.client.getTitle();
    })
    .then(function(title) {
        // Verify the window's title
        assert.equal(title, 'My App');
    })
    .then(function() {
        // Stop the application
        return app.stop();
    })
    .catch(function(error) {
        // Log any failures
        console.error('Test failed', error.message);
    });

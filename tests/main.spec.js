const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

var app = new Application({
  // Your electron path can be any binary
  // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
  // But for the sake of the example we fetch it from our node_modules.
  path: electronPath,

  // Assuming you have the following directory structure

  //  |__ my project
  //     |__ ...
  //     |__ main.js
  //     |__ package.json
  //     |__ index.html
  //     |__ ...
  //     |__ tests
  //        |__ main.spec.js  <- You are here! ~ Well you should be.

  // The following line tells spectron to look and use the main.js file
  // and the package.json located 1 level above.
  args: [path.join(__dirname, '..')]
})

describe('Application launch', function () {

  beforeEach(function () {
    return app.start()
  })

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  test('opens a window', function () {
    return app.client.getWindowCount().then(function (count) {
      expect(count).toEqual(1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

})

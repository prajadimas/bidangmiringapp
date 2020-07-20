// handle setupevents as quickly as possible
const setupEvents = require('./setupevents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return
}

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, session } = require('electron')
const os = require('os')
const path = require('path')
const url = require('url')
const WebSocket = require('ws')
const SerialPort = require('serialport')
const Store = require('electron-store')

const store = new Store()

// store.set('unicorn', '🦄')
// console.log('Unicorn Stored ', store.get('unicorn'))

// Initiate socket, timeout prop, userid, connection string and iniate serialPortLists
var socket
var timeoutConn
var reconnectInterval = 1 * 1000 * 60
var userid = ''
var connString = ''
var serialPort
var serialPortLists = []

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
		height: 720,
    webPreferences: {
      // nodeIntegration: true,
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'Icon.png'),
    'min-width': 500,
    'min-height': 200,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  })

  if (mainWindow) {
    setInterval(function () {
      SerialPort.list()
      .then(ports => {
        if (JSON.stringify(ports) !== JSON.stringify(serialPortLists)) {
          // console.log('Ports ', ports)
          // console.log('SerialPort Lists ', serialPortLists)
          serialPortLists = ports
          mainWindow.webContents.send('fromMain', {
            elementid: 'serialport-list',
            value: ports
          })
        }
      })
      .catch(err => {
        console.log('Error ', err)
      })
    }, 1000)
  }

})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('toMain', (event, args) => {
  // console.log('Event ', event)
  // console.log('Args ', args)
  if (args.state === 'reload list') {
    serialPortLists = []
  } else if (args.state === 'preferences val') {
    console.log('Args Value ', args.val)
    try {
      store.set('serialport', args.val.serialport)
      store.set('baudrate', args.val.baudrate)
      mainWindow.webContents.send('fromMain', {
        elementid: 'notification',
        value: 'Preferences Saved'
      })
    } catch (error) {
      console.log('Error ', error)
      mainWindow.webContents.send('fromMain', {
        elementid: 'notification',
        value: 'Failed to Save Preferences'
      })
    }
  } else if (args.state === 'check preferences') {
    console.log('Serial Port ', store.get('serialport'))
    console.log('Baud Rate ', store.get('baudrate'))
    if (store.get('serialport') && store.get('baudrate')) {
      mainWindow.webContents.send('fromMain', {
        elementid: 'container-preferences',
        value: {
          serialport: store.get('serialport'),
          baudrate: store.get('baudrate')
        }
      })
    }
  } else if (args.state === 'callibrating sensor') {
    if (store.get('serialport')) {
      if (serialPort) {
        if (serialPort.isOpen) {
          serialPort.flush()
          serialPort.close()
        }
        serialPort = new SerialPort(store.get('serialport'), {
          baudRate: Number(store.get('baudrate'))
        },
        function (err) {
          if (err) {
            console.log('Error ', err)
          } else {
            console.log('Serial Port is Open ', serialPort.isOpen)
            serialPort.on('data', function (data) {
              // get buffered data and parse it to an utf-8 string
              console.log('Data ', data.toString('utf-8'))
              mainWindow.webContents.send('fromMain', {
                elementid: 'sensor-stat',
                value: data.toString('utf-8')
              })
            })
          }
        })
      } else {
        serialPort = new SerialPort(store.get('serialport'), {
          baudRate: Number(store.get('baudrate'))
        },
        function (err) {
          if (err) {
            console.log('Error ', err)
          } else {
            console.log('Serial Port is Open ', serialPort.isOpen)
            serialPort.on('data', function (data) {
              // get buffered data and parse it to an utf-8 string
              console.log('Data ', data.toString('utf-8'))
              mainWindow.webContents.send('fromMain', {
                elementid: 'sensor-stat',
                value: data.toString('utf-8')
              })
            })
          }
        })
      }
    } else {
      mainWindow.webContents.send('fromMain', {
        elementid: 'notification',
        value: 'Please Select Serial Port First in Preferences'
      })
    }
  } else if (args.state === 'experiment data') {
    if (store.get('serialport')) {
      if (serialPort) {
        if (serialPort.isOpen) {
          serialPort.flush()
          serialPort.close()
        }
        serialPort = new SerialPort(store.get('serialport'), {
          baudRate: Number(store.get('baudrate'))
        },
        function (err) {
          if (err) {
            console.log('Error ', err)
          } else {
            console.log('Serial Port is Open ', serialPort.isOpen)
            serialPort.on('data', function (data) {
              // get buffered data and parse it to an utf-8 string
              console.log('Data ', data.toString('utf-8'))
              mainWindow.webContents.send('fromMain', {
                elementid: 'experiment-data',
                value: data.toString('utf-8')
              })
            })
          }
        })
      } else {
        serialPort = new SerialPort(store.get('serialport'), {
          baudRate: Number(store.get('baudrate'))
        },
        function (err) {
          if (err) {
            console.log('Error ', err)
          } else {
            console.log('Serial Port is Open ', serialPort.isOpen)
            serialPort.on('data', function (data) {
              // get buffered data and parse it to an utf-8 string
              console.log('Data ', data.toString('utf-8'))
              mainWindow.webContents.send('fromMain', {
                elementid: 'experiment-data',
                value: data.toString('utf-8')
              })
            })
          }
        })
      }
    } else {
      mainWindow.webContents.send('fromMain', {
        elementid: 'notification',
        value: 'Please Select Serial Port First in Preferences'
      })
    }
  } else if (args.state === 'reset value') {
    if (serialPort) {
      if (serialPort.isOpen) {
        console.log('Send Signal Reset (R)')
        serialPort.write('R')
      }
    }
  }
})

var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var Menu = require('menu');
var MenuItem = require('menu-item');
var ipc = require('ipc');
// var remote = require('remote');
var dialog = require('dialog');
var fs = require('fs');

var menu = new Menu();

// var jquery = require('jquery.js');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Create the menubar
// var template = [{
//   label: 'File',
//   submenu: [{
//     label: 'New',
//     accelerator: 'CmdOrCtrl+N',
//     role: 'new',
// }, {
//   label: 'Save',
//   accelerator: 'CmdOrCtrl+S',
//   role: 'save',
// }, {
//   label: 'Save As',
//   accelerator: 'CmdOrCtrlSh+Shift+S',
//   role: 'saveAs',
// }, ]
// }, ];

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // Make the window fill the screen
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.openDevTools();

  // Global filename
  var filename;

  var appmenu_template = [{
    label: 'Proton',
    submenu: [{
      label: 'About Proton',
      click: function() {
        ipc.send('open-url-in-external', 'http://github/steventhanna/proton/')
      }
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function() {
        ipc.send('close')
      }
    }]
  }, {
    label: 'File',
    submenu: [{
      label: 'Open File',
      accelerator: 'CmdOrCtrl+O',
      click: function() {
        // ipc.send('open-file-dialog')
        filename = dialog.showOpenDialog({
          properties: ['openFile'],
          // restrict to markdown files only
          filters: [{
            name: 'Markdown',
            extensions: ['md']
          }],
        });
        // What do you know it works.
        console.log(filename);
        if (filename[0] == undefined) {
          dialog.showErrorBox("Uh-Oh!", "The file could not be opened. -1");
        } else {
          try {
            var string = filename[0];
            console.log("STRING: " + string);
            // fs.openSync(string);
            // var data = fs.readFileSync(path, 'utf8');
            var data = fs.readFile(string, 'utf8', function(err, data) {
              if (err) throw err;
              console.log(data);
              mainWindow.send('fileContent', data);
            });
            // console.log(data);
          } catch (err) {
            dialog.showErrorBox("Uh-Oh!", "The file could not be opened. -2");
            console.log(err);
          }
        }
        // console.log(filename);
      }
    }, {
      label: 'New File',
      accelerator: 'CmdOrCtrl+N',
      click: function() {
        console.log("NEW FILE CLICKED");
      }
    }, {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      click: function() {
        var string = filename[0];
        ipc.on('fileSave', fileData => {
          fs.writeFile(string, fileData, function(err) {
            if (err) throw err;
            console.log("FILE SAVED");
          });
        });
      },
    }]
  }, {
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }, ]
  }, {
    label: 'Window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'Command+M',
      click: function() {
        ipc.send('minimize')
      }
    }, {
      label: 'Toggle Full Screen',
      accelerator: 'Command+Enter',
      // click: onfullscreentoggle
    }]
  }, {
    label: 'Help',
    submenu: [{
      label: 'Report Issue',
      click: function() {
        ipc.send('open-url-in-external', 'https://github.com/mafintosh/playback/issues')
      }
    }, {
      label: 'View Source Code on GitHub',
      click: function() {
        ipc.send('open-url-in-external', 'https://github.com/mafintosh/playback')
      }
    }, {
      type: 'separator'
    }, {
      label: 'Releases',
      click: function() {
        ipc.send('open-url-in-external', 'https://github.com/mafintosh/playback/releases')
      }
    }]
  }]
  var appmenu = Menu.buildFromTemplate(appmenu_template)
  Menu.setApplicationMenu(appmenu)

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
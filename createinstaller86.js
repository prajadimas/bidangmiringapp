const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
.then(createWindowsInstaller)
.catch((error) => {
  console.log('Error ', error.message || error)
  process.exit(1)
})

function getInstallerConfig () {
  console.log('Creating Windows Installer ...')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, '.build')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'bidangmiring-apps-win32-ia32/'),
    authors: '4DS Edu',
    noMsi: true,
    outputDirectory: outPath,
    exe: 'bidangmiring-apps.exe',
    setupExe: 'BidangMiringAppsInstaller.exe',
    setupIcon: path.join(rootPath, 'Icon.ico')
  })
}

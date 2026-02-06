const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

function createWindow() {
    // Configurações da Janela Desktop
    const win = new BrowserWindow({
        width: 1200,
        height: 850,
        minWidth: 800,
        minHeight: 600,
        title: "Gestor de Treinos Funcionais",
        icon: path.join(__dirname, 'assets/icon.png'), // Se tiver um ícone
        webPreferences: {
            // SEGURANÇA: Importante para apps modernos
            nodeIntegration: true, 
            contextIsolation: false, 
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js') 
        }
    });

    // Carrega o seu arquivo HTML
    win.loadFile('src/index.html');

    // Remove a barra de menu padrão (opcional, para parecer mais "app")
    // win.setMenuBarVisibility(false);

    // Abre links externos (como redes sociais) no navegador padrão do PC
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// Inicialização do App
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Fecha o processo quando todas as janelas fecham (exceto no Mac)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
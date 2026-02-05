const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let envioWindow = null;

// 🔥 Desabilita CORS e segurança GLOBALMENTE
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,IsolateOrigins,site-per-process');
app.commandLine.appendSwitch('allow-running-insecure-content');
app.commandLine.appendSwitch('disable-site-isolation-trials');

// ✅ Libera CORS para o CRM específico
const CRM_DOMAIN = 'https://adminsupercrm.softwaresdeautomacao.com';

app.on('session-created', (sess) => {
  sess.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = CRM_DOMAIN;
    details.requestHeaders['Referer'] = CRM_DOMAIN;
    callback({ requestHeaders: details.requestHeaders });
  });

  sess.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders || {};
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS, PATCH'];
    responseHeaders['Access-Control-Allow-Headers'] = ['*'];
    responseHeaders['Access-Control-Allow-Credentials'] = ['true'];
    callback({ responseHeaders });
  });
});

app.whenReady().then(async () => {
  const totalAbas = 54;
  const extensionPath = path.join(__dirname, 'extensao-crm');
  
  console.log("🔧 Configurando sessões com CORS desabilitado e CRM liberado...");
  
  // ✅ Configura todas as sessões PRIMEIRO
  for (let i = 0; i < totalAbas; i++) {
    const sessao = session.fromPartition(`persist:whatsapp${i}`);
    
    // Libera CORS completamente
    sessao.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['Origin'] = CRM_DOMAIN;
      details.requestHeaders['Referer'] = CRM_DOMAIN;
      callback({ requestHeaders: details.requestHeaders });
    });

    sessao.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = details.responseHeaders || {};
      responseHeaders['Access-Control-Allow-Origin'] = ['*'];
      responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS, PATCH'];
      responseHeaders['Access-Control-Allow-Headers'] = ['*'];
      responseHeaders['Access-Control-Allow-Credentials'] = ['true'];
      callback({ responseHeaders });
    });

    // ✅ Adiciona permissões específicas para o CRM
    sessao.setPermissionRequestHandler((webContents, permission, callback) => {
      callback(true); // Permite tudo
    });
  }
  
  console.log("✅ Sessões configuradas!");
  
  // ✅ Carrega extensões em todas as abas
  console.log("🚀 Carregando extensão CRM...");
  // Carrega a extensão apenas nas 5 primeiras sessões (índices 0 a 4)
  for (let i = 0; i < 5; i++) {
    const sessao = session.fromPartition(`persist:whatsapp${i}`);
    
    try {
      // O await é importante aqui
      await sessao.loadExtension(extensionPath, { allowFileAccess: true });
      console.log(`✅ Extensão carregada na aba ${i}`);
    } catch (err) {
      console.error(`❌ Erro ao carregar extensão na aba ${i}:`, err);
    }
  } // ✅ Cria janela principal
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      webSecurity: false, // Necessário para a extensão e CORS
      allowRunningInsecureContent: true, // Necessário para a extensão e CORS
      // preload: path.resolve(__dirname, 'preload.js') // Removido o preload.js
    }
  });

  global.mainWindow = mainWindow;

  // A lógica de registro do main-envio foi removida.

  mainWindow.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // ✅ Libera CORS na janela principal também
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = CRM_DOMAIN;
    details.requestHeaders['Referer'] = CRM_DOMAIN;
    callback({ requestHeaders: details.requestHeaders });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders || {};
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS, PATCH'];
    responseHeaders['Access-Control-Allow-Headers'] = ['*'];
    responseHeaders['Access-Control-Allow-Credentials'] = ['true'];
    callback({ responseHeaders });
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.setZoomFactor(1.0);
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1).catch(() => {});
    console.log("🔍 Zoom fixado em 100%");
  });

  mainWindow.webContents.on("did-attach-webview", (event, webContents) => {
    webContents.setZoomFactor(1.0);
    webContents.setVisualZoomLevelLimits(1, 1).catch(() => {});
    
    // ✅ Libera CORS na webview
    webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['Origin'] = CRM_DOMAIN;
      details.requestHeaders['Referer'] = CRM_DOMAIN;
      callback({ requestHeaders: details.requestHeaders });
    });

    webContents.session.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = details.responseHeaders || {};
      responseHeaders['Access-Control-Allow-Origin'] = ['*'];
      responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS, PATCH'];
      responseHeaders['Access-Control-Allow-Headers'] = ['*'];
      responseHeaders['Access-Control-Allow-Credentials'] = ['true'];
      callback({ responseHeaders });
    });

    console.log("🔍 Webview configurada com CORS liberado");

    // A lógica de injeção de script para auto-fechamento de modal foi removida.
  });
});

// A lógica de ipcMain.on("open-envio") foi removida.

// ✅ IPC para carregar a extensão e recarregar a aba
ipcMain.on('load-extension-and-reload', async (event, index) => {
  const sessao = session.fromPartition(`persist:whatsapp${index}`);
  const extensionPath = path.join(__dirname, 'extensao-crm');

  try {
    await sessao.loadExtension(extensionPath, { allowFileAccess: true });
    console.log(`✅ Extensão carregada via IPC na aba ${index}`);
    
    // Envia de volta para o index.html para ele fazer o reload
    event.sender.send('do-reload', index);
  } catch (err) {
    console.error(`❌ Erro ao carregar extensão via IPC na aba ${index}:`, err);
  }
});

// ✅ Lógica de Respostas Rápidas (Agora deve funcionar, pois a extensão está carregada)
ipcMain.on('send-quick-reply', (event, { msg, index }) => {
  // Acessa todas as webContents dentro da janela principal
  const allWebContents = mainWindow.webContents.getAllWebContents();
  // Filtra apenas as webviews (que são as abas)
  const webviews = allWebContents.filter(wc => wc.getType() === 'webview');
  // Acessa a webview alvo pelo índice
  const targetWebview = webviews[index];

  if (targetWebview) {
    // Injeta o código para colar o texto no campo de mensagem do WhatsApp Web
    // O texto da mensagem é escapado para evitar erros de sintaxe no JS injetado
    const safeMsg = JSON.stringify(msg);
    
    const jsCode = `
      (function() {
        // O seletor abaixo deve ser o seletor que a extensão espera
        const input = document.querySelector('[contenteditable="true"][data-tab="10"]');
        if (input) {
          input.focus();
          // Usa o texto escapado
          document.execCommand('insertText', false, ${safeMsg});
          console.log('Mensagem de resposta rápida injetada.');
          return true;
        }
        console.error('Campo de mensagem do WhatsApp Web não encontrado.');
        return false;
      })();
    `;

    targetWebview.executeJavaScript(jsCode)
      .then(success => {
        if (!success) {
          console.error('Falha ao injetar resposta rápida na aba ' + index);
        }
      })
      .catch(err => console.error('Erro ao executar JS na webview ' + index + ': ', err));
  } else {
    console.error('Webview para o índice ' + index + ' não encontrada.');
  }
});

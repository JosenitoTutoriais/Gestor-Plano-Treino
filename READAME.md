==============================================================================
             GESTOR DE PLANO DE TREINO (DESKTOP) - MANUAL DE USO
==============================================================================

SOBRE O PROJETO
---------------
Este é um sistema desktop desenvolvido em Electron e HTML/JS para criação, 
gestão e impressão de planos de treino funcionais. O sistema permite salvar 
treinos localmente, exportar para PDF e gerar backups.

------------------------------------------------------------------------------
1. PRÉ-REQUISITOS
------------------------------------------------------------------------------
Para rodar este projeto, você precisa ter instalado no seu computador:

1. Node.js (Versão LTS recomendada).
   - Baixe em: https://nodejs.org/

------------------------------------------------------------------------------
2. ESTRUTURA DE ARQUIVOS NECESSÁRIA
------------------------------------------------------------------------------
Antes de instalar, certifique-se de que sua pasta tem os seguintes arquivos:

/SuaPastaDoProjeto
  |-- package.json   (O arquivo de configuração que você já tem)
  |-- index.html     (O código visual que você já tem)
  |-- main.js        (CRUCIAL: Você precisa criar este arquivo, veja abaixo)
  |-- /assets        
      |-- /js        (Onde devem estar o jspdf.min.js, tailwind, etc.)
      |-- /fonts     (Se estiver usando fontes locais)
      |-- icon.png   (Ícone do app, opcional)

*** IMPORTANTE: O ARQUIVO main.js ***
Como o projeto usa Electron, ele precisa de um arquivo "cérebro". 
Crie um arquivo chamado 'main.js' na raiz da pasta e cole o seguinte código:

--- INICIO DO main.js ---
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Necessário para algumas interações simples
    },
    icon: path.join(__dirname, 'assets/icon.png') // Opcional
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false); // Remove o menu padrão do topo
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
--- FIM DO main.js ---

------------------------------------------------------------------------------
3. INSTALAÇÃO DAS DEPENDÊNCIAS
------------------------------------------------------------------------------
Abra o terminal (Prompt de Comando ou PowerShell) na pasta do projeto e execute:

   npm install

Isso vai baixar o "electron" e o "electron-builder" listados no seu package.json.
Aguarde o término (pode demorar alguns minutos dependendo da internet).

------------------------------------------------------------------------------
4. COMO RODAR O PROJETO
------------------------------------------------------------------------------
Para iniciar o aplicativo em modo de desenvolvimento:

   npm start

Uma janela deve abrir com o seu sistema de Gestão de Treinos.

------------------------------------------------------------------------------
5. COMO GERAR O EXECUTÁVEL (.exe)
------------------------------------------------------------------------------
Para criar um instalador ou executável para Windows (configurado no seu package.json):

   npm run dist

O arquivo final (.exe) será gerado na pasta "dist" que aparecerá dentro do projeto.

------------------------------------------------------------------------------
6. GUIA DE USO PARA O USUÁRIO
------------------------------------------------------------------------------

A) TELA INICIAL (LISTAGEM)
   - O sistema mostra todos os treinos salvos ("cards").
   - Botão "+ Novo": Abre o formulário para criar um treino do zero.
   - Botão "Exportar Backup": Baixa um arquivo .json com todos os seus treinos.
   - Botão "Importar JSON": Restaura treinos de um backup anterior.

B) CRIANDO/EDITANDO UM TREINO
   - Preencha os dados do cabeçalho (Professor, Data, Tema).
   - Selecione o público-alvo e materiais (checkboxes).
   - Tabelas (Aquecimento, Principal, Volta à Calma):
     * Clique em "+ Adicionar Linha" para inserir exercícios.
     * Clique no botão vermelho "X" para remover uma linha.
   - Ao finalizar, clique em "💾 Salvar Alterações".

C) NO CARD DO TREINO (FUNCIONALIDADES)
   - "👁️ Visualizar Detalhes": Abre uma janela estilo "folha A4" para leitura rápida.
   - "✏️ Editar": Volta para o formulário para alterar dados.
   - "👯 Copiar": Duplica o treino (útil para usar o mesmo modelo e mudar só a data).
   - "📄 Baixar PDF": Gera o PDF formatado e salva no computador.
   - "📱 Enviar WhatsApp": 
     * Baixa o PDF no computador.
     * Abre o WhatsApp Web com uma mensagem pronta.
     * Você deve arrastar o PDF baixado para a conversa do WhatsApp manualmente.

------------------------------------------------------------------------------
SOLUÇÃO DE PROBLEMAS COMUNS
------------------------------------------------------------------------------
1. Tela branca ou erro de script:
   - Verifique se a pasta 'assets/js' contém os arquivos citados no index.html
     (jspdf.umd.min.js, jspdf.plugin.autotable.min.js, etc).
   - Se não tiver os arquivos baixados, edite o 'index.html' e descomente as linhas
     que usam links "https://cdn..." e comente as linhas locais "./assets...".

2. O comando 'npm start' dá erro:
   - Verifique se criou o arquivo 'main.js' conforme explicado na seção 2.
==============================================================================
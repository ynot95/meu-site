# WhatsApp Web (protótipo)

Protótipo isolado de sessão própria de WhatsApp (via [Baileys](https://github.com/WhiskeySockets/Baileys)),
feito para você testar antes de decidir se isso vai ser integrado ao CRM da É Elétrica Engenharia.

Não usa a API oficial da Meta — conecta como um "dispositivo vinculado" do seu WhatsApp,
igual ao WhatsApp Web comum, mas com acesso programático às mensagens.

## Como rodar no seu computador

Pré-requisito: ter o [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).

1. Abra um terminal dentro desta pasta (`whats-web`).
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   npm start
   ```
4. Abra `http://localhost:3000` no navegador.
5. Escaneie o QR Code com o WhatsApp do celular:
   **WhatsApp → Configurações → Dispositivos conectados → Conectar um dispositivo**.
6. Pronto — mensagens recebidas nesse número vão aparecer na página em tempo real.

Na primeira conexão é criada uma pasta `auth_info/` com a sessão salva (não é enviada
pro Git — está no `.gitignore`). Enquanto essa pasta existir, não precisa escanear o
QR Code de novo ao reiniciar o servidor.

## O que este protótipo NÃO faz (de propósito)

- Não grava nada no Supabase do CRM.
- Não decide sozinho pra quem enviar automação.
- Não fica acessível pra ninguém além de quem tem acesso a este computador/servidor.

Isso é só pra você ver funcionando e decidir se quer levar pra frente.

## Depois de aprovar: próximos passos (não feitos ainda)

- Definir se será **um número único da empresa** ou um por vendedor.
- Definir quem poderá acessar essa tela dentro do CRM.
- Trocar o `console.log`/tela simples por gravação em uma tabela nova no Supabase
  (ex: `whatsapp_mensagens`), casando o número pelo padrão que o CRM já usa
  (últimos 8 dígitos do telefone — o campo `last8` já vem pronto em cada mensagem).
- Hospedar em um serviço que mantenha processo Node.js rodando 24h
  (ex: Railway ou Render — o Netlify não serve pra isso, só hospeda sites estáticos).

## Aviso sobre risco

Como não é a API oficial da Meta, existe (baixo, mas real) risco do WhatsApp bloquear
o número em uso caso identifique automação fora do padrão. Por isso este é um protótipo
de teste, não recomendado para o número principal de atendimento da empresa sem antes
avaliar o risco.

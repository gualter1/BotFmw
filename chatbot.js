const rgxClube = /clube:|time:/gmi
const rgxCapturaClube = /clube:.+|time:.+/gmi
const regexEmoji = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\u200B-\u200D\uFEFF]|[\r])|[~_+()]|⬜/g
const rgxAsterisco = /_|\*|,/gmi
const rgxBenfica =/[¹²³⁴⁵⁶⁷⁸⁹⁰]/gm
const rgxNome = /([A-Za-zÀ-ÿ.]+\s{1,2}){1,5}[A-Za-zÀ-ÿ.]+|[A-Za-zÀ-ÿ.]+/gmi
const rgxLimpeza = new RegExp (`${regexEmoji.source}|${rgxAsterisco.source}|${rgxBenfica.source}`, 'gmi')

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot está rodando!'));
app.listen(process.env.PORT || 3000);


const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

let timesPorGrupo = {}; // Objeto onde cada chave é o ID do grupo
let ultimaResetada = null; // Evita resetar várias vezes no mesmo minuto

setInterval(() => {
    const agora = new Date();
    const hora = agora.getHours();
    const minutos = agora.getMinutes();
    const dataHoje = agora.toDateString(); // ex: "Fri Jun 07 2025"

    if (hora === 23 && minutos === 59 && ultimaResetada !== dataHoje) {
        timesPorGrupo = {}; // Limpa tudo
        ultimaResetada = dataHoje; // Marca o dia em que foi resetado

        console.log('[Reset] timesPorGrupo zerado às 23:59h!');
    }
}, 60 * 1000); // Checa a cada 60 segundos (1 minuto)


client.on('message', async msg => {
    
    if (msg.body && msg.from.endsWith('@g.us') && msg.body.match(rgxCapturaClube)) {
        
        const grupoID = msg.from; // ID do grupo (ex: 551199999999-1111111111@g.us)
        console.log(grupoID);
        
    // Se o grupo ainda não estiver no objeto, cria ele
    if (!timesPorGrupo[grupoID]) {
        timesPorGrupo[grupoID] = '';
    } 

  // Executa se veio de um grupo e contém "clube:"
        //const msgRecebida = msg.body.match(rgxCapturaClube)
        const timeCapturado = nomeClube(msg.body)
        //console.log(timeCapturado)
        if (timeCapturado) {
        timesPorGrupo[grupoID] += timeCapturado + '\n'
    }
    //console.log(timesCapturados)
    
    const chat = await msg.getChat();

    await delay(1000); //delay de 3 segundos
    await chat.sendStateTyping(); // Simulando Digitação
    await delay(1000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
    await client.sendMessage(grupoID, `*Cartelas enviadas:*\n\n${timesPorGrupo[grupoID]}\n*Boa sorte a todes e que perca o pior, Faz o L*`); //Primeira mensagem de texto
    
    
}

});

function nomeClube (cartela) {
    let clube = cartela.replace(rgxLimpeza, '').match(rgxCapturaClube) || ['clube: Nome do time']
    clube = clube.join().replace(rgxClube, '').replace(rgxAsterisco, '').match(rgxNome)

    !clube ? clube = ['Nome do time'] : clube
    clube.length > 1 ? clube = clube.join().replace(',', ' ').split() : clube
        
    clube = padronizaNome(clube.join())
    return clube
}


function padronizaNome(nomes) {
    let nomePadronizado = []
    let nomesMinusculo = nomes.toLowerCase()
    nomesMinusculo = nomesMinusculo.length < 2 ? nomesMinusculo + nomesMinusculo : nomesMinusculo 
    const dividiNome = nomesMinusculo.split('') // armazena o array do nome

    const letraInicio = dividiNome[0].toUpperCase()
    dividiNome.splice(0, 1, letraInicio)
    nomePadronizado.push(dividiNome.join('').trim())

    return nomePadronizado
}



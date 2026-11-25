const express=require('express');const app=express();const http=require('http').createServer(app);const io=require('socket.io')(http);
app.use(express.static('public'));app.use(express.static(__dirname));
let jogadores={},iniciado=false,tempo=90,feed=[],duelos={};
let perguntas=[
{q:"Qual esporte usa rede e a bola NÃO pode cair?",a:["Vôlei","Futebol","Basquete","Tênis"],c:0},
{q:"Quantos jogadores tem um time de Futsal em quadra?",a:["5","11","7","6"],c:0},
{q:"Qual músculo usamos no AGACHAMENTO?",a:["Quadríceps","Bíceps","Peito","Pescoço"],c:0},
{q:"O que é AQUECIMENTO?",a:["Preparar o corpo p/ exercício","Dormir","Comer","Jogar videogame"],c:0},
{q:"Qual capacidade é correr rápido?",a:["Velocidade","Força","Flexibilidade","Equilíbrio"],c:0},
{q:"Qual esporte usa CESTA?",a:["Basquete","Vôlei","Handebol","Natação"],c:0},
{q:"O que é ALONGAMENTO?",a:["Esticar os músculos","Correr","Pular","Lutar"],c:0},
{q:"Quantas faltas o jogador pode fazer no Basquete p/ ser expulso?",a:["5","3","10","2"],c:0},
{q:"Qual esporte é jogado com RAQUETE?",a:["Tênis","Futebol","Vôlei","Judô"],c:0},
{q:"O que melhora a PRANCHA?",a:["Core / Abdômen","Braço só","Perna só","Nada"],c:0},
{q:"Qual é o esporte mais popular do Brasil?",a:["Futebol","Tênis","Golfe","Surfe"],c:0},
{q:"O que devemos fazer ANTES de treinar?",a:["Aquecimento","Dormir","Comer pizza","Nada"],c:0},
{q:"Qual parte do corpo usamos no CABECEIO?",a:["Cabeça","Pé","Mão","Joelho"],c:0},
{q:"Handebol usa qual parte do corpo?",a:["Mãos","Pés","Cabeça","Joelho"],c:0},
{q:"O que é FREQUÊNCIA CARDÍACA?",a:["Batimentos do coração","Velocidade do chute","Altura do pulo","Peso"],c:0}
];
function addFeed(t){feed.unshift(t);if(feed.length>4)feed.pop()}
io.on('connection',s=>{
s.on('entrar',d=>{jogadores[s.id]={id:s.id,nome:d.nome||'Player',skin:d.skin||'🦊',x:100+Math.random()*600,y:100+Math.random()*300,vida:100,vivo:true,kills:0};addFeed(`🟢 ${d.nome} entrou na batalha!`)});
s.on('mover',p=>{let j=jogadores[s.id];if(!j||!j.vivo||!iniciado)return;j.x=p.x;j.y=p.y;
Object.values(jogadores).forEach(o=>{if(o.id!==j.id&&o.vivo&&!duelos[j.id]&&!duelos[o.id]){let dist=Math.hypot(j.x-o.x,j.y-o.y);if(dist<45){let per=perguntas[Math.floor(Math.random()*perguntas.length)];let idD=Date.now()+'';duelos[j.id]=idD;duelos[o.id]=idD;io.to(j.id).emit('duelo',{oponente:o.nome,pergunta:per,meuId:j.id});io.to(o.id).emit('duelo',{oponente:j.nome,pergunta:per,meuId:o.id});}}})});
s.on('responder',d=>{let j=jogadores[s.id];if(!j)return;let idD=duelos[s.id];if(!idD)return;let outro=Object.values(jogadores).find(o=>duelos[o.id]===idD&&o.id!==s.id);if(!outro)return;delete duelos[s.id];delete duelos[outro.id];if(d.correta){j.kills++;outro.vida-=50;addFeed(`⚡ ${j.nome} acertou e tirou 50 de vida de ${outro.nome}!`);if(outro.vida<=0){outro.vivo=false;addFeed(`💀 ${j.nome} ELIMINOU ${outro.nome} com conhecimento!`)}io.to(outro.id).emit('duelo-fim',{resultado:'perdeu'});s.emit('duelo-fim',{resultado:'ganhou'})}else{j.vida-=30;addFeed(`❌ ${j.nome} errou a pergunta! -30 vida`);s.emit('duelo-fim',{resultado:'errou'})}});
s.on('comecar',()=>{iniciado=true;tempo=90;addFeed('🏁 PARTIDA COMEÇOU! Encoste p/ duelar!')});
s.on('disconnect',()=>{delete jogadores[s.id]});
});
setInterval(()=>{if(iniciado&&tempo>0){tempo--;if(tempo<=0){let vivos=Object.values(jogadores).filter(j=>j.vivo);if(vivos.length>0){let v=vivos.sort((a,b)=>b.kills-a.kills)[0];addFeed(`🏆 CAMPEÃO: ${v.nome} - ${v.kills} kills!`)}iniciado=false}}
io.emit('estado',{jogadores,tempo,zona:220,feed})},500);
const PORT=process.env.PORT||3000;http.listen(PORT,()=>console.log('on '+PORT));

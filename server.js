const express=require('express');const app=express();const http=require('http').createServer(app);const io=require('socket.io')(http);
app.use(express.static('public'));app.use(express.static(__dirname));
let jogadores={},iniciado=false,tempo=300,feed=[],duelos={},tempoPartida=300;
let perguntas=[
{q:"Qual esporte usa rede e a bola NÃO pode cair?",a:["Vôlei","Futebol","Basquete","Tênis"],c:0},
{q:"Quantos jogadores tem um time de Futsal em quadra?",a:["5","11","7","6"],c:0},
{q:"Qual músculo usamos no AGACHAMENTO?",a:["Quadríceps","Bíceps","Peito","Pescoço"],c:0},
{q:"O que é AQUECIMENTO?",a:["Preparar o corpo p/ exercício","Dormir","Comer","Jogar videogame"],c:0},
{q:"Qual capacidade é correr rápido?",a:["Velocidade","Força","Flexibilidade","Equilíbrio"],c:0},
{q:"Qual esporte usa CESTA?",a:["Basquete","Vôlei","Handebol","Natação"],c:0},
{q:"O que é ALONGAMENTO?",a:["Esticar os músculos","Correr","Pular","Lutar"],c:0},
{q:"Quantas faltas p/ ser expulso no Basquete?",a:["5","3","10","2"],c:0},
{q:"Qual esporte usa RAQUETE?",a:["Tênis","Futebol","Vôlei","Judô"],c:0},
{q:"O que melhora a PRANCHA?",a:["Core / Abdômen","Braço só","Perna só","Nada"],c:0},
{q:"Qual é o esporte mais popular do Brasil?",a:["Futebol","Tênis","Golfe","Surfe"],c:0},
{q:"O que devemos fazer ANTES de treinar?",a:["Aquecimento","Dormir","Comer pizza","Nada"],c:0},
{q:"Qual parte do corpo usamos no CABECEIO?",a:["Cabeça","Pé","Mão","Joelho"],c:0},
{q:"Handebol usa qual parte do corpo?",a:["Mãos","Pés","Cabeça","Joelho"],c:0},
{q:"O que é FREQUÊNCIA CARDÍACA?",a:["Batimentos do coração","Velocidade do chute","Altura do pulo","Peso"],c:0}
];
let perguntasPadrao=[...perguntas];
function addFeed(t){feed.unshift(t);if(feed.length>4)feed.pop()}
io.on('connection',s=>{
s.emit('lista-perguntas',perguntas);
s.emit('tempo-config',tempoPartida);
s.on('nova-pergunta',d=>{perguntas.push(d);io.emit('lista-perguntas',perguntas);addFeed(`🎯 Professor adicionou: ${d.q}`)});
s.on('limpar-perguntas',()=>{perguntas=[...perguntasPadrao];io.emit('lista-perguntas',perguntas)});
s.on('set-tempo',min=>{tempoPartida=min*60;tempo=tempoPartida;io.emit('tempo-config',tempoPartida);addFeed(`⏰ Tempo da partida: ${min} min`)});
s.on('entrar',d=>{jogadores[s.id]={id:s.id,nome:d.nome||'Player',skin:d.skin||'🦊',x:100+Math.random()*600,y:100+Math.random()*300,vida:100,vivo:true,kills:0,pontos:0,acertos:0};addFeed(`🟢 ${d.nome} entrou!`)});
s.on('mover',p=>{let j=jogadores[s.id];if(!j||!iniciado)return;j.x=p.x;j.y=p.y;
Object.values(jogadores).forEach(o=>{if(o.id!==j.id&&!duelos[j.id]&&!duelos[o.id]){let dist=Math.hypot(j.x-o.x,j.y-o.y);if(dist<50){let per=perguntas[Math.floor(Math.random()*perguntas.length)];let idD=Date.now()+'';duelos[j.id]=idD;duelos[o.id]=idD;io.to(j.id).emit('duelo',{oponente:o.nome,pergunta:per,meuId:j.id});io.to(o.id).emit('duelo',{oponente:j.nome,pergunta:per,meuId:o.id});}}})});
s.on('responder',d=>{let j=jogadores[s.id];if(!j)return;let idD=duelos[s.id];if(!idD)return;let outro=Object.values(jogadores).find(o=>duelos[o.id]===idD&&o.id!==s.id);if(!outro)return;delete duelos[s.id];delete duelos[outro.id];
if(d.correta){j.pontos+=100;j.acertos++;j.kills++;addFeed(`✅ ${j.nome} acertou! +100 PTS! Total: ${j.pontos}`);s.emit('duelo-fim',{resultado:'ganhou',pontos:j.pontos});io.to(outro.id).emit('duelo-fim',{resultado:'perdeu'})}else{addFeed(`❌ ${j.nome} errou! Continua com ${j.pontos} pts`);s.emit('duelo-fim',{resultado:'errou'})}});
s.on('comecar',()=>{iniciado=true;tempo=tempoPartida;Object.values(jogadores).forEach(j=>{j.pontos=0;j.acertos=0;j.kills=0;j.vida=100;j.vivo=true});addFeed(`🏁 COMEÇOU! ${Math.floor(tempoPartida/60)} MIN - Quem fizer MAIS PONTOS vence!`)});
s.on('disconnect',()=>{delete jogadores[s.id]});
});
setInterval(()=>{if(iniciado&&tempo>0){tempo--;if(tempo<=0){let ranking=Object.values(jogadores).sort((a,b)=>b.pontos-a.pontos).slice(0,3);let textoRanking=ranking.map((j,i)=>`${i===0?'🥇':i===1?'🥈':'🥉'} ${j.nome} - ${j.pontos} pts`).join(' | ');addFeed(`🏆 FIM! PÓDIO: ${textoRanking}`);io.emit('podio',ranking);iniciado=false;}}
io.emit('estado',{jogadores,tempo,zona:220,feed})},500);
const PORT=process.env.PORT||3000;http.listen(PORT,()=>console.log('on '+PORT));

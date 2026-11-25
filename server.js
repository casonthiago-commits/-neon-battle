const express=require('express');const app=express();const http=require('http').createServer(app);const io=require('socket.io')(http);
app.use(express.static('public'));app.use(express.static(__dirname));
let jogadores={},iniciado=false,tempo=300,feed=[],duelos={},tempoPartida=300;
const MAX_JOGADORES = 30;
let perguntas=[
{q:"Qual esporte usa rede e a bola NÃO pode cair?",a:["Vôlei","Futebol","Basquete","Tênis"],c:0},
{q:"Quantos jogadores de linha tem o Futsal em quadra?",a:["5","11","7","6"],c:0},
{q:"Qual músculo usamos no AGACHAMENTO?",a:["Quadríceps","Bíceps","Peito","Pescoço"],c:0},
{q:"O que é AQUECIMENTO?",a:["Preparar o corpo p/ exercício","Dormir","Comer","Jogar videogame"],c:0},
{q:"Qual capacidade física é correr rápido?",a:["Velocidade","Força","Flexibilidade","Equilíbrio"],c:0},
{q:"Qual esporte usa CESTA?",a:["Basquete","Vôlei","Handebol","Natação"],c:0},
{q:"O que é ALONGAMENTO?",a:["Esticar os músculos","Correr","Pular","Lutar"],c:0},
{q:"Quantas faltas para ser expulso no Basquete?",a:["5","3","10","2"],c:0},
{q:"Qual esporte usa RAQUETE?",a:["Tênis","Judô","Vôlei","Futebol"],c:0},
{q:"O que melhora a PRANCHA?",a:["Core / Abdômen","Braço só","Perna só","Nada"],c:0},
{q:"Qual é o esporte mais popular do Brasil?",a:["Futebol","Tênis","Golfe","Surfe"],c:0},
{q:"O que devemos fazer ANTES de treinar?",a:["Aquecimento","Dormir","Comer pizza","Jogar"],c:0},
{q:"Qual parte do corpo usamos no CABECEIO?",a:["Cabeça","Pé","Mão","Joelho"],c:0},
{q:"Handebol usa qual parte do corpo?",a:["Mãos","Pés","Cabeça","Joelho"],c:0},
{q:"O que é FREQUÊNCIA CARDÍACA?",a:["Batimentos do coração","Força do chute","Altura do pulo","Peso"],c:0},
{q:"Qual esporte é jogado na piscina?",a:["Polo Aquático","Vôlei","Basquete","Judô"],c:0},
{q:"Quantos tempos tem uma partida de Futsal?",a:["2 tempos de 20 min","1 tempo","4 tempos","3 tempos"],c:0},
{q:"Qual é a cor do cartão de expulsão?",a:["Vermelho","Verde","Azul","Rosa"],c:0},
{q:"O que é HIDRATAÇÃO?",a:["Beber água","Comer doce","Dormir","Correr"],c:0},
{q:"Qual esporte usa TACÃO?",a:["Beisebol","Futebol","Vôlei","Judô"],c:0},
{q:"Qual parte do corpo é o BÍCEPS?",a:["Braço","Perna","Costas","Pescoço"],c:0},
{q:"Qual esporte é lutar no tatame?",a:["Judô","Tênis","Futebol","Natação"],c:0},
{q:"O que é RESISTÊNCIA?",a:["Aguentar esforço por muito tempo","Ser forte 1 vez","Pular alto","Ser rápido 1 vez"],c:0},
{q:"Quantos jogadores tem o Vôlei em quadra por time?",a:["6","5","11","7"],c:0},
{q:"Qual esporte usa BICICLETA?",a:["Ciclismo","Judô","Basquete","Vôlei"],c:0},
{q:"O que é FLEXIBILIDADE?",a:["Esticar bem o corpo","Ser forte","Ser rápido","Ser alto"],c:0},
{q:"O que é SEDENTARISMO?",a:["Falta de atividade física","Praticar esporte","Comer bem","Dormir pouco"],c:0},
{q:"Qual esporte usa LUVA e ringue?",a:["Boxe","Vôlei","Tênis","Futebol"],c:0},
{q:"Qual vitamina pegamos do SOL?",a:["Vitamina D","Vitamina A","Vitamina C","Vitamina B"],c:0},
{q:"O que é EQUILÍBRIO?",a:["Manter o corpo sem cair","Correr rápido","Pular alto","Ser forte"],c:0},
];

function enviarEstado(){ io.emit('estado',{jogadores,iniciado,tempo,feed,total:Object.keys(jogadores).length,max:MAX_JOGADORES}); }

io.on('connection',socket=>{
  socket.on('entrar',d=>{
    // TRAVA EM 30 JOGADORES
    if(Object.keys(jogadores).length>=MAX_JOGADORES){ socket.emit('lotado'); return; }
    jogadores[socket.id]={id:socket.id,nome:d.nome||'Player',skin:d.skin||'🦊',pontos:0,vidas:3,x:Math.random()*700+50,y:Math.random()*400+50,vivo:true};
    feed.unshift(`🟢 ${d.nome} entrou! (${Object.keys(jogadores).length}/${MAX_JOGADORES})`); feed=feed.slice(0,20);
    enviarEstado();
  });
  socket.on('mover',pos=>{ if(jogadores[socket.id]){ jogadores[socket.id].x=pos.x; jogadores[socket.id].y=pos.y; } });
  socket.on('comecar',()=>{ iniciado=true; tempo=tempoPartida; feed.unshift('🔥 PARTIDA COMEÇOU!'); io.emit('comecou'); enviarEstado(); });
  socket.on('queimar',idAlvo=>{
    let alvo=jogadores[idAlvo], eu=jogadores[socket.id]; if(!alvo||!eu) return;
    alvo.vidas--; eu.pontos+=100;
    if(alvo.vidas<=0){ alvo.vivo=false; feed.unshift(`🔥 ${eu.nome} QUEIMOU ${alvo.nome}!`); }
    else feed.unshift(`🎯 ${eu.nome} acertou ${alvo.nome} - restam ${alvo.vidas} vidas`);
    enviarEstado();
  });
  socket.on('responder',d=>{
    let eu=jogadores[socket.id]; if(!eu) return;
    if(d.correta){ eu.pontos+=100; feed.unshift(`✅ ${eu.nome} acertou +100`); }
    else{ eu.vidas--; feed.unshift(`❌ ${eu.nome} errou - perdeu 1 vida`); if(eu.vidas<=0) eu.vivo=false; }
    enviarEstado();
  });
  socket.on('nova-pergunta',d=>{ if(d.q&&d.a) perguntas.unshift({q:d.q,a:d.a,c:0}); });
  socket.on('pedir-duelo',idAlvo=>{
    let alvo=jogadores[idAlvo], eu=jogadores[socket.id]; if(!alvo||!eu) return;
    let p=perguntas[Math.floor(Math.random()*perguntas.length)];
    duelos[socket.id]={pergunta:p,oponente:alvo.nome};
    socket.emit('duelo',{pergunta:p,oponente:alvo.nome});
  });
  socket.on('disconnect',()=>{
    if(jogadores[socket.id]){ feed.unshift(`👋 ${jogadores[socket.id].nome} saiu`); delete jogadores[socket.id]; enviarEstado(); }
  });
});
setInterval(()=>{
  if(iniciado && tempo>0){ tempo--; if(tempo===0){ iniciado=false; let ranking=Object.values(jogadores).sort((a,b)=>b.pontos-a.pontos).slice(0,10); io.emit('podio',ranking); } }
  enviarEstado();
},1000);
let PORT=process.env.PORT||3000; http.listen(PORT,()=>console.log('NEON BATTLE 4.0 - 30 jogadores - porta '+PORT));

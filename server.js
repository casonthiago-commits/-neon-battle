const express=require('express');const app=express();const http=require('http').createServer(app);const io=require('socket.io')(http);
app.use(express.static('public'));app.use(express.static(__dirname));
let jogadores={},iniciado=false,tempo=300,feed=[],tempoPartida=300;
const MAX_JOGADORES = 30;

// --- 120 PERGUNTAS - SEM REPETIR ---
let perguntas=[
{q:"Qual esporte usa rede e a bola NÃO pode cair no chão?",a:["Vôlei","Futebol","Basquete","Tênis"],c:0},
{q:"Quantos jogadores de linha tem o Futsal em quadra por time?",a:["5","11","7","6"],c:0},
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
{q:"Handebol usa qual parte do corpo para jogar?",a:["Mãos","Pés","Cabeça","Joelho"],c:0},
{q:"O que é FREQUÊNCIA CARDÍACA?",a:["Batimentos do coração","Força do chute","Altura do pulo","Peso"],c:0},
{q:"Qual esporte é jogado na piscina com gol?",a:["Polo Aquático","Vôlei","Basquete","Judô"],c:0},
{q:"Quantos tempos tem uma partida de Futsal?",a:["2 tempos de 20 min","1 tempo","4 tempos","3 tempos"],c:0},
{q:"Qual é a cor do cartão de expulsão no Futebol?",a:["Vermelho","Verde","Azul","Rosa"],c:0},
{q:"O que é HIDRATAÇÃO?",a:["Beber água","Comer doce","Dormir","Correr"],c:0},
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
{q:"Qual esporte é correr, saltar e lançar?",a:["Atletismo","Futebol","Basquete","Judô"],c:0},
{q:"O que é FORÇA?",a:["Vencer uma resistência","Ser rápido","Ser flexível","Ser alto"],c:0},
{q:"Quantos ossos tem o corpo humano adulto?",a:["206","100","50","500"],c:0},
{q:"Qual a melhor bebida para hidratar?",a:["Água","Refrigerante","Suco de caixinha","Energético"],c:0},
{q:"O que é SAÚDE segundo a OMS?",a:["Bem-estar físico, mental e social","Só não estar doente","Ser forte","Ser magro"],c:0},
{q:"Qual esporte usa PATINS?",a:["Patinação","Futebol","Vôlei","Judô"],c:0},
{q:"Qual órgão bombeia o sangue?",a:["Coração","Pulmão","Fígado","Rim"],c:0},
{q:"Qual esporte usa TACO e bola pequena?",a:["Beisebol","Futebol","Vôlei","Judô"],c:0},
{q:"O que é AGILIDADE?",a:["Mudar de direção rápido","Ser forte","Ser alto","Dormir bem"],c:0},
{q:"Qual esporte é jogar com os pés e fazer gol?",a:["Futebol","Basquete","Vôlei","Tênis"],c:0},
{q:"O que é COORDENAÇÃO MOTORA?",a:["Controlar os movimentos do corpo","Ser forte","Correr rápido","Pular alto"],c:0},
{q:"Quantos jogadores tem o Basquete em quadra por time?",a:["5","6","11","7"],c:0},
{q:"Qual esporte é nadar na piscina?",a:["Natação","Futebol","Vôlei","Judô"],c:0},
{q:"O que é POSTURA?",a:["Posição correta do corpo","Correr rápido","Ser forte","Ser alto"],c:0},
{q:"Qual esporte usa ARCO e FLECHA?",a:["Tiro com Arco","Futebol","Vôlei","Judô"],c:0},
{q:"O que é RITMO?",a:["Cadência dos movimentos","Força","Peso","Altura"],c:0},
{q:"Qual esporte é lutar com espada?",a:["Esgrima","Futebol","Vôlei","Judô"],c:0},
{q:"O que é AQUECIMENTO ESPECÍFICO?",a:["Aquecer p/ o esporte que vai jogar","Dormir","Comer","Jogar videogame"],c:0},
{q:"Qual esporte usa BOLA e CESTA alta?",a:["Basquete","Futebol","Vôlei","Tênis"],c:0},
{q:"O que é DESAQUECIMENTO / VOLTA À CALMA?",a:["Diminuir o ritmo no final","Correr mais","Dormir no meio","Comer"],c:0},
{q:"Qual esporte é andar de SKATE?",a:["Skate","Futebol","Vôlei","Judô"],c:0},
{q:"O que é IMPULSÃO?",a:["Força para saltar","Ser alto","Dormir","Comer"],c:0},
{q:"Qual esporte é SURFAR nas ondas?",a:["Surfe","Futebol","Vôlei","Judô"],c:0},
{q:"O que é LATERALIDADE?",a:["Usar lado direito e esquerdo","Ser forte","Correr rápido","Pular alto"],c:0},
{q:"Qual esporte usa BOLA OVAL?",a:["Rugby","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é ESPORTE COLETIVO?",a:["Jogado em equipe","Sozinho","Com 1 pessoa","Sem regra"],c:0},
{q:"Qual esporte é jogar VÔLEI DE PRAIA?",a:["Vôlei de Praia","Futebol","Basquete","Judô"],c:0},
{q:"O que é ESPORTE INDIVIDUAL?",a:["Praticado sozinho","Em equipe","Com 11","Sem regra"],c:0},
{q:"Qual esporte usa REDE e PETECA?",a:["Badminton","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é FAIR PLAY?",a:["Jogo limpo, respeito","Trapacear","Xingar","Empurrar"],c:0},
{q:"Qual esporte é CORRER 100m?",a:["Atletismo","Futebol","Vôlei","Judô"],c:0},
{q:"O que é REGRAS do jogo?",a:["Combinados para jogar justo","Bagunça","Sem limite","Vale tudo"],c:0},
{q:"Qual esporte usa GOL com as mãos?",a:["Handebol","Futebol","Vôlei","Tênis"],c:0},
{q:"O que é TRABALHO EM EQUIPE?",a:["Ajudar o time","Jogar sozinho","Não passar a bola","Xingar"],c:0},
{q:"Qual esporte é GINÁSTICA com fita?",a:["Ginástica Rítmica","Futebol","Vôlei","Judô"],c:0},
{q:"O que é SUPERAÇÃO?",a:["Vencer seus limites","Desistir","Faltar","Dormir"],c:0},
{q:"Qual esporte é LUTAR com luvas e chutes?",a:["Muay Thai","Futebol","Vôlei","Tênis"],c:0},
{q:"O que é DISCIPLINA no esporte?",a:["Seguir treino e regras","Faltar sempre","Chegar atrasado","Bagunçar"],c:0},
{q:"Qual esporte é JOGAR XADREZ?",a:["Xadrez","Futebol","Vôlei","Judô"],c:0},
{q:"O que é CONCENTRAÇÃO?",a:["Focar na atividade","Ficar distraído","Conversar","Mexer no celular"],c:0},
{q:"Qual esporte é ANDAR A CAVALO?",a:["Hipismo","Futebol","Vôlei","Judô"],c:0},
{q:"O que é RESPEITO ao adversário?",a:["Cumprimentar e não xingar","Xingar","Empurrar","Trapacear"],c:0},
{q:"Qual esporte é REMAR no barco?",a:["Remo","Futebol","Vôlei","Judô"],c:0},
{q:"O que é ALIMENTAÇÃO SAUDÁVEL?",a:["Comer frutas, legumes e beber água","Só comer doce","Só beber refri","Pular refeição"],c:0},
{q:"Qual esporte é ESCALAR parede?",a:["Escalada","Futebol","Vôlei","Judô"],c:0},
{q:"O que é SONO para o atleta?",a:["Descansar para recuperar","Ficar acordado","Jogar a noite toda","Não dormir"],c:0},
{q:"Qual esporte é JOGAR TÊNIS DE MESA?",a:["Tênis de Mesa","Futebol","Vôlei","Judô"],c:0},
{q:"O que é LESÃO?",a:["Machucado no corpo","Vitória","Gol","Ponto"],c:0},
{q:"Qual esporte é DANÇAR?",a:["Dança","Futebol","Vôlei","Judô"],c:0},
{q:"O que fazer quando se machuca?",a:["Avisar o professor e parar","Continuar jogando","Esconder","Correr mais"],c:0},
{q:"Qual esporte é JOGAR QUEIMADA?",a:["Queimada","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é AQUECIMENTO GERAL?",a:["Aquecer o corpo todo","Só o braço","Só dormir","Só comer"],c:0},
{q:"Qual esporte é JOGAR FUTSAL?",a:["Futsal","Tênis","Vôlei","Judô"],c:0},
{q:"O que é VELOCIDADE DE REAÇÃO?",a:["Responder rápido a um estímulo","Ser alto","Ser forte","Dormir"],c:0},
{q:"Qual esporte é JOGAR BASQUETE 3x3?",a:["Basquete 3x3","Futebol","Vôlei","Judô"],c:0},
{q:"O que é POTÊNCIA?",a:["Força + velocidade juntas","Só força","Só dormir","Só comer"],c:0},
{q:"Qual esporte é JOGAR VÔLEI SENTADO?",a:["Vôlei Sentado","Futebol","Basquete","Judô"],c:0},
{q:"O que é INCLUSÃO no esporte?",a:["Todos podem jogar","Só os melhores","Só meninos","Só meninas"],c:0},
{q:"Qual esporte é CORRER MARATONA?",a:["Atletismo","Futebol","Vôlei","Judô"],c:0},
{q:"O que é ESTRATÉGIA?",a:["Plano para vencer","Bagunça","Sem plano","Jogar sozinho"],c:0},
{q:"Qual esporte é JOGAR HÓQUEI?",a:["Hóquei","Futebol","Vôlei","Judô"],c:0},
{q:"O que é TÁTICA?",a:["Como o time joga","Ser alto","Ser forte","Dormir"],c:0},
{q:"Qual esporte é JOGAR GOLFE?",a:["Golfe","Futebol","Vôlei","Judô"],c:0},
{q:"O que é TÉCNICA?",a:["Jeito certo de fazer o movimento","Bagunça","Força bruta","Sem treino"],c:0},
{q:"Qual esporte é JOGAR CRÍQUETE?",a:["Críquete","Futebol","Vôlei","Judô"],c:0},
{q:"O que é TREINO?",a:["Praticar para melhorar","Faltar","Dormir","Jogar videogame"],c:0},
{q:"Qual esporte é JOGAR POLO?",a:["Polo","Futebol","Vôlei","Judô"],c:0},
{q:"O que é AQUECIMENTO ARTICULAR?",a:["Mexer as articulações","Dormir","Comer","Correr sem parar"],c:0},
{q:"Qual esporte é JOGAR BEACH TENNIS?",a:["Beach Tennis","Futebol","Vôlei","Judô"],c:0},
{q:"O que é ARTICULAÇÃO?",a:["Junção dos ossos","Músculo","Pele","Cabelo"],c:0},
{q:"Qual esporte é JOGAR FRESCOBOL?",a:["Frescobol","Futebol","Vôlei","Judô"],c:0},
{q:"O que é MÚSCULO?",a:["Parte do corpo que faz força","Osso","Pele","Unha"],c:0},
{q:"Qual esporte é JOGAR CAPOEIRA?",a:["Capoeira","Futebol","Vôlei","Judô"],c:0},
{q:"O que é OSSO?",a:["Estrutura que sustenta o corpo","Músculo","Pele","Cabelo"],c:0},
{q:"Qual esporte é JOGAR KARATÊ?",a:["Karatê","Futebol","Vôlei","Judô"],c:0},
{q:"O que é CORAÇÃO?",a:["Órgão que bombeia sangue","Osso","Músculo da perna","Pele"],c:0},
{q:"Qual esporte é JOGAR TAEKWONDO?",a:["Taekwondo","Futebol","Vôlei","Judô"],c:0},
{q:"O que é PULMÃO?",a:["Órgão que respira","Osso","Músculo","Pele"],c:0},
{q:"Qual esporte é JOGAR JIU-JITSU?",a:["Jiu-Jitsu","Futebol","Vôlei","Judô"],c:0},
{q:"O que é CÉREBRO?",a:["Comanda o corpo","Osso","Músculo","Pele"],c:0},
{q:"Qual esporte é JOGAR FUTEBOL AMERICANO?",a:["Futebol Americano","Futebol","Vôlei","Judô"],c:0},
{q:"O que é ENERGIA para o corpo?",a:["Vem dos alimentos","Vem do sono só","Vem do celular","Vem da TV"],c:0},
{q:"Qual esporte é JOGAR VÔLEI DE AREIA?",a:["Vôlei de Praia","Futebol","Basquete","Judô"],c:0},
{q:"O que é PROTEÍNA?",a:["Ajuda a construir músculo","Só açúcar","Só gordura","Só água"],c:0},
{q:"Qual esporte é JOGAR HANDBOL DE AREIA?",a:["Handebol de Praia","Futebol","Vôlei","Judô"],c:0},
{q:"O que é CARBOIDRATO?",a:["Dá energia","Só proteína","Só água","Só vitamina"],c:0},
{q:"Qual esporte é JOGAR FUTVÔLEI?",a:["Futevôlei","Futebol","Basquete","Judô"],c:0},
{q:"O que é VITAMINA?",a:["Ajuda o corpo a funcionar","Só açúcar","Só sal","Só gordura"],c:0},
{q:"Qual esporte é JOGAR PING PONG?",a:["Tênis de Mesa","Futebol","Vôlei","Judô"],c:0},
{q:"O que é MINERAL?",a:["Como cálcio, ferro","Só açúcar","Só água","Só gordura"],c:0},
{q:"Qual esporte é JOGAR QUEIMADA COM 2 BOLAS?",a:["Queimada","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é OBESIDADE?",a:["Excesso de peso que prejudica saúde","Ser forte","Ser alto","Ser rápido"],c:0},
{q:"Qual esporte é JOGAR PEGA-PEGA?",a:["Pega-Pega","Futebol","Vôlei","Judô"],c:0},
{q:"O que é PRESSÃO ARTERIAL?",a:["Força do sangue nas artérias","Peso","Altura","Força do chute"],c:0},
{q:"Qual esporte é JOGAR ESCONDE-ESCONDE?",a:["Esconde-Esconde","Futebol","Vôlei","Judô"],c:0},
{q:"O que é DIABETES?",a:["Problema com açúcar no sangue","Ser forte","Ser alto","Ser rápido"],c:0},
];
// --- SISTEMA SEM REPETIR ---
let filaPerguntas=[];
function embaralharPerguntas(){
  filaPerguntas=[...perguntas];
  for(let i=filaPerguntas.length-1;i>0;i--){ let j=Math.floor(Math.random()*(i+1)); [filaPerguntas[i],filaPerguntas[j]]=[filaPerguntas[j],filaPerguntas[i]]; }
}
function proximaPergunta(){
  if(filaPerguntas.length===0) embaralharPerguntas();
  let p=filaPerguntas.pop();
  // Embaralha as alternativas também, para não ficar sempre a 1ª certa
  let alts=[...p.a]; let corretaTexto=p.a[p.c];
  for(let i=alts.length-1;i>0;i--){ let j=Math.floor(Math.random()*(i+1)); [alts[i],alts[j]]=[alts[j],alts[i]]; }
  let novoC=alts.indexOf(corretaTexto);
  return {q:p.q,a:alts,c:novoC};
}
embaralharPerguntas();

function enviarEstado(){ io.emit('estado',{jogadores,iniciado,tempo,feed,total:Object.keys(jogadores).length,max:MAX_JOGADORES,restam:filaPerguntas.length}); }
io.on('connection',socket=>{
  socket.on('entrar',d=>{
    if(Object.keys(jogadores).length>=MAX_JOGADORES){ socket.emit('lotado'); return; }
    jogadores[socket.id]={id:socket.id,nome:d.nome||'Player',skin:d.skin||'🦊',pontos:0,acertos:0,erros:0,x:Math.random()*700+50,y:Math.random()*400+50};
    feed.unshift(`🟢 ${d.nome} entrou! (${Object.keys(jogadores).length}/${MAX_JOGADORES})`); feed=feed.slice(0,20);
    enviarEstado();
  });
  socket.on('mover',pos=>{ if(jogadores[socket.id]){ jogadores[socket.id].x=pos.x; jogadores[socket.id].y=pos.y; } });
  socket.on('comecar',()=>{ iniciado=true; tempo=tempoPartida; embaralharPerguntas(); feed.unshift('🔥 PARTIDA COMEÇOU! 120 perguntas sem repetir!'); io.emit('comecou'); enviarEstado(); });
  socket.on('pedir-duelo',idAlvo=>{
    let alvo=jogadores[idAlvo], eu=jogadores[socket.id]; if(!alvo||!eu) return;
    let p=proximaPergunta();
    socket.emit('duelo',{pergunta:p,oponente:alvo.nome,alvoId:idAlvo});
    feed.unshift(`🏃 ${eu.nome} PEGOU ${alvo.nome}! Duelo! Restam ${filaPerguntas.length} perguntas`);
    enviarEstado();
  });
  socket.on('responder',d=>{
    let eu=jogadores[socket.id]; if(!eu) return;
    if(d.correta){ eu.pontos+=100; eu.acertos++; feed.unshift(`✅ ${eu.nome} acertou! +100 | Total: ${eu.acertos} acertos`); socket.emit('duelo-fim',{resultado:'ganhou',pontos:eu.pontos,acertos:eu.acertos}); }
    else { eu.erros++; feed.unshift(`❌ ${eu.nome} errou - continua no jogo!`); socket.emit('duelo-fim',{resultado:'errou',pontos:eu.pontos,acertos:eu.acertos}); }
    enviarEstado();
  });
  socket.on('nova-pergunta',d=>{ if(d.q&&d.a) perguntas.unshift({q:d.q,a:d.a,c:0}); });
  socket.on('disconnect',()=>{ if(jogadores[socket.id]){ feed.unshift(`👋 ${jogadores[socket.id].nome} saiu`); delete jogadores[socket.id]; enviarEstado(); } });
});
setInterval(()=>{ if(iniciado && tempo>0){ tempo--; if(tempo===0){ iniciado=false; let ranking=Object.values(jogadores).sort((a,b)=> b.pontos - a.pontos || b.acertos - a.acertos).slice(0,3); io.emit('podio',ranking); } } enviarEstado(); },1000);
let PORT=process.env.PORT||3000; http.listen(PORT,()=>console.log('PEGA E RESPONDE - 120 perguntas sem repetir - porta '+PORT));

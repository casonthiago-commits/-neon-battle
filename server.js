const express=require('express');const app=express();const http=require('http').createServer(app);const io=require('socket.io')(http);
app.use(express.static('public'));app.use(express.static(__dirname));
let jogadores={},iniciado=false,tempo=300,feed=[],duelos={},tempoPartida=300;
let perguntas=[
{q:"Qual esporte usa rede e a bola NÃO pode cair?",a:["Vôlei","Futebol","Basquete","Tênis"],c:0},
{q:"Quantos jogadores de linha tem o Futsal em quadra?",a:["5","11","7","6"],c:0},
{q:"Qual músculo usamos no AGACHAMENTO?",a:["Quadríceps","Bíceps","Peito","Pescoço"],c:0},
{q:"O que é AQUECIMENTO?",a:["Preparar o corpo p/ exercício","Dormir","Comer","Jogar videogame"],c:0},
{q:"Qual capacidade física é correr rápido?",a:["Velocidade","Força","Flexibilidade","Equilíbrio"],c:0},
{q:"Qual esporte usa CESTA?",a:["Basquete","Vôlei","Handebol","Natação"],c:0},
{q:"O que é ALONGAMENTO?",a:["Esticar os músculos","Correr","Pular","Lutar"],c:0},
{q:"Quantas faltas para ser expulso no Basquete?",a:["5","3","10","2"],c:0},
{q:"Qual esporte usa RAQUETE?",a:["Tênis","Futebol","Vôlei","Judô"],c:0},
{q:"O que melhora a PRANCHA?",a:["Core / Abdômen","Braço só","Perna só","Nada"],c:0},
{q:"Qual é o esporte mais popular do Brasil?",a:["Futebol","Tênis","Golfe","Surfe"],c:0},
{q:"O que devemos fazer ANTES de treinar?",a:["Aquecimento","Dormir","Comer pizza","Nada"],c:0},
{q:"Qual parte do corpo usamos no CABECEIO?",a:["Cabeça","Pé","Mão","Joelho"],c:0},
{q:"Handebol usa qual parte do corpo?",a:["Mãos","Pés","Cabeça","Joelho"],c:0},
{q:"O que é FREQUÊNCIA CARDÍACA?",a:["Batimentos do coração","Velocidade do chute","Altura do pulo","Peso"],c:0},
{q:"Qual esporte é jogado na piscina?",a:["Polo Aquático","Vôlei","Basquete","Judô"],c:0},
{q:"Quantos tempos tem uma partida de Futsal?",a:["2 tempos de 20 min","1 tempo","4 tempos","3 tempos"],c:0},
{q:"Qual é a cor do cartão de expulsão?",a:["Vermelho","Verde","Azul","Rosa"],c:0},
{q:"O que é HIDRATAÇÃO?",a:["Beber água","Comer doce","Dormir","Correr"],c:0},
{q:"Qual esporte usa TACO?",a:["Beisebol","Futebol","Vôlei","Natação"],c:0},
{q:"Qual parte do corpo é o BÍCEPS?",a:["Braço","Perna","Costas","Pescoço"],c:0},
{q:"Qual esporte é lutar no tatame?",a:["Judô","Futebol","Tênis","Natação"],c:0},
{q:"O que é RESISTÊNCIA?",a:["Aguentar o esforço por muito tempo","Ser forte 1 vez","Pular alto","Ser rápido 1 vez"],c:0},
{q:"Quantos jogadores tem o Vôlei em quadra por time?",a:["6","5","11","7"],c:0},
{q:"Qual esporte usa BICICLETA?",a:["Ciclismo","Judô","Basquete","Vôlei"],c:0},
{q:"O que é FLEXIBILIDADE?",a:["Conseguir esticar bem o corpo","Ser forte","Ser rápido","Ser alto"],c:0},
{q:"Qual é a altura da cesta no Basquete?",a:["3,05 m","2 m","4 m","1,5 m"],c:0},
{q:"Qual esporte é conhecido como 'esporte rei'?",a:["Futebol","Tênis","Golfe","Surfe"],c:0},
{q:"O que é SEDENTARISMO?",a:["Falta de atividade física","Praticar muito esporte","Comer bem","Dormir pouco"],c:0},
{q:"Qual músculo fica na COXA da frente?",a:["Quadríceps","Bíceps","Tríceps","Peito"],c:0},
{q:"Qual esporte usa LUVA e se luta no ringue?",a:["Boxe","Vôlei","Tênis","Futebol"],c:0},
{q:"Quantos sets precisa ganhar no Vôlei?",a:["3","1","5","2"],c:0},
{q:"O que é OBESIDADE?",a:["Excesso de gordura corporal","Ser magro","Ser alto","Ser forte"],c:0},
{q:"Qual esporte é correr, saltar e lançar?",a:["Atletismo","Futebol","Basquete","Judô"],c:0},
{q:"Qual é o maior osso do corpo?",a:["Fêmur","Tíbia","Úmero","Rádio"],c:0},
{q:"Qual esporte usa ARCO e FLECHA?",a:["Tiro com Arco","Futebol","Vôlei","Judô"],c:0},
{q:"O que é COORDENAÇÃO MOTORA?",a:["Controlar os movimentos do corpo","Ser forte","Ser rápido","Ser alto"],c:0},
{q:"Quantos minutos tem um jogo de Futebol profissional?",a:["90 min","60 min","40 min","120 min"],c:0},
{q:"Qual vitamina pegamos do SOL?",a:["Vitamina D","Vitamina A","Vitamina C","Vitamina B"],c:0},
{q:"Qual esporte é feito em cima do CAVALO?",a:["Hipismo","Natação","Judô","Basquete"],c:0},
{q:"O que é EQUILÍBRIO?",a:["Manter o corpo sem cair","Correr rápido","Pular alto","Ser forte"],c:0},
{q:"Qual esporte usa PATINS?",a:["Patinação","Futebol","Vôlei","Judô"],c:0},
{q:"Quantos jogadores tem o Basquete em quadra por time?",a:["5","6","11","7"],c:0},
{q:"O que é POSTURA?",a:["Posição do corpo","Velocidade","Força","Peso"],c:0},
{q:"Qual esporte é NATAÇÃO de costas, peito e borboleta?",a:["Natação","Futebol","Vôlei","Judô"],c:0},
{q:"Qual órgão bombeia o sangue?",a:["Coração","Pulmão","Fígado","Rim"],c:0},
{q:"Qual esporte usa BOLA OVAL?",a:["Rugby","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é FORÇA?",a:["Capacidade de vencer resistência","Ser rápido","Ser flexível","Ser alto"],c:0},
{q:"Qual é o nome do local onde se luta Judô?",a:["Tatame","Quadra","Piscina","Campo"],c:0},
{q:"Quantos jogadores tem o Handebol em quadra por time?",a:["7","5","6","11"],c:0},
{q:"O que é AGILIDADE?",a:["Mudar de direção rápido","Ser forte","Ser alto","Ser pesado"],c:0},
{q:"Qual esporte usa REDE, PETECA e RAQUETE?",a:["Badminton","Futebol","Vôlei","Basquete"],c:0},
{q:"Qual é a função do AQUECIMENTO?",a:["Evitar lesões","Cansar","Dormir","Engordar"],c:0},
{q:"Qual esporte é SURFAR na onda?",a:["Surfe","Judô","Tênis","Vôlei"],c:0},
{q:"Qual parte do corpo é o TRÍCEPS?",a:["Parte de trás do braço","Perna","Costas","Barriga"],c:0},
{q:"O que é RITMO?",a:["Cadência do movimento","Força","Peso","Altura"],c:0},
{q:"Qual esporte é feito com SKATE?",a:["Skate","Futebol","Vôlei","Judô"],c:0},
{q:"Quantos pontos vale um GOL no Futebol?",a:["1","2","3","5"],c:0},
{q:"O que é LESÃO?",a:["Machucado no corpo","Vitória","Medalha","Treino"],c:0},
{q:"Qual esporte é CHUTAR a bola no gol?",a:["Futebol","Basquete","Vôlei","Tênis"],c:0},
{q:"Qual é o principal combustível do corpo no exercício?",a:["Carboidrato","Gordura só","Proteína só","Água só"],c:0},
{q:"Qual esporte usa DISCO para lançar longe?",a:["Atletismo","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é VOLTA À CALMA?",a:["Diminuir o ritmo no final","Correr mais","Dormir","Comer"],c:0},
{q:"Qual esporte é DANÇAR?",a:["Dança","Judô","Futebol","Tênis"],c:0},
{q:"Qual músculo usamos para sorrir?",a:["Músculos da face","Bíceps","Quadríceps","Peito"],c:0},
{q:"Qual esporte é feito na AREIA com rede?",a:["Vôlei de Praia","Basquete","Futebol de Salão","Judô"],c:0},
{q:"O que é PRESSÃO ARTERIAL?",a:["Pressão do sangue nas artérias","Batimento","Respiração","Peso"],c:0},
{q:"Qual esporte é ESCALAR montanha?",a:["Escalada","Natação","Futebol","Vôlei"],c:0},
{q:"Quantos ossos tem o corpo adulto aproximadamente?",a:["206","100","50","500"],c:0},
{q:"Qual esporte usa BASTÃO e corre bases?",a:["Beisebol","Futebol","Vôlei","Judô"],c:0},
{q:"O que é LATERALIDADE?",a:["Usar lado direito e esquerdo","Ser alto","Ser rápido","Ser forte"],c:0},
{q:"Qual esporte é pular com VARA?",a:["Atletismo","Futebol","Vôlei","Basquete"],c:0},
{q:"Qual é a melhor bebida para hidratar?",a:["Água","Refrigerante","Suco de caixinha","Energético"],c:0},
{q:"Qual esporte é feito com CAPOEIRA?",a:["Capoeira","Tênis","Vôlei","Basquete"],c:0},
{q:"O que é POTÊNCIA?",a:["Força + Velocidade","Só força","Só flexibilidade","Só altura"],c:0},
{q:"Qual esporte usa MESA e RAQUETE pequena?",a:["Tênis de Mesa","Futebol","Vôlei","Basquete"],c:0},
{q:"Quantos metros tem uma MARATONA?",a:["42 km","10 km","5 km","100 m"],c:0},
{q:"O que é IMUNIDADE?",a:["Defesa do corpo contra doenças","Força","Velocidade","Peso"],c:0},
{q:"Qual esporte é lutar com ESPADA?",a:["Esgrima","Futebol","Vôlei","Judô"],c:0},
{q:"Qual parte do corpo é o ABDÔMEN?",a:["Barriga","Braço","Perna","Pescoço"],c:0},
{q:"O que é DESIDRATAÇÃO?",a:["Falta de água no corpo","Excesso de água","Excesso de comida","Falta de sono"],c:0},
{q:"Qual esporte é feito no GELO?",a:["Patinação no Gelo","Futebol","Vôlei","Judô"],c:0},
{q:"Qual é o nome da articulação do JOELHO?",a:["Joelho","Cotovelo","Ombro","Punho"],c:0},
{q:"Qual esporte usa BOLA e CESTA alta?",a:["Basquete","Futebol","Vôlei","Tênis"],c:0},
{q:"O que é SAÚDE?",a:["Bem-estar físico, mental e social","Só não estar doente","Ser forte","Ser magro"],c:0},
{q:"Qual esporte é CORRER 100 metros?",a:["Atletismo","Futebol","Vôlei","Judô"],c:0},
{q:"Qual músculo é o CORAÇÃO?",a:["Músculo cardíaco","Bíceps","Tríceps","Quadríceps"],c:0},
{q:"O que é AQUECIMENTO ARTICULAR?",a:["Mexer as articulações p/ preparar","Dormir","Comer","Correr sem parar"],c:0},
{q:"Qual esporte é feito com REMO no barco?",a:["Remo","Futebol","Vôlei","Judô"],c:0},
{q:"Quantas calorias aproximadas gasta 1h de Futebol?",a:["600","50","100","2000"],c:0},
{q:"Qual esporte é SALTAR na cama elástica?",a:["Ginástica de Trampolim","Futebol","Vôlei","Judô"],c:0},
{q:"O que é FREQUÊNCIA RESPIRATÓRIA?",a:["Vezes que respiramos por minuto","Batimento","Peso","Altura"],c:0},
{q:"Qual esporte é feito com PARAPENTE?",a:["Voo Livre","Futebol","Vôlei","Natação"],c:0},
{q:"Qual é a função do ESQUELETO?",a:["Sustentar e proteger o corpo","Fazer sangue só","Respirar","Digirir"],c:0},
{q:"Qual esporte é JOGAR XADREZ?",a:["Xadrez","Futebol","Vôlei","Basquete"],c:0},
{q:"O que é RECUPERAÇÃO MUSCULAR?",a:["Descanso p/ o músculo se recuperar","Treinar sem parar","Não comer","Não dormir"],c:0},
{q:"Qual esporte é feito com SNOWBOARD?",a:["Snowboard","Futebol","Vôlei","Judô"],c:0},
{q:"Quantos litros de água devemos beber por dia?",a:["Cerca de 2 litros","100 ml","10 litros","0 litros"],c:0},
{q:"Qual esporte é feito com KITE?",a:["Kitesurf","Futebol","Vôlei","Judô"],c:0}
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

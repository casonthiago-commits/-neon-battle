const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(__dirname));
app.use(express.static('public'));
let salas = {};
function novaSala(){ return { jogadores:{}, jogando:false, zona:400, tempo:90, feed:[] } }
io.on('connection', socket=>{
  socket.on('entrar', ({codigo,nome,skin})=>{
    if(!salas[codigo]) salas[codigo]=novaSala();
    let s=salas[codigo];
    if(Object.keys(s.jogadores).length>=20){ socket.emit('cheia'); return; }
    s.jogadores[socket.id]={ nome, skin, x:100+Math.random()*600, y:100+Math.random()*300, vida:100, vivo:true, kills:0 };
    socket.join(codigo); socket.data.codigo=codigo;
    io.to(codigo).emit('estado', s);
  });
  socket.on('mover', ({x,y})=>{
    let s=salas[socket.data.codigo]; if(!s||!s.jogando) return;
    let j=s.jogadores[socket.id]; if(!j||!j.vivo) return;
    j.x=Math.max(20,Math.min(780,x)); j.y=Math.max(20,Math.min(480,y));
    // Bateu em alguém? Empurra e tira vida
    for(let id in s.jogadores){
      if(id===socket.id) continue;
      let o=s.jogadores[id]; if(!o.vivo) continue;
      if(Math.abs(o.x-j.x)<30 && Math.abs(o.y-j.y)<30){
        o.vida-=8;
        if(o.vida<=0){ o.vivo=false; j.kills++; s.feed.unshift(`💥 ${j.nome} eliminou ${o.nome}`); s.feed=s.feed.slice(0,5); }
      }
    }
  });
  socket.on('dash', ()=>{
    let s=salas[socket.data.codigo]; if(!s) return;
    let j=s.jogadores[socket.id]; if(j) j.x=Math.min(780, j.x+80);
  });
  socket.on('comecar', ()=>{
    let s=salas[socket.data.codigo]; if(!s) return;
    s.jogando=true; s.tempo=90; s.zona=400; s.feed=[];
    Object.values(s.jogadores).forEach(j=>{ j.vida=100; j.vivo=true; j.kills=0; j.x=100+Math.random()*600; j.y=100+Math.random()*300; });
    io.to(socket.data.codigo).emit('estado', s);
  });
  socket.on('disconnect', ()=>{
    let s=salas[socket.data.codigo]; if(s) delete s.jogadores[socket.id];
  });
});
setInterval(()=>{
  for(let codigo in salas){
    let s=salas[codigo];
    if(s.jogando){
      s.tempo--; s.zona=Math.max(120, s.zona-2);
      // Zona encolhe - quem tá fora perde vida
      for(let id in s.jogadores){
        let j=s.jogadores[id]; if(!j.vivo) continue;
        let dist=Math.hypot(j.x-400, j.y-250);
        if(dist>s.zona){ j.vida-=5; if(j.vida<=0) j.vivo=false; }
      }
      let vivos=Object.values(s.jogadores).filter(j=>j.vivo);
      if(vivos.length<=1 || s.tempo<=0){ s.jogando=false; if(vivos[0]) s.feed.unshift(`🏆 CAMPEÃO: ${vivos[0].nome}`); }
    }
    io.to(codigo).emit('estado', s);
  }
}, 1000);
server.listen(process.env.PORT||3000);

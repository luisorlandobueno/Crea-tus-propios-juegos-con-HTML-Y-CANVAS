/***********
VARIABLES
************/
game = {
	canvas: null,
	ctx: null,
	caratula: true,
	x:0, 
	y:0,
	imagen: null,
	radianes: null,
	teclaPulsada: null,
	tecla_array: new Array(),
	balas_array: new Array(),
	enemigos_array: new Array(),
	colorEnemigo: ["red", "blue", "black","white", "yellow", "green", "purple"],
	colorBala: "red",
	centroX: 0, 
	centroY: 0,
	w:0,
	h:0,
	puntos: 0,
	vidas: 5,
	balas: 200,
	finJuego: false,
}
sonidos = {
	boing: null,
	disparo: null,
	intro: null,
	fin: null,
	boom: null,
}
/**************
CONSTANTES
**************/
const BARRA = 32;
/**************
OBJETOS
**************/
function Bala(x,y,radianes){
	this.x = x;
	this.y = y;
	this.w = 5;
	this.velocidad = 8;
	this.radianes = radianes;
	this.dibujar = function(){
		game.ctx.save();
		game.ctx.fillStyle = game.colorBala;
		this.x += Math.cos(this.radianes)*this.velocidad;
		this.y += Math.sin(this.radianes)*this.velocidad;
		game.ctx.fillRect(this.x, this.y, this.w, this.w);
		game.ctx.restore();
	}
}
function Tanque(x,y,radio){
	this.x = x;
	this.y = y;
	this.radio = radio;
	this.escala = 1;
	this.rotacion = 0;
	this.w = 0;
	this.h = 0;
	this.dibujar = function(){
		game.imagen.src = "imagenes/tanque.png";
		game.imagen.onload = function(){
			this.w = game.imagen.width;
			this.h = game.imagen.height;
			let ww = this.w / 2;
			let hh = this.h / 2;
			game.ctx.drawImage(game.imagen, game.centroX-ww, game.centroY-hh);	
		}
	}
}
function Enemigo(x,y){
	this.n = 0;
	this.x = x;
	this.y = y;
	this.inicioX = x;
	this.inicioY = y;
	this.estado = 1;
	this.r = 10;
	this.w = this.r * 2;
	this.vive = true;
	this.velocidad = 0.1+Math.random();
	this.color = game.colorEnemigo[Math.floor(Math.random()*game.colorEnemigo.length)];
	this.dibujar = function(){
		if(this.n<100 && this.vive){
			game.ctx.save();
			game.ctx.beginPath();
			game.ctx.fillStyle = this.color;
			game.ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
			game.ctx.fill();
			this.n += this.velocidad;
			this.x = game.centroX*this.n/100 + 
			this.inicioX*(100-this.n)/100;
			this.y = game.centroY*this.n/100 + 
			this.inicioY*(100-this.n)/100;
			game.ctx.restore();
		}
	}
}
/***********
FUNCIONES
************/
const caratula=()=>{
	let imagen = new Image();
	imagen.src = "imagenes/caratula.jpg";
	imagen.onload =()=>{
		game.ctx.drawImage(imagen,0,0);
	}
}
const seleccionar=(e)=>{
	if(game.caratula){
		inicio();
	}
}
const inicio=()=>{
	limpiarCanvas();
	game.caratula = false;
	//
	document.addEventListener("mousemove",function(e){
		let {x,y} = ajustar(e.clientX, e.clientY);
		let dx = x - game.centroX;
		let dy = y - game.centroY;
		game.radianes = Math.atan2(dy,dx);
	});
	//
	game.tanque.dibujar();
	setTimeout(lanzaEnemigo, 1000);
	animar();
}
const lanzaEnemigo=()=>{
	let lado = Math.floor(Math.random()*4)+1;
	let x,y;
	if(lado==1){	//Izquierda
		x = -10;
		y = Math.floor(Math.random()*game.h);
	} else if(lado==2){
		x = Math.floor(Math.random()*game.w);
		y = -10;
	} else if(lado==3){
		x = game.w + Math.random()*10;
		y = Math.floor(Math.random()*game.h);
	} else if(lado==4){
		x = Math.floor(Math.random()*game.w);
		y = game.h + Math.random()*10;
	}
	game.enemigos_array.push(new Enemigo(x,y));
	setTimeout(lanzaEnemigo, 2000);
}
const animar = () =>{
	if (game.finJuego==false) {
		requestAnimationFrame(animar);
		verificar();
		pintar();
		colisiones();
	}
}
const colisiones=()=>{
	game.enemigos_array.map((enemigo,i)=>{
		game.balas_array.map((bala,j)=>{
			if(enemigo != null && bala != null){
				if((bala.x>enemigo.x) &&
				(bala.x<enemigo.x+enemigo.w) &&
				(bala.y>enemigo.y) &&
				(bala.y<enemigo.y+enemigo.w)){	
					game.enemigos_array[i] = null;
					game.balas_array[j] = null;
					game.puntos += 10;
					sonidos.boing.play();
				}
			}
		});
		if(enemigo != null){
			if(enemigo.n > 95){
				game.enemigos_array[i] = null;
				game.vidas--;
				sonidos.boom.play();
				if(game.vidas<=0) gameOver();	
			}
		}
	});
}
const gameOver=()=>{
	limpiarCanvas();
	mensaje("Fin del juego",0,150,"bold 100px Arial","black");
	mensaje(`Obtuviste ${game.puntos} puntos`,0,300,"bold 40px Arial","black");
	game.finJuego = true;
	sonidos.fin.play();
}
const verificar = () =>{
	if(game.tecla_array[BARRA]){
		if (game.balas>0) {
			game.balas_array.push(
				new Bala(
					game.centroX+Math.cos(game.radianes)*35, 
					game.centroY+Math.sin(game.radianes)*35, 
					game.radianes)
			);
			game.balas--;
			game.tecla_array[BARRA] = false;
			sonidos.disparo.play();
		}
	}
} 
const pintar=()=>{
	//
	limpiarCanvas();
	marcador();	
	game.ctx.save();
	game.ctx.translate(game.centroX, game.centroY);
	game.ctx.scale(game.tanque.escala, game.tanque.escala);
	game.ctx.rotate(game.radianes);
	game.ctx.drawImage(game.imagen, -game.imagen.width/2, -game.imagen.height/2);
	game.ctx.restore();
	//
	for(let i=0; i<game.balas_array.length; i++){
		if(game.balas_array[i]!=null){
			game.balas_array[i].dibujar();
			if(game.balas_array[i].x < 0 
			|| game.balas_array[i].x > game.w 
			|| game.balas_array[i].y < 0 
			|| game.balas_array[i].y > game.h){
				game.balas_array[i] = null;
			}
		}
	}
	//
	//Enemigos
	//
	game.enemigos_array.map((enemigo,i)=>{
		if(enemigo != null){
			enemigo.dibujar();	
		}
	});
}
const ajustar=(xx, yy)=>{
	const pos = game.canvas.getBoundingClientRect();
	const x = xx - pos.left;
	const y = yy - pos.top;
	return {x, y}	
}
const mensaje=(cadena,x,y,fuentes="bold 20px Courier",color="black") =>{
    let medio = (game.canvas.width-x)/2;
	game.ctx.save();
	game.ctx.fillStyle = color;
	game.ctx.strokeStyle = color;	
	game.ctx.textBaseline = "top";
	game.ctx.font = fuentes;
	game.ctx.textAlign = "center";
	game.ctx.fillText(cadena, x+medio, y);
	game.ctx.restore();
}
const marcador=()=>{
	/*
	game.ctx.save();
	game.ctx.fillStyle = "white";
	game.ctx.clearRect(0,0,game.canvas.width,40);
	game.ctx.font = "bold 20px Courier";
	game.ctx.fillText(
		`SCORE: ${game.puntos} VIDAS: ${game.vidas} BALAS: ${game.balas}`,10,20
		);
	game.ctx.restore();	
	*/
	let m = `SCORE: ${game.puntos} VIDAS: ${game.vidas} BALAS: ${game.balas}`;
	mensaje(m,0,10,"bold 20px Courier","black");
}
const limpiarCanvas=()=>{
	game.ctx.clearRect(0,0,game.canvas.width,game.canvas.height);
}
/***********
LISTENERS
************/
window.requestAnimationFrame=(function(){
	return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback){window.setTimeout(callback,17);}
})();
document.addEventListener("keydown", function(e){
	game.teclaPulsada = e.keyCode;
	game.tecla_array[game.teclaPulsada] = true;
});
/***********
INICIO
************/
window.onload=function(){
	game.canvas = document.getElementById("canvas");
	if(game.canvas && game.canvas.getContext){
		game.ctx = canvas.getContext("2d");
		if (game.ctx) {
			sonidos.boing = document.getElementById("boing");
			sonidos.disparo = document.getElementById("disparo");
			sonidos.intro = document.getElementById("intro");
			sonidos.fin = document.getElementById("fin");
			sonidos.boom = document.getElementById("boom");
			//
			game.w = game.canvas.width;
			game.h = game.canvas.height;
			game.centroX = game.w / 2;
			game.centroY = game.h / 2;
			game.imagen = new Image();
			game.tanque = new Tanque(game.centroX,game.centroY);
			caratula();
			game.canvas.addEventListener("click",seleccionar,false);
		} else{
			alert("NO cuentas con CANVAS")
		};
	}
}
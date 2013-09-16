//helper functions
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
  
})();

function rand(lo,hi) {
  return lo + Math.random()*(hi-lo);
}

function randColor() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

//constants accross the game
var consts = {
  'ground': 500,
  'playerW': 50,
  'playerH': 126,
  'initialPower': 25,
  'wallCount': 7,
  'starsCount': 250
};

//refactor note: might be nice to put all these into an 'app' object as well
var effects = [];
var camera = 0;
var ctx = document.getElementById('canvas').getContext('2d');
var pressed = {};
var player = new Box(0,300,consts.playerW,consts.playerH);
var playerAnim = {};
var sprite = new Image();
sprite.src = "sprites.png";

var jumping = false;
var charging = false;
var playerDied = false;
var gameWon = false;


//generate the walls
var walls = [];
var nextWall = 300;
for(var i=0; i< consts.wallCount; i++){
  var height  = rand(250,400);
  var width = rand(50+i*5,100+i*5);
  walls.push(new Box(nextWall,consts.ground-height,width,height));
  var dist = rand(100,500);
  nextWall += width+dist;
}
//boss wall!
walls.push(new Box(nextWall-20,consts.ground-450,300,450));

//final objective
var magicDoor = new Box(nextWall+50,consts.ground-126,50,126); 

//backgrounds...
var skyline1 = [];
for(var i=0; i<200; i++){
  skyline1[i] = rand(20,250);
}

var skyline2 = [];
for(var i=0; i<100; i++){
  skyline2[i] = rand(50,200);
}

var skyline3 = []
var skyline3dists = []
var skyline3widths = []
for(var i=0; i<100; i++){
  skyline3[i] = rand(250,400);
  skyline3dists[i] = rand(250,500);
  skyline3widths[i] = rand(50,100);
}

var starxs =[]
var starys =[]
var starrads =[]
for(var i=0; i<consts.starsCount;i++){
  starxs.push(rand(-50,1000));
  starys.push(rand(0,consts.ground));
  starrads.push(rand(1,4));
}


function setup() {
  document.addEventListener('keydown', function(e){
        pressed[e.keyCode] = true;
  });
  
  document.addEventListener('keyup', function(e){
    pressed[e.keyCode] = false;
  });
  
  player.dy = 0;
  player.power = 25;
  player.maxpower = 150;
  
  playerAnim.idle = [];
  playerAnim.running = [];
  for(var i=0; i < 4; i++){
    playerAnim.idle.push({x:i*64, y:0});
    playerAnim.running.push({x:i*64,y:64});
  }
  
  playerAnim.index = 0;
  playerAnim.name = "idle";
}


function gameLoop() {
  updateGameState();
  checkConditions();
  processAnimations();
  draw();
  cleanUp();
  window.requestAnimFrame(gameLoop);
}

function updateGameState() {
  //freeze controls if player is dead
  if(playerDied){return false;}
  
  playerAnim.name = "idle";
  charging = false;
  
  //charging lazer
  if(pressed['L'.charCodeAt(0)] == true){
    if(player.power < player.maxpower){
      console.log("Aaaaaaaaaaa!!!")
      player.power += 0.5;
    } else {
      console.log("MAX POWER!");
    }
    //when charging, you can only charge
    charging = true;
    effects.push(new risingLineEffect());
  }
  
  
  //moving forward
  if(pressed['A'.charCodeAt(0)] == true && !charging) {
    player.x -= 3;
    playerAnim.name = "running";
  }
  
  //moving backward
  if(pressed['D'.charCodeAt(0)] == true && !charging) {
    player.x += 3;
    playerAnim.name = "running";
  }
  
  if(pressed[' '.charCodeAt(0)] == true && !charging) {
    if(!jumping && player.getBottom()>0){
      player.dy -= 20;
      jumping = true;
    }}
  else {
    jumping = false;
  }
  
  if(pressed['J'.charCodeAt(0)] == true && !charging){
    effects.push(new lazerEffect(player.x+player.w-10,player.y+20));
    if(player.getBottom() < consts.ground){ 
      player.x -= (Math.pow(player.power,2))*0.0010; 
    }else{
      player.x -= (Math.pow(player.power,2))*0.000325;
    }
    if(player.power > 10){player.power -= 0.1;};
  }
  
  
  
  //float while using lazer (if you have enough power)!
  if(pressed['J'.charCodeAt(0)] != true || player.power < 20){     
    player.y += player.dy;
    player.dy += 1;
    
  }
  
  camera = player.x - 200;
  
  if(rand(0,100) > 99){
    effects.push(new lavaBallEffect());
  }
  
  
  updateWalls();
  player.updateStatus();
  if(player.health > 0 && Math.random() > ((player.health/(player.w*player.h)) || 0)){
    effects.push(new hurtEffect());
  }
  
}

function updateWalls(){
  walls.forEach(function(wall){
    wall.updateStatus();
  });
}


//refactor note: this is really similar to setup
//so the may be able to be merged, but if not
//at least pull everything into some constants
function resetGame(){
  effects = [];
  if(gameWon){
    effects.push(new superTextEffect("Welcome back champion!!!",100,0,300))
      } else {
        effects.push(new superTextEffect("Welcome back!",100,0,300))
      }
  playerDied = false;
  gameWon = false;
  player.x = 0;
  player.y = 300;
  player.power = consts.initialPower; 
  player.health = player.h*player.w;
  walls.forEach(function(w){
    w.health = w.h*w.w;
  });
  
}

function checkConditions() {
  //win condition
  if(player.intersects(magicDoor)){
    //don't want to run this everytime the intersection is found
    if(!gameWon){
      //kill the lava balls
      effects = [];
      gameWon = true;
      setTimeout(resetGame,800);
    }
    effects.push(new superTextEffect("YOU WIN!!!",
                                     rand(20,50),
                                     rand(player.x-150,player.x+player.w+150),
                                     rand(player.y-150,player.y+150))
                );
  }
  
  //death condition (only need to set this one, hence the flag)
  if(player.health <= 0 && !playerDied){
    playerDied = true;
    effects.push(new superTextEffect("YOU DEAD!!!!!!",60,player.x,player.y));
    setTimeout(resetGame,800);
  }
  
  walls.forEach(function(wall){
    if(player.intersects(wall)){
      player.damage(500);
      player.y -= 4
      player.x -= 10
      effects.push(new superTextEffect("Owweee!",30,player.x,player.y));
    }
  });
  
  if(player.getBottom() > consts.ground){
    player.dy = 0;
    player.setBottom(consts.ground);
  }
  
  if(player.getBottom() < 0){
    player.y = 0;
    player.dy= 0;
  }
  
  if(player.getLeft() < -300){
    effects.push(new lavaBallEffect());
    effects.push(new lavaBallEffect());
    effects.push(new lavaBallEffect());
  }
  
}


var tick = 0;
function processAnimations() {
  
  tick++;
  //rate of animations
  if(tick % 6 == 0){
    playerAnim.index++;
  }
  
  if(playerAnim.index >= playerAnim[playerAnim.name].length){
    playerAnim.index = 0;
  }
  
}

function drawBackground(ctx){
      // background - sky
  ctx.fillStyle = "#111122";
  ctx.fillRect(0,0,800,600);
  
}

function drawGround(ctx){
  //ground
  ctx.fillStyle = "#555555";
  ctx.fillRect(0,500,800,100);
}

function drawMagicDoor(ctx){
  ctx.save();
  ctx.fillStyle = randColor();
  magicDoor.fillRect(ctx);
  ctx.restore();
}

function drawPlayer(ctx){
  if(player.health <= 0){return false;
                        }
  ctx.save();
  ctx.translate(player.x,player.y);
  var slice = playerAnim[playerAnim.name][playerAnim.index];
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.drawImage(sprite,
                slice.x,slice.y,64,64, //src
                    -64-32,-64-32+8,128*2,128*2 //dst
               );
  
  ctx.restore();}

function drawWalls(ctx){
  ctx.fillStyle = "#a9a9a9";
  walls.forEach(function(wall){
    if(wall.health > 0){
      wall.fillRect(ctx);
    }
  });
}


function drawStarfield(ctx){
  ctx.save();
  ctx.translate(-camera/10,0);
  for(var i=0; i < consts.starsCount ; i++){
    ctx.fillStyle = "#ffffaa;"
    //g.globalAlpha = rand(0.01,0.1);
    ctx.beginPath();
    rdiff = rand(0.9,1.1);        
    ctx.arc(starxs[i],starys[i],starrads[i]*rdiff,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();         
}

function drawSkyline1(ctx){
  ctx.save();
  ctx.translate(-camera/3,0);
  ctx.fillStyle = "#222230";
  for(var i in skyline1) {
    var h = skyline1[i];
    ctx.fillRect(i*25-200,consts.ground - h,26,h);
  }
  ctx.restore();
}

function drawSkyline2(ctx){
  ctx.save();
  ctx.translate(-camera/2,0);
  ctx.fillStyle = "#333344";
  for(var i in skyline2) {
    var h = skyline2[i];
    ctx.fillRect(i*50-200,consts.ground - h,51,h);
  }
  ctx.restore();
}

function drawSkyline3(ctx){
  ctx.save();
  ctx.translate(-camera/1.3,0);
  ctx.fillStyle = "#555567";
  for(var i in skyline3) {
    var h = skyline3[i];
    ctx.fillRect(i*skyline3dists[i],consts.ground - h,skyline3widths[i],h);
  }
  ctx.restore();
}


function drawEffects(ctx){
  //effects
  effects.forEach(function(ef){
    ef.tick();
    ef.draw(ctx);
  });
}


function draw() {
  drawBackground(ctx);
  drawStarfield(ctx);
  drawSkyline1(ctx);
  drawSkyline2(ctx);
  drawSkyline3(ctx);
  drawGround(ctx);
  
  ctx.save();
  ctx.translate(-camera,0);
  drawMagicDoor(ctx);
  drawPlayer(ctx);
  drawWalls(ctx);
  drawEffects(ctx);
  ctx.restore();
}
function refresh() {}

function Box(x,y,w,h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.health = this.w*this.h;
  this.damageCooldown = 0;
  this.fillRect = function(ctx) {
    ctx.fillRect(this.x,this.y,this.w,this.h);
  }
  this.getRight = function() { return this.x + this.w ; }
  this.getLeft = function(){ return this.x; }
  this.getTop = function(){return this.y; }
  this.getBottom = function(){ return this.y + this.h;}
  
  this.setRight = function(right){ this.x = right - this.w;
                          }
  this.setLeft = function(left){ this.x = left;
                            }
  this.setBottom = function(bottom){ this.y = bottom - this.h;
                            }
  this.setTop = function(top) { this.y = top;
                       }
  
  this.intersects = function(box) {
    if(box.health <= 0 || this.health <= 0){return false;
                                           }
    if(this.getRight() >= box.getLeft() 
       && this.getLeft() <= box.getRight()) {
      if(this.getBottom() >= box.getTop() &&
         this.getTop() <= box.getBottom()){
        return true;
      }
      
    }
    return false;
  }
  
  this.intersectedByPoint = function(x,y) {
    if(this.health <= 0){return false;
                        }
    if(this.getRight() >= x
       && this.getLeft() <= x) {
      if(this.getBottom() >= y &&
         this.getTop() <= y){
        return true;
      }
      
    }
    return false;
  }
  
  this.damage = function(d){
    this.health -= d;
    if(this.damageCooldown == 0){
      this.damageCooldown = 5;
          effects.push(new boxDamageEffect(this));
    }
    
  }
  
  //this is an optional method for boxes that may take damage
  //and potentially be more interactive later
  this.updateStatus = function(){
    if(this.damageCooldown > 0){
      this.damageCooldown--;
    }
    
  }
}



function cleanUp(){
  effects = effects.filter(function(ef){return ef.isAlive();                                            });
  
}


setup();
effects.push(new superTextEffect("Welcome to Lazerhead!!!",100,0,300));
window.requestAnimFrame(gameLoop);

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
  var height  = rand(250,500);
  var width = rand(50+i*5,100+i*20);
  walls.push(new Box(nextWall,consts.ground-height,width,height));
  var dist = rand(100,500);
  nextWall += width+dist;
}
//boss wall!
walls.push(new Box(nextWall-20,consts.ground-450,600,450));

//final objective
var magicDoor = new Box(nextWall+50,consts.ground-126,50,126); 

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
  
  lazerFiring = false;
  playerInjured = playerInjured > 0 ? playerInjured - 1 : 0 ;
  wallDamaged = wallDamaged > 0 ? wallDamaged - 1 : 0 ;
  playerAnim.name = "idle";
  charging = false;
  jumpPressed = false;
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
	  jumpPressed = true;
    }}
  else {
    jumping = false;
  }
  
  if(pressed['J'.charCodeAt(0)] == true && !charging){
    lazerFiring = true;
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
      playerInjured = consts.playerInjuredSFXt;
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
  drawSkyline(ctx,3,"#222230",25,skyline1);
  drawSkyline(ctx,2,"#333344",50,skyline2);
  drawSkylineSpaced(ctx);
  drawGround(ctx);
  
  ctx.save();
  ctx.translate(-camera,0);
  drawMagicDoor(ctx);
  drawPlayer(ctx);
  drawWalls(ctx);
  drawEffects(ctx);
  ctx.restore();
}

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

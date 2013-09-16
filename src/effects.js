//
//Effects
//
function lavaBallEffect(){
  this.age = 0;
  this.maxage = 800;
  this.size = rand(20,50);
  this.x = player.x - 350;
  this.y = rand(consts.ground-this.size,0);
  this.box = new Box(this.x+this.size*0.15,this.y+this.size*0.15,this.size*0.7,this.size*0.7);
  this.dx = rand(2,4);
  this.tick = function(){
    this.age++;
    this.x += this.dx;
    this.box.x += this.dx;
    if(this.box.intersects(player)){
      //console.log("ouch!")
      effects.push(new superTextEffect("ouch!",20,player.x,player.y))
      player.y -= 10;
      player.x += 30;
      this.age = this.maxage;
      player.damage(this.size*this.size);
    }
    
  }
  
  this.draw = function(ctx){
    ctx.save();
    ctx.fillStyle = "#dd2222";
    this.box.fillRect(ctx);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#dddd22";
    ctx.fillRect(this.x,this.y,this.size,this.size);
    ctx.restore();
  }
  
  
  this.isAlive = function(){
      return this.age < this.maxage;
  }
    
  
}

function superTextEffect(text,duration,x,y){
  this.text = text;
  this.x = x;
  this.y = y;
  this.age = 0;
  this.maxage = duration;
  
  this.tick = function(){
    this.age++;
  }
  
  this.draw = function(ctx){
    ctx.save();
    ctx.fillStyle = "#FFFF00";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(this.text,this.x,this.y);
    ctx.restore();
    
  }
  this.isAlive = function(){
    return this.age < this.maxage;
  }
}

function risingLineEffect(){
  this.x = rand(player.x-20-player.power/5,player.x+player.w+20+player.power/5);
  this.y = player.y+player.h;
  this.length = rand(player.power/5,player.power/2);
  this.width = player.power/25;
  this.dy = rand(2,6);
  this.age = 0;
  this.maxage = rand(5,10);
  
  this.tick = function(){
    this.age++;
    this.y -= this.dy;
  }
  
  this.draw = function(ctx){
    ctx.save();
    ctx.globalAlpha = rand(0.1,0.5);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.moveTo(this.x,this.y);
    ctx.lineTo(this.x,this.y-this.length)
    ctx.stroke();
    ctx.restore();
    }
  
  this.isAlive = function(){
    return(this.age < this.maxage);
  }
  
}


//used as a way of indicating how hurt the player is
//should look like a puff of smoke
function hurtEffect(){
  this.x = player.x+rand(-15,15)+player.w;
  this.y = player.y+15+rand(-15,15);
  this.dx = rand(3,3);
  this.dy = rand(3,3);
  this.rad = rand(3,10);
  this.alpha = rand(0.5,0.8);
  this.dalpha = rand(0.8,0.95);
  this.age = 0;
  this.maxage = rand(15,30);
  
  this.tick = function(){
    this.age++;
    this.x -= this.dx;
    this.y -= this.dy;
    this.rad += 1;
    this.alpha *= this.dalpha;
  }
  
  this.draw = function(ctx){
    ctx.save();
    ctx.fillStyle = "#444444";
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.rad,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  
  this.isAlive = function(){
    return(this.age < this.maxage);
  }
  
  
}

//flashes damage on any box
function boxDamageEffect(box){
  this.box = box;
  this.age = 0;
  this.maxage = 4;
  this.damageColor = "#ffff00"
  this.tick = function(){
      this.age++
  }
  
  this.draw = function(ctx){
      ctx.fillStyle = this.damageColor;
    this.box.fillRect(ctx);
  }
    
  this.isAlive = function(){
    return this.age < this.maxage;
  }
}

//main effect for players lazer
//refactor note: I'm not entirely sure it's worth abstracting the x,
//ys out here and not elsewhere. while technically cleaner this way
//the lazerEffect will never originate anywhere other than the player
function lazerEffect(x,y){
  this.x = x;
  this.dx = 5;
  this.y = y;
  this.age = 0;
  this.maxage = player.power*2;
  this.alive = true;
  this.power = player.power
  this.color = "#ff0000";
  this.tick = function(){
    this.age++;
    var clear = true;
    for(var i = 0 ;i < walls.length;i++){
      if(walls[i].intersectedByPoint(this.x+this.radius(),this.y) && this.alive){    
        clear = false;
        this.age += 5;
        walls[i].damage(this.radius());
      }
    }
    if(clear){this.x += this.dx;}
    
    if(this.age > this.maxage) {
      this.alive = false;
      return;
    }
  }
  
  this.radius = function(){
    return ((0.5*this.power)*(1-(this.age/this.maxage))+(0.40*this.power));
  }
  
  this.draw = function(ctx) {
    if(!this.alive) return;
    
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = rand(0.2,0.1);
    //g.fillRect(this.x,this.y,20,20*(1-(this.age/this.maxage)));
    ctx.beginPath();
    ctx.arc(this.x+this.radius(),this.y,this.radius(),0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();}
  
  //isAlive will be used to remove effects from global effects list
  this.isAlive = function(){
    return this.age < this.maxage;
  }
  
}

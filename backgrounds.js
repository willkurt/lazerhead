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

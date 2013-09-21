//audio
//basic waves from: joshondesign.com/p/demos/sound/waveviz/
var sin = Math.sin;
function square(t){
  var v = sin(t);
  if(v < 0) return -1;
  return 1;
}

function saw(t){
  t = t/(2*Math.PI);
  return (t - Math.floor(t))*2 -1;
}

function tone(t,freq){
  return sin(t*2*Math.PI*freq);
}


var actx = new webkitAudioContext();
var jsnode = actx.createScriptProcessor(512,0,1);
var t = 0;
jsnode.onaudioprocess = function(e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < output.length; i++) {
        out = (lazerSFX(t)+
                     playerInjuredSFX(t)+
                     chargeSFX(t)+
					 wallDamagedSFX(t)
              )/4;
      output[i] = out;
        t += 1/44000.0;
    }
}
jsnode.connect(actx.destination);

//refactor note: really should pull out all these state vars at somepoint
var lazerFiring;
function lazerSFX(t){
  if(lazerFiring){
    return (tone(t,261.63)+tone(t*1.03,261.63))/2;
  } else {
    return 0;
  }
}





var playerInjured;
function playerInjuredSFX(t){
  if(playerInjured > 0){
    return Math.random(t)+sin(t*2*Math.PI*260);
  } else {
    return 0;
  }

}

var wallDamaged;
function wallDamagedSFX(t){
   if(wallDamaged > 0){
      return tone(t,120);
   } else {
     return 0;
   }
}

var charget = 0.15;
var chargeUp = false;
function chargeSFX(t) {

  if(charging){
    if(charget > 0.3){
      chargeUp = false
    }
    if(charget < 0.01){
      chargeUp = true
    }

    if(!chargeUp){
      charget -= 1/(44000.0*(1.1-player.power/player.maxpower));
    } else {
      charget += 1/(44000.0*(1.1-player.power/player.maxpower));
    }
    var freq = 260*(1+charget);
    return (sin(charget*2*Math.PI*freq)+
            sin(charget*2*Math.PI*freq*1.2)+
            sin(charget*2*Math.PI*freq*1.7))/3;
  }
  return 0;
}



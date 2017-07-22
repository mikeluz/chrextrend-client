function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// AUDIO SETUP
const audioCtx = new AudioContext();
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
var superGain;
gain.gain.value = 0.2;
osc.connect(gain);
gain.connect(audioCtx.destination);
osc.frequency.value = 220;
var playing = false;

// FEED INTERVAL FOR CLEARING
let feedInterval;
// CURRENT DIV FOR CLEARING DURING FEED
let current;

////////////////////////////////
////// EVENT HANDLERS /////////
//////////////////////////////
window.addEventListener('load', function () {

    // URLs -- prod and local
    var url = 'https://chrextrendms.herokuapp.com'; // prod
    // var url = 'http://localhost:3001'; // local

    [].slice.call(document.getElementsByTagName('body'))[0].style.backgroundColor = getRandomColor();
    setInterval(() => {
      [].slice.call(document.getElementsByTagName('body'))[0].style.backgroundColor = getRandomColor();
    }, 500)

    var leadOsc = audioCtx.createOscillator();
    leadOsc.frequency.value = 523.251130601197269;
    leadOsc.connect(gain);
    leadOsc.start();

    var coinToss;
    var leadUp = true;
    var noteFreqs = []; 
    noteFreqs[0] = 523.251130601197269;
    noteFreqs[1] = 587.329535834815120;
    noteFreqs[2] = 659.255113825739859;
    noteFreqs[3] = 698.456462866007768;
    noteFreqs[4] = 783.990871963498588;
    noteFreqs[5] = 880.000000000000000;
    noteFreqs[6] = 987.766602512248223;

    var up = false;
    osc.start();

    playing = true;

    // while (playing) {
      for (var i = 0; i < 1000; i++) {

        if (i > 10) {
          if (i % 20 === 0) {
            osc.frequency.value = 261.625565300598634; // C
          } 
          if (i % 40 === 0) {
            osc.frequency.value = 293.664767917407560; // D
          }
          if (i % 60 === 0) {
            osc.frequency.value = 329.627556912869929; // E
          }
          if (i % 80 === 0) {
            osc.frequency.value = 349.228231433003884; // F
          }
          if (i % 100 === 0) {
            osc.frequency.value = 311.126983722080910; // D#
          }
          if (i % 50 === 0) {
            osc.frequency.value = 195.997717990874647; // G
          }
        }

        if (up) {
          osc.frequency.setValueAtTime(osc.frequency.value * 1.5, audioCtx.currentTime + i/4);
          up = false;
        } else {
          osc.frequency.setValueAtTime(osc.frequency.value, audioCtx.currentTime + i/4);
          up = true;
        }
      }
    
      for (var k = 1; k < 1000; k++) {
        coinToss = Math.floor((Math.random() * 10) % 7);
        var frequency = noteFreqs[coinToss];
        leadOsc.frequency.setValueAtTime(frequency, audioCtx.currentTime + (k/4 + coinToss));
      }
    // }

    // HIGH "SUPER" OSC
    var superLead = audioCtx.createOscillator();
    superLead.frequency.value = 1760;
    superLead.type = 'triangle';
    superGain = audioCtx.createGain();
    superGain.gain.value = 0.02;
    superLead.connect(superGain);
    superGain.connect(audioCtx.destination);
    superLead.start();

    // super notes
    noteFreqs[0] = 1046.502261202394538;
    noteFreqs[1] = 1174.659071669630241;
    noteFreqs[2] = 1318.510227651479718;
    noteFreqs[3] = 1396.912925732015537;
    noteFreqs[4] = 1567.981743926997176;

    for (var j = 1; j < 1000; j++) {
      var freq = noteFreqs[(j + Math.floor(Math.random() * 10)) % 5];
      superLead.frequency.setValueAtTime(freq, audioCtx.currentTime + (j*5));
    }

  // document.getElementById('getAll').addEventListener('click', () => {
    // LOADING ANIMATION
    document.getElementById("loading").animate([
      // keyframes
      { transform: 'translateY(360px)' }, 
      { transform: 'translateY(-16px)' }
    ], { 
      // timing options
      duration: 1000,
      iterations: Infinity
    });

    // GET CURRENT TRENDING ON LOAD
    fetch(url + '/api/trending')
      .then(res => {
        document.getElementById('loading').style.display = "none";
        current = document.createElement('div');
        current.id = "trCurrent";       
        return res.json().then(data => {
          var date = new Date();
          var dateDiv = document.createElement('div');
          dateDiv.innerHTML = date.toString().slice(0, -15);
          current.appendChild(dateDiv); 
          current.appendChild(document.createElement('br'));         
          data.forEach(t => {
            var item = document.createElement('div');
            item.innerHTML = t;
            current.appendChild(item);
            current.appendChild(document.createElement('br'));
          });
          document.getElementById('trendings').appendChild(current);
        });
      });
  // });

  // GET STATS ON CLICK
  document.getElementById('getStats').addEventListener('click', () => {
    if (feedInterval) clearInterval(feedInterval);
    if (document.getElementById('trCurrent')) document.getElementById('trCurrent').style.display = "none";
    if (document.getElementById('feed')) document.getElementById('feed').style.display = "none";
    document.getElementById("loading").style.display = "block";
    document.getElementById("loading").animate([
      // keyframes
      { transform: 'translateY(360px)' }, 
      { transform: 'translateY(-16px)' }
    ], { 
      // timing options
      duration: 1000,
      iterations: Infinity
    });
    fetch(url + '/api/trending/stats')
      .then(res => {
        document.getElementById('loading').style.display = "none";
        // document.getElementById('trCurrent').style.display = "none";
        current = document.createElement('div');
        current.id = 'stats';
        document.getElementById('container').style.overflow = "scroll";
        return res.json().then(data => {
          data.forEach(t => {
            if (t) {
              var item = document.createElement('div');
              item.innerHTML = t.toString().split(',').join(" => ");
              current.appendChild(item);
            }
          });
          document.getElementById('trendings').appendChild(current);
        });
      });
  });

  // START FEED ON CLICK
  document.getElementById('getFeed').addEventListener('click', () => {
    if (feedInterval) clearInterval(feedInterval);
    if (document.getElementById('feed')) document.getElementById('feed').display = "none";
    document.getElementById('trCurrent').style.display = "none";
    document.getElementById("loading").style.display = "block";
    document.getElementById('container').style.overflow = "";
    if (document.getElementById('stats')) document.getElementById('stats').style.display = "none";     
    document.getElementById("loading").animate([
      // keyframes
      { transform: 'translateY(360px)' }, 
      { transform: 'translateY(-16px)' }
    ], { 
      // timing options
      duration: 1000,
      iterations: Infinity
    });
    // FIRST FEED CALL BEFORE INTERVAL KICKS IN
    fetch(url + '/api/trending')
      .then(res => {
        document.getElementById('loading').style.display = "none";
        current = document.createElement('div');
        current.id = 'feed';
        return res.json().then(data => {
          var date = new Date();
          var dateDiv = document.createElement('div');
          dateDiv.innerHTML = date.toString().slice(0, -15);
          current.appendChild(dateDiv); 
          current.appendChild(document.createElement('br'));         
          data.forEach(t => {
            var item = document.createElement('div');
            item.innerText = t;
            current.appendChild(item);
            current.appendChild(document.createElement('br'));
          });
          document.getElementById('trendings').appendChild(current);
        });
      });
    // SET INTERVAL OF FEED
    feedInterval = setInterval(() => {
      fetch(url + '/api/trending')
        .then(res => {
          document.getElementById('feed').innerHTML = '';
          document.getElementById('loading').display = "none";        
          return res.json().then(data => {
            var date = new Date();
            var dateDiv = document.createElement('div');
            dateDiv.innerHTML = date.toString().slice(0, -15);
            document.getElementById('feed').appendChild(dateDiv); 
            document.getElementById('feed').appendChild(document.createElement('br'));         
            data.forEach(t => {
              var item = document.createElement('div');
              item.innerHTML = t;
              document.getElementById('feed').appendChild(item);
              document.getElementById('feed').appendChild(document.createElement('br'));
            });
          });
        });
      }, 30000);
  });

  var muted = false;
  document.getElementById('mute').addEventListener('click', () => {
    if (!muted) {
      gain.gain.value = 0;
      superGain.gain.value = 0;
      muted = true;
    } else {
      gain.gain.value = 0.2;
      superGain.gain.value = 0.02;
      muted = false;
    }
  });

});
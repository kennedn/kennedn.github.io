window.onpageshow = function(event) {
if (event.persisted) {
    window.location.reload();
}
};

function isLinkLocal(link) {
    return (link.host !== window.location.host);
}

function resizeOnCanvas(time, tileSqrt) {
        let object = $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
        if(object.length > 0) {
            resizeTile(tileSqrt);
            return;
        }
        else {
            setTimeout(function() {
                resizeOnCanvas(time, tileSqrt);
            }, time);
        }
}
function resizeTile(tileSqrt) {
  
  // Get Window dimensions
  let WIDTH = $(window).outerWidth();
  let HEIGHT = $(window).outerHeight();
  let docSize = Math.min(WIDTH, HEIGHT);

  // Calculate maximum width / height each tile could have to fit in current window (minus a small pad)
  let tileWidth= Math.floor((WIDTH * (1/tileSqrt)) - (WIDTH * 0.002));
  let tileHeight= Math.floor((HEIGHT * 1/tileSqrt) - (HEIGHT * 0.009));
  // Get lowest of the two and use this as the tile width & height going forward
  let tileSize=Math.min(tileWidth,tileHeight);

  // Derive a font scaler from the tileSize
  let fontScaler = tileSize / 360;

  // Set Background div to the window dimensions (for colour transitions)
  $("#background").css({'width': WIDTH , 'height': HEIGHT});

  // Set container divs to equal the derived tile sizes
  $(".tile-container, .tile > .front, .tile > .back").css(
    {'width': tileSize, 'height': tileSize});
  $(".tile-container-big, .tile-big > .front, .tile-big > .back").css(
    {'width': tileSize*tileSqrt, 'height': tileSize*tileSqrt});

  // Move the center div to the center of the screen using our derived tile sizes
  $('.center').css({
     'position' : 'absolute',
     'left' : '50%',
     'top' : '50%',
     'margin-left' :-(tileSize*tileSqrt)/2,
     'margin-top' : -(tileSize*tileSqrt)/2,
     'width': tileSize * tileSqrt,
     'height': tileSize * tileSqrt
  });


  $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").each(function() {
      let $wrap = $(this);
      let wrapWidth = $wrap.width(); // width of the wrapper
      let wrapHeight = $wrap.height();
      let childWidth = $wrap.children("iframe").contents().find("canvas").width();  // width of child iframe
      let childHeight = $wrap.children("iframe").contents().find("canvas").height(); // child height
      let wScale = wrapWidth / childWidth;
      let hScale = wrapHeight / childHeight;
      let scale = Math.min(wScale,hScale);  // get the lowest ratio
      $wrap.children("iframe").css({"transform": "scale("+scale+")", "transform-origin": "left top" });  // set scale
      $wrap.children("iframe").css({'height': wrapHeight*1/(Math.floor(scale * 10)/10)});
      $wrap.children("iframe").css({'width': wrapWidth*1/(Math.floor(scale * 10)/10)});
  // gameFrame.css({'width': gameSize}); 
  });
  
  // Set fonts based on scaler
  $(".tile .back p").css({'font-size' : 26 * fontScaler});
  $("#big-p").css({'font-size' : 34 * fontScaler});
  $(".tile .back h1").css({'font-size' :32 * fontScaler});
  $("h1").css({'font-size' :32 * fontScaler});

  let canvas = $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
  if (canvas.length === 0)
    resizeOnCanvas(120, tileSqrt);
}



$(document).ready(function() {
  let lastFlipped;
  let jsonFile = false;
  jsonFile = localStorage.getItem('jsonFile');
  localStorage.removeItem('jsonFile');
  if(!jsonFile)
    jsonFile = "/json/main.json";

  let tileSet = JSON.parse($.getJSON({'url': jsonFile, 'async': false}).responseText).tiles;
  let colFade = 400;
  let tileSqrt = Math.max(Math.ceil(Math.sqrt(tileSet.length)), 2);
  let lastColor = false;
  lastColor = localStorage.getItem('lastColor');
  if(lastColor) {
    $("body").css("background-color", lastColor);
    $("#background").css("background-color", lastColor);
  }
  else {
    $("body").css("background-color", tileSet[1].color);
    $("#background").css("background-color", tileSet[1].color);
  }

  
  tileHTML = `<div class="center">
                <div class="tile-container-big">
                  <div id=0 class="tile-big">
                    <div class="front">`;

  tileSet.forEach((tile, i) => {
    tileHTML+=`<div class="tile-container">
      <div id="${i+1}" class="tile" style="${tile.active ? '' : 'display:none; cursor:default;'}">

        <div class="front">
          <h1> ${tile.title} </h1>
          <img onmousedown="return false" src="${tile.icon}"/>
        </div>

        <div class="back">
          <img onmousedown="return false" src="/images/tile_back.png"/>
          <h1> ${tile.title} </h1>

        <div class="p-bg"> 
            <p> ${tile.text} </p>
        </div> 

        </div>
        
      </div>
    </div>`;
    //<div class="p-bg"><p id="big-p"> ${paras[0][0]} </p></div></div></div></div><div class='wrapperTop'><iframe seamless scrolling='no' frameBorder='0' class='gameFrame' src='/pong/index.html'></iframe></div>
    // Determine break points in the tile list so that we get as close to 
    if(i != 0 && i + 1 % tileSqrt == 0)
      tileHTML += `</br>`;
  });

  
  tileHTML += `</div>
               <div class="back">
                  <img onmousedown="return false" src="/images/tile_back.png"/>
                  <div class="p-bg">
                    <p id="big-p"> This is a big frickin tile my dude. </p>
                  </div>
                  <div class='wrapperTop'>
                    <iframe seamless scrolling='no' frameBorder='0' class='gameFrame' src='/gravitation/index.html'></iframe>
                  </div>
                </div>
                </div>
                </div>
                `;
  $("body").append(tileHTML);

  resizeTile(tileSqrt);
  window.onresize = () => {resizeTile(tileSqrt)};


  // Grab the height of the container, half it and apply it as a hard value to the tiles origin.
  // Setting this within the stylesheet to 50% does not seem to work correctly, this is a workaround
  $(".tile").css("transform-origin", "50% " + $(".tile-container .front").css("height").match(/\d+/) / 2 + "px");
  // For each tile        
  for(let i=1;i <= tileSet.length; i++){
    //Rotate back from 90 deg end-flipped state
    $("#"+i+ " .front, .back").hide().fadeIn(400);

    //watch for a click on the div with id i
    $("#"+i).click(function() {
      // Set our id again
      i = Number(this.id);
      // If we did not click the same tile twice
      if( i != lastFlipped ) {  
        // Rotate clicked tile
        $(this).toggleClass('flipped');
        // Animate the paragraph backgrounds height
        $(this).find(".p-bg").animate({height: '58%'},600,"swing", function() {
          // Check if we are a big tile, if so replace text and iframe src
            // $("#0 > .back > .wrapperLeft").remove();
            // $("#0 > .back > .wrapperTop").remove();
        });    
        
  
        // Set body bg color, show background div then fade it, setting the correct color once it is opaque 
        // In short this does a nice fade effect on the background color
        $("body").css("background-color", tileSet[i - 1].color);
        $("#background").show().fadeOut(colFade, "linear", function() {
            $(this).css("background-color", tileSet[i - 1].color); 
          });
  
          // reflip the last tile
          $("#"+lastFlipped).toggleClass('flipped');
          //reset the paragraph background to 1% height
          $("#"+lastFlipped).find(".p-bg").animate({height: '1%'},400);
      }
      // flip tile back around
      else if(i === tileSet.length -2) {
        $("#0").toggleClass('flipped');
        $("#0").find(".p-bg").animate({height: '30%'},800,"swing");
        resizeTile(tileSqrt);
      }
      // Ending animations.
      else {
        // For each tile that isnt the one we iust clicked
        for(let k=1;k<=tileSet.length;k++) {
            $("#"+k+ " .front, .back").fadeOut(400, () => {
                k = this.id;
                if( k == lastFlipped){
                  localStorage.setItem('lastColor', tileSet[k-1].color);

                  if(tileSet[k-1].url.split('.').pop() === 'json') {
                    localStorage.setItem('jsonFile', tileSet[k-1].url);
                    location.reload();
                    //location.href = location.href;
                  }
                  else
                    window.location.href = tileSet[k-1].url;
                }
            });
        }
      }       
      lastFlipped = Number(this.id);
    });
  }
});

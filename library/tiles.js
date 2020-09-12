window.onpageshow = function(event) {
if (event.persisted) {
    window.location.reload();
}
};

function isLinkLocal(link) {
    return (link.host !== window.location.host);
}

function resizeOnCanvas(time, tileSqrt) {
        let object = $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
        if (typeof $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").attr("src") === 'undefined' ) {
           return false;
        }
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
  $("#background").css({'width': WIDTH * 1.1 , 'height': HEIGHT * 1.1});

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


function tileGenerator(jsonFile) {
  $(".center").remove();
  $.getJSON(jsonFile, (data) => {
    let tileSet = data.tiles;
    let lastFlipped;
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
      if (!tile.hasOwnProperty("outIcon"))
        tile.outIcon = false;
      if (tile.active)
        tileHTML+=`<div class="tile-container">
          <div id="${i+1}" class="tile end-flipped">
            <div class="front" style="background:${tile.color};">
              <h1> ${tile.title} </h1>
              <img onmousedown="return false" src="${tile.icon}"/>
            </div>`;
      else
        tileHTML+=`<div class="tile-container" style="pointer-events:none;">
          <div id="${i+1}" class="tile end-flipped">
            <div class="front" style="background:${tile.color};">
            </div>`;
      tileHTML+=`<div class="back">
              <img onmousedown="return false" src="${tile.outIcon}" onerror="this.src='/images/grid.png'"/>
              <div class="background" style="background:${tile.color}"></div>
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
                    <div class='wrapperLeft'>
                      <iframe seamless scrolling='no' frameBorder='0' class='gameFrame'></iframe>
                    </div>
                  </div>
                  </div>
                  </div>
                  `;
    $("body").append(tileHTML);

    resizeTile(tileSqrt);
    window.onresize = () => {resizeTile(tileSqrt);};


    // Grab the height of the container, half it and apply it as a hard value to the tiles origin.
    // Setting this within the stylesheet to 50% does not seem to work correctly, this is a workaround
    $(".tile").css("transform-origin", "50% " + $(".tile-container .front").css("height").match(/\d+/) / 2 + "px");
    // For each tile        
    for(let i=1;i <= tileSet.length; i++){
      //Rotate back from 90 deg end-flipped state
      //$("#"+i+ " .front, .back").hide().fadeIn(400);
      setTimeout((i) => {$("#"+i).removeClass('end-flipped')}, 400, i);

      //watch for a click on the div with id i
      $("#"+i).click(function() {
        // Set our id again
        i = Number(this.id);
        // Must catch a:hover event so that we can break out of tile flip click
        // and just navigate to URL if the user clicks an <a> tag
        if ($("a:hover").length != 0) {
          //window.location.href = $("a:hover").attr('href');
          window.open($("a:hover").attr('href'), '_blank');
          return false;
        }
        // If we did not click the same tile twice
        if( i != lastFlipped ) {  
          // Rotate clicked tile
          $(this).toggleClass('flipped');
          // Animate the paragraph backgrounds height
          $(this).find(".p-bg").animate({height: '70%'},600,"swing", function() {
            // Check if we are a big tile, if so replace text and iframe src
              // $("#0 > .back > .wrapperLeft").remove();
              // $("#0 > .back > .wrapperTop").remove();
            if (tileSet[i-1].url.split('/').pop() === 'index.html') {
              $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").get(0).contentWindow.location.replace(tileSet[i-1].url);
            }
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
        // Ending animations.
        else {
          // For each tile that isnt the one we iust clicked
          for(let k=1;k<=tileSet.length;k++)
            if (tileSet[lastFlipped-1].url.split('/').pop() !== 'index.html')
              $("#"+k).toggleClass('end-flipped');

          let url = tileSet[lastFlipped-1].url;
          let color = tileSet[lastFlipped-1].color;
          setTimeout((url, color, lastFlipped) => {
                localStorage.setItem('lastColor', color );

                if(url !== null) {
                  if (isLinkLocal(url) && url.split('.').pop() === 'json') {
                    history.pushState({ 'jsonFile': url }, "");
                    tileGenerator(url);
                  }
                  else if (isLinkLocal(url) && url.split('/').pop() === 'index.html') {
                    resizeTile(tileSqrt);
                    $("#0").toggleClass('flipped');
                    $("#0").find(".p-bg").animate({height: '30%'},800,"swing");
                  }
                  else
                    window.location.href = url;
                }
                else
                  location.reload();
          }, 350, url, color, lastFlipped);
        }       
        lastFlipped = Number(this.id);
      });
    }
  });
}

$(document).ready(function() {
  $("*").clearQueue();

  let jsonFile = "/json/main.json";
  window.addEventListener('popstate', (event) => {
    if (event.state == null)
      tileGenerator(jsonFile);
    else
      tileGenerator(event.state.jsonFile);
  });
  // No center div means tileGenerator has not ran
  if($(".center").length == 0) {
    if (history.state != null)
      tileGenerator(history.state.jsonFile);
    else
      tileGenerator(jsonFile);
  }

});

// returns true if provided hyperlink is local
function isLinkLocal(link) {
  if (link === null)
    return false;
  return (link.host !== window.location.host);
}

// Recursive canvas resize function to compensate for the time between 
// iframe onload event and canvas the becoming available on the DOM
function resizeOnCanvas(tileSqrt, time) {
  let object = $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
  // Canvas now exists so call resize function
  if(object.length > 0) {
      resizeTile(tileSqrt);
      return;
  }
  // Canvas not in DOM yet, call self again after a timeout
  else {
      setTimeout(function() {
          resizeOnCanvas(tileSqrt, time);
      }, time);
  }
}

// Dynamic resize function
// governs the sizing of the tile array, iframe canvas's and fonts.
function resizeTile(tileSqrt) {
  
  // Get Window dimensions
  let WIDTH = $(window).outerWidth();
  let HEIGHT = $(window).outerHeight();

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

  // Resize Canvas to fit within wrapper element
  $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").each(function() {
      let iframe = $(this).children("iframe");
      // Derive scaler values from the difference between canvas dimensions and wrapper
      let wScale = $(this).width() / iframe.contents().find("canvas").width();
      let hScale = $(this).height() / iframe.contents().find("canvas").height();
      // Get lowest value of the two scalers
      let scale = Math.min(wScale,hScale);
      // Scale the iframe, ensuring its constraints are big enough to fit the canvas
      iframe.css({"transform": "scale("+scale+")", "transform-origin": "left top" });
      iframe.css({'width': $(this).width() * 1 / (Math.floor(scale * 10) / 10)});
      iframe.css({'height': $(this).height() * 1 / (Math.floor(scale * 10) / 10)});
  });
  
  // Set fonts based on scaler
  $(".tile .back p").css({'font-size' : 26 * fontScaler});
  $("#big-p").css({'font-size' : 34 * fontScaler});
  $(".tile .back h1").css({'font-size' :32 * fontScaler});
  $("h1").css({'font-size' :32 * fontScaler});

}

// Build DOM elements, inserting properties from the tileSet JSON where relevant
function DOMBuilder(tileSet, tileSqrt) {
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
                  <div class="front" style="background:${tile.color};"></div>`;

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
    // Insert break (go to next row) if i == square root of tile number
    if(i != 0 && i + 1 % tileSqrt == 0)
      tileHTML += `</br>`;
  });

  tileHTML += ` </div>
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
          </div>`;

  // Append DOM elements to body
  $("body").append(tileHTML);
}

function tileClick(event) {
  // Set our id again
  let i = Number(this.id);
  let tileSet = event.data.tileSet;
  // Retrieve lastFlipped from local storage, set to false if not available
  let lastFlipped = Number(localStorage.getItem('lastFlipped'));
  if (lastFlipped === 0)
    lastFlipped = false;

  // Set some easy access varaibles for our tileSet
  let url = tileSet[i-1].url;
  let color = tileSet[i-1].color;
  let type = tileSet[i-1].type;
  // Determine whether tile seems to be a valid game
  let isGame = (isLinkLocal(url) && url.split('/').pop() === 'index.html' && type === 'game');

  // Must catch a:hover event so that we can break out of tile flip click
  // and just navigate to URL if the user clicks an <a> tag
  if ($("a:hover").length != 0) {
    window.open($("a:hover").attr('href'), '_blank');
    return false;
  }
  // If we are not clicking the same tile for a second time
  if( i != lastFlipped ) {  
    // Rotate clicked tile
    $(this).toggleClass('flipped');
    // Animate the paragraph backgrounds height
    $(this).find(".p-bg").animate({height: '70%'},600,"swing", function() {
      let iframe = $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").get(0);
      // Replace iframe source with url if tile is marked as a game and the url differs
      if (isGame && iframe.contentWindow.location.pathname !== url) {
        // Replace the iframe content with our url, an onload event should fire after doing so
        iframe.contentWindow.location.replace(url);
      }
    });    

    // Display a background div with the current color, switch the body to target color
    // and then fade the background div to get a nice transition effect
    $("body").css("background-color", tileSet[i - 1].color);
    $("#background").show().fadeOut(400, "linear", function() {
        $(this).css("background-color", tileSet[i - 1].color); 
    });
    // reflip the last tile
    $("#"+lastFlipped).toggleClass('flipped');
    //reset the paragraph background to 1% height
    $("#"+lastFlipped).find(".p-bg").animate({height: '1%'},400);
  }
  // Ending animations.
  else {
    // pull some needed vars from the tile
    url = tileSet[lastFlipped-1].url;
    color = tileSet[lastFlipped-1].color;
    type = tileSet[lastFlipped-1].type;

    // Perform ending animation for each tile if we are not a game
    if (!isGame) {
      for(let k=1;k<=tileSet.length;k++) {
          if (k === lastFlipped) {
            // hot fix for chrome/chromium, which can't handle multiple css transition subclasses
            $("#"+k).css("transition", "transform 0.4s");
            $("#"+k).css("transform", "rotateY( 90deg )");
          }
          else
            // Flip 90 degrees so that the tile transitions to invisible
            $("#"+k).toggleClass('end-flipped');
      }
    }
    else if (isGame) {
      $("#0").toggleClass('flipped');
      $("#0").find(".p-bg").animate({height: '30%'},800,"swing");
    }
    // Handle url redirection and history persistance, runs on a timeout 
    // so that we execute just as the second tile flip animation is finishing 
    setTimeout((url, color, type, isGame, lastFlipped) => {
      localStorage.setItem('lastColor', color );
      if(url !== null) {
        if (isLinkLocal(url) && url.split('.').pop() === 'json') {
          history.pushState({ 'jsonFile': url }, "");
          tileGenerator(url);
        }
        else if (!isGame)
          window.location.href = url;
      }
      else
        location.reload();
      localStorage.removeItem('lastFlipped');
    }, 350, url, color, type, isGame, lastFlipped);
  }
  localStorage.setItem('lastFlipped',this.id);
}

function tileGenerator(jsonFile) {
  // Remove previous tile DOM elements & children
  $(".center").remove();
  // Generate tiles after getJSON retrieves jsonFile
  $.getJSON(jsonFile, (data) => {
    // Retrieve tiles structure from jsonFile
    let tileSet = data.tiles;
    // Calculate a square root from num of timeto be used for tile sizing later on
    let tileSqrt = Math.max(Math.ceil(Math.sqrt(tileSet.length)), 2);

    // Retrieve last clicked tile color from localStorage if available
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
    // Build and append HTML elements
    DOMBuilder(tileSet, tileSqrt);

    resizeTile(tileSqrt);
    // Call resizeTile on window resize
    window.onresize = () => {resizeTile(tileSqrt);};
    // Call resizeOnCanvas when new iframe is loaded
    $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").on('load', () => {
      resizeOnCanvas(tileSqrt, 100);
    });

    // Grab the height of the container, half it and apply it as a hard value to the tiles origin.
    // Setting this within the stylesheet to 50% does not seem to work correctly, this is a workaround
    $(".tile").css("transform-origin", "50% " + $(".tile-container .front").css("height").match(/\d+/) / 2 + "px");

    // For each tile        
    for(let i=1;i <= tileSet.length; i++){
      // Rotate each tile so that its front is visible

      setTimeout((i) => {$("#"+i).removeClass('end-flipped');}, 400, i);

      //watch for a click on the div with id i
      $("#"+i).click({"tileSet": tileSet}, tileClick);
    }
  });
}

window.onload = function() {
  localStorage.removeItem('lastFlipped');
  let jsonFile = "/json/main.json";
  // Set listener for history popstate, restore JSON from history if possible
  window.addEventListener('popstate', (event) => {
    if (event.state == null)
      tileGenerator(jsonFile);
    else
      tileGenerator(event.state.jsonFile);
  });
  // If popstate didn't fire, this either means the user
  // didn't use history to get here or they are navigating back from an external site
  if($(".center").length == 0) {
    if (history.state != null)
      tileGenerator(history.state.jsonFile);
    else
      tileGenerator(jsonFile);
  }
};

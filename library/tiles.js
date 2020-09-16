// returns true if provided hyperlink is local
function isLinkLocal(link) {
  if (link === null)
    return false;
  let a = document.createElement('a');
  a.href = link;
  return (a.host === window.location.host);
}

// Return base url for a given link string
function getHost(link) {
  if (link === null)
    return "";
  let a = document.createElement('a');
  a.href = link;
  return a.host;
}
// Recursive canvas resize function to compensate for the time between 
// iframe onload event and canvas the becoming available on the DOM
function resizeOnCanvas(time) {
  let object = $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
  // Canvas now exists so call resize function
  if(object.length > 0) {
      resizeTile();
      return;
  }
  // Canvas not in DOM yet, call self again after a timeout
  else {
      setTimeout(function() {
          resizeOnCanvas(time);
      }, time);
  }
}

// Dynamic resize function
// governs the sizing of the tile array, iframe canvas's and fonts.
function resizeTile() {
  let tileSqrt = localStorage.getItem('tileSqrt');
  if (tileSqrt === null)
    return;
  // Get Window dimensions
  let WIDTH = $(window).outerWidth();
  let HEIGHT = $(window).outerHeight();
  // 15% pad either side of tiles
  let pad = 0.7;
  let isMobile = (WIDTH < HEIGHT * pad);
  localStorage.setItem("isMobile", isMobile);
  // Calculate maximum width / height each tile could have to fit in current window (minus a small pad)
  let tileWidth= Math.floor((WIDTH * (1/tileSqrt)) - (WIDTH * 0.002));
  let tileHeight= Math.floor((HEIGHT * 1/tileSqrt) - (HEIGHT * 0.009));
  // Get lowest of the two and use this as the tile width & height going forward
  let tileSize=Math.min(tileWidth * (isMobile ? 1 : pad),tileHeight);
  let tileScaler = Math.floor(tileSize * tileSqrt / 3);
  // Derive a font scaler from the tileSize
  let fontScaler = tileScaler / 360;
  let fontTileScaler = tileSize / 360;

  // Set Background div to the window dimensions (for colour transitions)
  $("#background").css({'width': WIDTH * 1.1 , 'height': HEIGHT * 1.1});

  // Set container divs to equal the derived tile sizes
  $(".tile-container, .tile > .front, .tile > .back").css(
    {'width': tileSize, 'height': tileSize});
  $(".tile-container-big, .tile-big > .front, .tile-big > .back").css(
    {'width': tileSize*tileSqrt, 'height': tileSize*tileSqrt});

  if (isMobile) {
   // Set container divs to equal the derived tile sizes
    $(".return").css(
      {'width': tileScaler / 2, 'height': tileScaler / 2});
    $("#footer").attr("class", "footer-bottom");
    $('.return-center').css({
       'position' : 'absolute',
       'left' : '12%',
       'top' : (HEIGHT - (tileSize * tileSqrt)) / 4,
       'margin-left' :-tileScaler/4,
       'margin-top' : -tileScaler/4,
       'width': tileScaler / 2,
       'height': tileScaler / 2
    });
  }
  else {
   // Set container divs to equal the derived tile sizes
    $(".return").css(
      {'width': tileScaler / 3, 'height': tileScaler / 3});
    $("#footer").attr("class", "footer-right");
    $('.return-center').css({
       'position' : 'absolute',
       'left' : (WIDTH - (tileSize * tileSqrt)) / 3,
       'top' : '10%',
       'margin-left' :-tileScaler/3,

       'margin-top' : -tileScaler/4,
       'width': tileScaler / 3,
       'height': tileScaler / 3
    });
  }


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
  $(".tile .back p").css({'font-size' : 26 * fontTileScaler});
  $(".tile-big .back .p").css({'font-size' : 28 * fontScaler});
  $(".tile .back h1").css({'font-size' :32 * fontTileScaler});
  $("h1").css({'font-size' :32 * fontTileScaler});
  $("#footer p").css({'font-size' :26 * fontScaler});

}

// Build DOM elements, inserting properties from the tileSet JSON where relevant
function DOMBuilder(tileData) {
  // Retrieve tileSqrt from localStorage, if it does not exist we are not
  // ready to draw the DOM
  let tileSqrt = localStorage.getItem('tileSqrt');
  if (tileSqrt === null)
    return;

  let tileSet = tileData.tiles;
  tileHTML = `<div class="auto-generated">
              <div class="center">
                <div class="tile-container-big">
                  <div id=0 class="tile-big">
                    <div class="front" style="cursor:default;">`;

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
      tileHTML+=`<div class="tile-container" style="pointer-events:none; cursor: default;">
                  <div id="${i+1}" class="tile end-flipped">
                  <div class="front" style="background:${tile.color};"></div>`;
    tileHTML+=`<div class="back" ${tile.type === "download" ? 'style="cursor: default;"' : ''}>
                <img src="${tile.outIcon}" onerror="this.src='/images/default_out.png'"/>
                <div class="background" style="background:${tile.color}"></div>
                <img onmousedown="return false" src="/images/back_icon.png"/>
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
                <img onmousedown="return false" src="/images/back_icon.png"/> 
                <div class="p-bg">
                  <p id="big-p"> This is a big frickin tile my dude. </p>
                </div>
                <div class='wrapperLeft'>
                  <iframe seamless scrolling='no' frameBorder='0' class='gameFrame'></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
          <div class="return-center">
            <div id="return-button" class="return flipped">
              <img onmousedown="return false" src="${tileData.return_icon}"/>
              <img onmousedown="return false" src="images/return_back.png"/>
            </div>
          </div>
        </div>`;

  // Append DOM elements to body
  $("body").append(tileHTML);
}

// Callback function for tile click event
function tileClick(event) {
  // Set our id again
  let i = Number(this.id);

  let tileSet = event.data.tileSet;
  let tileData = event.data;
  // Retrieve lastFlipped from local storage, set to false if not available
  let lastFlipped = Number(localStorage.getItem('lastFlipped'));
  if (lastFlipped === 0)
    lastFlipped = false;

  // Set some easy access varaibles for our tileSet
  let url = tileSet[i-1].url;
  let title = tileSet[i-1].title;
  let color = tileSet[i-1].color;
  let type = tileSet[i-1].type;
  // Determine whether tile seems to be a valid game
  let isGame = (isLinkLocal(url) && url.split('/').pop() === 'index.html' && type === 'game');

  // Must catch a:hover event so that we can break out of tile flip click
  // and just navigate to URL if the user clicks an <a> tag
  if ($("a:hover").length != 0) {
    // Create a clone of the <a> tag so that we don't end up recursivly firing a tile click event
    let a = $("a:hover")[0].cloneNode(true);
    a.click();
    return false;
  }



  // If we are not clicking the same tile for a second time
  if( i != lastFlipped ) {  
    if (url !== null && !isLinkLocal(url) && JSON.parse(localStorage.getItem("isMobile"))) {
      $("#"+i+" .back").find("h1").html("Visit " + getHost(url) + "?");
  }
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
  else if (type !== "download") {
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
    else {
      // Flip the tile array around
      $("#0").toggleClass('flipped');
      // Set paragraph text element
      $("#0").find(".p-bg").last().html("<p id='big-p'>"+tileSet[lastFlipped-1].big_text+"</p>");
      // Flip around return button so it is visible
      setTimeout( function () {
        $("#return-button").removeClass('flipped');
      }, 600);
      // Raise p-bg
      $("#0").find(".p-bg").last().animate({height: '30%'},800,"swing");
    }
    // Handle url redirection and history persistance, runs on a timeout 
    // so that we execute just as the second tile flip animation is finishing 
    setTimeout((url, color, type, isGame, lastFlipped) => {
      localStorage.setItem('lastColor', color );
      if(url !== null) {
        if (isLinkLocal(url) && url.split('.').pop() === 'json') {
          localStorage.removeItem("lastFlipped");
          localStorage.removeItem("tileSqrt");
          history.pushState({ 'jsonFile': url }, "");
          tileGenerator(url);
        }
        else if (!isGame) {
          window.location.href = url;
        }
      }
      else
        location.reload();
    }, 350, url, color, type, isGame, lastFlipped);
  }
  localStorage.setItem('lastFlipped',this.id);
}

function tileGenerator(jsonFile) {
  // Remove previous tile DOM elements & children
  $(".auto-generated").remove();
  // Generate tiles after getJSON retrieves jsonFile
  $.getJSON(jsonFile, (data) => {
    // Retrieve tiles structure from jsonFile
    let tileSet = data.tiles;
    // Calculate a square root from num of timeto be used for tile sizing later on
    let tileSqrt = Math.max(Math.ceil(Math.sqrt(tileSet.length)), 2);
    localStorage.setItem("tileSqrt", tileSqrt);

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
    DOMBuilder(data, tileSqrt);

    resizeTile(tileSqrt);
    // Call resizeTile on window resize
    window.onresize = () => {resizeTile(tileSqrt);};
    // Call resizeOnCanvas when new iframe is loaded
    $("#0 > .back > .wrapperLeft, .wrapperTop").children("iframe").on('load', () => {
      resizeOnCanvas(tileSqrt, 100);
    });

    // For each tile        
    for(let i=1;i <= tileSet.length; i++){
      let tile = tileSet[i-1];
      setTimeout((i, tile) => {
        // Rotate each tile so that its front is visible
        $("#"+i).removeClass('end-flipped');
        //watch for a click on the div with id i
        $("#"+i).click({"tileSet": tileSet}, tileClick);
        if (tile.url !== null && !isLinkLocal(tile.url)) {
          $("#"+i + " .back").hover(function() {
            $(this).find("h1").fadeOut(300, function () {
              $(this).html("Visit " + getHost(tile.url) + "?").fadeIn(300);
            });
          }, function () {
            $(this).find("h1").fadeOut(300, function () {
              $(this).html(tile.title).fadeIn(300);
            });
          });
        }
      }, 400, i, tile);
    }
    $("#return-button").click(() => {
      let lastFlipped = localStorage.getItem('lastFlipped');
      $("#" + lastFlipped).removeClass('flipped');
      //$("#" + lastFlipped).find(".p-bg").html('<p>'+tileSet[lastFlipped - 1].text+'</p>');
      localStorage.removeItem('lastFlipped');
      $("#0").removeClass('flipped');
      $("#return-button").addClass('flipped');
    });
  });
}

window.onload = function() {
  localStorage.removeItem("lastFlipped");
  localStorage.removeItem("tileSqrt");
  let jsonFile = "/json/main.json";
  // Set listener for history popstate, restore JSON from history if possible
  window.addEventListener('popstate', (event) => {
    localStorage.removeItem("lastFlipped");
    localStorage.removeItem("tileSqrt");
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
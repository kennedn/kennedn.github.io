window.onpageshow = function(event) {
if (event.persisted) {
    window.location.reload();
}
};

function resizeOnCanvas(time) {
        let object = $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
        if(object.length > 0) {
            resizeTile();
            return;
        }
        else {
            setTimeout(function() {
                resizeOnCanvas(time);
            }, time);
        }
}
function resizeTile() {
  
  // Get Window dimensions
  let WIDTH = $(window).outerWidth();
  let HEIGHT = $(window).outerHeight();
  let docSize = Math.min(WIDTH, HEIGHT);

  // Calculate maximum width / height each tile could have to fit in current window (minus a small pad)
  let tileWidth= Math.floor((WIDTH * (1/columns)) - (WIDTH * 0.002));
  let tileHeight= Math.floor((HEIGHT * 1/rows) - (HEIGHT * 0.009));
  // Get lowest of the two and use this as the tile width & height going forward
  let tileSize=Math.min(tileWidth,tileHeight);

  // Derive a font scaler from the difference between tile and doc size
  let fontScaler = tileSize / 360;

  // Set Background div to the window dimensions ( for colour transitions)
  $("#background").css({'width': WIDTH , 'height': HEIGHT});

  // Set container divs to equal the derived tile sizes
  $(".tile-container, .tile > .front, .tile > .back").css(
    {'width': tileSize, 'height': tileSize});
  $(".tile-container-big, .tile-big > .front, .tile-big > .back").css(
    {'width': tileSize*columns, 'height': tileSize*rows});

  // Move the center div to the center of the screen using our derived tile sizes
  $('.center').css({
     'position' : 'absolute',
     'left' : '50%',
     'top' : '50%',
     'margin-left' :-(tileSize*rows)/2,
     'margin-top' : -(tileSize*columns)/2,
     'width': tileSize * rows,
     'height': tileSize * columns
  });
  $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").each(function() {
      var $wrap = $(this);
      var wrapWidth = $wrap.width(); // width of the wrapper
      var wrapHeight = $wrap.height();
      var childWidth = $wrap.children("iframe").contents().find("canvas").width();  // width of child iframe
      var childHeight = $wrap.children("iframe").contents().find("canvas").height(); // child height
      var wScale = wrapWidth / childWidth;
      var hScale = wrapHeight / childHeight;
      var scale = Math.min(wScale,hScale);  // get the lowest ratio
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
  //$("#watermark p").css({'font-size' :100 * fontScaler,'left' : - (100 * fontScaler) *4});
  var canvas = $(".tile-container-big > .tile-big > .back > .wrapperLeft, .wrapperTop").children("iframe").contents().find("canvas");
  // //  var canvas_div = $(".tile-big > .back > iframe").contents().find("#PyTetris");
  // let pad = 1;
  // let gameFrame = $("#GFrame");
  // let gameRatio = gameFrame.width() / gameFrame.height();
  // let gameSize = Math.min((tileSize*rows*pad), tileSize*columns*pad/2);
  // let webkitScaler = Math.min(gameFrame.width(), gameFrame.height()/2) / gameSize;
  // //let webkitScaler = (gameRatio > 1) ?  ((tileSize*rows*pad) / 2) / gameFrame.width(): 
  // //                                 (tileSize*columns*pad) / gameFrame.height();

  // //canvas_div.css({'height': tileSize*rows*pad + 'px'});
  // //canvas_div.css({'width': canvas_div.height() * ratio + 'px'});
  // gameFrame.css({'height': gameSize*2});
  // gameFrame.css({'width': gameSize}); 
  // gameFrame.css({'-moz-transform': 'scale(' + webkitScaler + ')'});
  // gameFrame.css({'-o-transform': 'scale(' + webkitScaler + ')'});
  // gameFrame.css({'-webkit-transform': 'scale(' + webkitScaler + ')'});
  if (canvas.length === 0)
    resizeOnCanvas(120);
}



$(document).ready(function() {
  var colors, hrefs, colFade, j, lastFlipped, icons, tile_y_origin;
  colors = ["#1c817e", "#dd2164", "#6e04a9",
            "#dd2164", "#6e04a9", "#1c817e",
            "#6e04a9", "#1c817e", "#dd2164"];
  //hrefs = [["https://www.android.com/", "https://www.raspberrypi.org/", "https://www.microsoft.com"];
  icons = [["/images/bio_icon.png", "/images/stuff_icon.png", "/images/contact_icon.png"],
           ["/images/stuff_icon.png", "/images/contact_icon.png", "/images/bio_icon.png"],
           ["/images/contact_icon.png", "/images/bio_icon.png", "/images/stuff_icon.png"]];
  titles = [["Bio", "Stuff I've made", "Contact"],
            ["Stuff I've made", "Contact", "Bio"],
            ["Contact", "Bio", "Stuff I've made"]];
  paras = [["A summary of who I am, where I've been and what i've done.", "Be it games, some hacky bash scripts or some random project.", "How you can get in touch."],
           ["Be it games, some hacky bash scripts or some random project.", "How you can get in touch.", "A summary of who I am, where I've been and what i've done."],
           ["How you can get in touch.", "A summary of who I am, where I've been and what i've done.", "Be it games, some hacky bash scripts or some random project."]];
  colFade = 400;
  columns = 3;
  rows=3;
  removeTiles = false;

  
  storedValue = 'None';
  storedValue = localStorage.getItem('caller', storedValue);
  if(storedValue) {
    $("body").css("background-color", storedValue);
    $("#background").css("background-color", storedValue);
  }
  else {
    $("body").css("background-color", colors[1]);
    $("#background").css("background-color", colors[1]);
  }

  
  tileHTML = `<div class="center">
                <div class="tile-container-big">
                  <div id=0 class="tile-big">
                    <div class="front">`;

  for (y=0;y<rows;y++) {
	  for (x=0;x<columns;x++) {
	    tileHTML+=`<div class="tile-container">
	      <div id="${x + 1 + columns * y}" class="tile">
	
	        <div class="front">
	          <h1> ${titles[y][x]} </h1>
	          <img onmousedown="return false" src="${icons[y][x]}"/>
	        </div>
	
	        <div class="back">
	          <img onmousedown="return false" src="/images/tile_back.png"/>
	          <h1> ${titles[y][x]} </h1>
	
	        <div class="p-bg"> 
	            <p> ${paras[y][x]} </p>
	        </div> 
	
	        </div>
	        
	      </div>
	    </div>`;
	  }
    tileHTML += `</br>`;
  }

  
  tileHTML += `</div>
               <div class="back">
                  <img onmousedown="return false" src="/images/tile_back.png"/>
                  <div class="p-bg">
                    <p id="big-p"> ${paras[0][0]} </p>
                  </div>
               </div>
              </div>
            </div>`;
  $("body").append(tileHTML);

  resizeTile();
  window.onresize = resizeTile;


  // Grab the height of the container, half it and apply it as a hard value to the tiles origin.
  // Setting this within the stylesheet to 50% does not seem to work correctly, this is a workaround
  $(".tile").css("transform-origin", "50% " + $(".tile-container .front").css("height").match(/\d+/) / 2 + "px");
  // For each tile        
  for (j=1;j<=columns * rows;j++) {
    //watch for a click on the div with id j
    $("#"+j).click(function() {

      // Set our id again
      j = Number(this.id);
      // If we did not click the same tile twice
      if( j != lastFlipped ) {  
        // Rotate clicked tile
        $(this).toggleClass('flipped');
        // Animate the paragraph backgrounds height
        $(this).find(".p-bg").animate({height: '58%'},600,"swing", function() {
            $("#0 > .back > .wrapperLeft").remove();
            $("#0 > .back > .wrapperTop").remove();
            if(j === columns * rows) {
              $("#0 > .back").append("<div class='wrapperLeft'><iframe seamless scrolling='no' frameBorder='0' class='gameFrame' src='/tetris/index.html'></iframe></div>");
              resizeOnCanvas(100);
            }
            else if(j === columns * rows - 1) {
              $("#0 > .back").append("<div class='wrapperTop'><iframe seamless scrolling='no' frameBorder='0' class='gameFrame' src='/pong/index.html'></iframe></div>");
              resizeOnCanvas(100);
            }
            else if(j === columns * rows - 2) {
              $("#0 > .back").append("<div class='wrapperTop'><iframe seamless scrolling='no' frameBorder='0' class='gameFrame' src='/gravitation/index.html'></iframe></div>");
              resizeOnCanvas(100);
            }
        });    
        
  
        // Set body bg color, show background div then fade it, setting the correct color once it is opaque 
        // In short this does a nice fade effect on the background color
        $("body").css("background-color", colors[j - 1]);
        $("#background").show().fadeOut(colFade, "linear", function() {
            $(this).css("background-color", colors[j - 1]); 
          });
  
        // If we clicked another tile from the last one, reset the previous tiles parameters.
        
          // reflip the last tile
          $("#"+lastFlipped).toggleClass('flipped');
          //reset the paragraph background to 1% height
          $("#"+lastFlipped).find(".p-bg").animate({height: '1%'},400);
      }
      // Ending animations.
      else {
        // For each tile that isnt the one we just clicked
        for(var k=1;k<=columns * rows;k++) {
          // swap out the img src to the tile that we just clicked
          //$("#"+k).find(".front").find("img").attr("src", icons[lastFlipped-1]);
          // If we didnt click this tile last
          if (k != lastFlipped) {
            // flip the tile 90deg (eg. edge facing us)
            $("#"+k).toggleClass('end-flipped');
          }
          else {
            // flip tile back around
            if(k === columns * rows) {
              $("#0").toggleClass('flipped');
              $("#0").find(".p-bg").animate({height: '40%'},800,"swing");
            }
            else if(k === columns * rows - 1) {
              $("#0").toggleClass('flipped');
              $("#0").find(".p-bg").animate({height: '40%'},800,"swing");
            }
            else if(k === columns * rows - 2) {
              $("#0").toggleClass('flipped');
              $("#0").find(".p-bg").animate({height: '40%'},800,"swing");
            }
            else {
              $("#"+k).toggleClass('flipped');
              (function(k){
                $("#"+k +" .front").delay(400).fadeOut(500, function() {
              
                //location.reload();
                localStorage.setItem('caller', colors[k-1]);
                //window.location = "/index.html"
                //location.reload();
                });
              })(k);
            }

            // Fade the tile then navigate to url afterwards
          }
        }
      }       
      lastFlipped = Number(this.id);
    });
  };
});

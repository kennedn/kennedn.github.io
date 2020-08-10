window.onpageshow = function(event) {
if (event.persisted) {
    window.location.reload();
}
};

function resizeOnCanvas(time) {
        let object = $(".tile-big > .back > iframe").contents().find("canvas");
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
  
  iW = $(window).outerWidth();
  iH = $(window).outerHeight();
  tileWidth= (iW * (1/cols)) - (iW * 0.002);
  tileHeight= (iH * 1/rows) - (iH * 0.009);
  tileScale=Math.min(tileWidth,tileHeight);
  font_scaler = tileScale / 380;
  $("#background").css({'width': $(document).width , 'height': $(document).height});

  //$(".tile-container, .front, .back").css({'width': tileScale + 'px', 'height': tileScale + 'px'});
  $(".tile-container, .tile > .front, .tile > .back").css({'width': tileScale + 'px', 'height': tileScale + 'px'});
  $(".tile-container-big, .tile-big > .front, .tile-big > .back").css({'width': tileScale*cols + 'px', 'height': tileScale*rows + 'px'});
  $("body").css({'overflow': 'hidden', 'white-space': 'wrap'});
  $(function() {
    $('.center').css({
       'position' : 'absolute',
       'left' : '50%',
       'top' : '50%',
       'margin-left' : function() {return -$(this).outerWidth()/2},
       'margin-top' : function() {return -$(this).outerHeight()/2},
       'width': tileScale * rows,
       'height': tileScale * cols
    });
  });
  
  
  $(".tile .back p").css({'font-size' : 26 * font_scaler});
  $(".tile .back h1").css({'font-size' :32 * font_scaler});
  $("h1").css({'font-size' :32 * font_scaler});
  $("#watermark p").css({'font-size' :100 * font_scaler,'left' : - (100 * font_scaler) *4});

  var pad = 1;
//  var canvas = $(".tile-big > .back > iframe").contents().find("canvas");
//  var canvas_div = $(".tile-big > .back > iframe").contents().find("#PyTetris");
  var canvas = $("#GFrame");
  var ratio = canvas.width() / canvas.height();


  //canvas_div.css({'height': tileScale*rows*pad + 'px'});
  //canvas_div.css({'width': canvas_div.height() * ratio + 'px'});
  var webkit_scale = canvas.height() / (tileScale*rows*pad);
  canvas.css({'height': tileScale*rows*pad + 'px'});
  canvas.css({'width': canvas.height() * ratio + 'px'}); 
  canvas.css({'-moz-transform': 'scale(' + 0.1 + ')'});
  canvas.css({'-o-transform': 'scale(' + 0.1 + ')'});
  canvas.css({'-webkit-transform': 'scale(' + 0.1 + ')'});
  if (canvas.length === 0)
    resizeOnCanvas(100);
//  else {
//    var ctx = canvas.get(0);
//    ctx.height = -1;
//    ctx.width = -1;
//  }
}



$(document).ready(function() {
  var colors, hrefs, colFade, j, lastFlipped, icons, tile_y_origin;
  colors = ["#12b9ee", "#bc1142", "#b2cd49",
            "#bc1142", "#b2cd49", "#12b9ee",
            "#b2cd49", "#12b9ee", "#bc1142"];
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
  cols = 3;
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
	  for (x=0;x<cols;x++) {
	    tileHTML+=`<div class="tile-container">
	      <div id="${x + 1 + cols * y}" class="tile">
	
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
                  <p> Hello! </p>
                  <img onmousedown="return false" src="/images/tile_back.png"/>
               </div>
              </div>
            </div>`;
  $("body").append(tileHTML);

  resizeTile();
  window.onresize = function(event) {
    resizeTile();
  };


  // Grab the height of the container, half it and apply it as a hard value to the tiles origin.
  // Setting this within the stylesheet to 50% does not seem to work correctly, this is a workaround
  $(".tile").css("transform-origin", "50% " + $(".tile-container .front").css("height").match(/\d+/) / 2 + "px");
  // For each tile        
  for (j=1;j<=cols * rows;j++) {
    //watch for a click on the div with id j
    $("#"+j).click(function() {

      // Set our id again
      j = this.id;
      // If we did not click the same tile twice
      if( j != lastFlipped ) {  
        // Rotate clicked tile
        $(this).toggleClass('flipped');
        // Animate the paragraph backgrounds height
        $(this).find(".p-bg").animate({height: '58%'},600,"swing");    
        
  
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
        for(var k=1;k<=cols * rows;k++) {
          // swap out the img src to the tile that we just clicked
          //$("#"+k).find(".front").find("img").attr("src", icons[lastFlipped-1]);
          // If we didnt click this tile last
          if (k != lastFlipped) {
            // flip the tile 90deg (eg. edge facing us)
            $("#"+k).toggleClass('end-flipped');
          }
          else {
            // flip tile back around
            if(k === cols * rows) {
              $("#0").toggleClass('flipped');
              $("#0 > .back").append("<iframe seamless scrolling='no' id='GFrame' src='/tetris/index.html'></iframe>");
              resizeTile();
            }
            else if(k === cols * rows - 1) {
              $("#0").toggleClass('flipped');
              $("#0 > .back").append("<iframe seamless scrolling='no' id='GFrame' src='/pong/index.html'></iframe>");
              resizeTile();
            }
            else if(k === cols * rows - 2) {
              $("#0").toggleClass('flipped');
              $("#0 > .back").append("<iframe seamless scrolling='no' id='GFrame' src='/gravitation/index.html'></iframe>");
              resizeTile();
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
      lastFlipped = this.id;
    });
  };
});

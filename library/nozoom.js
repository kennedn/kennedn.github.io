// Prevent plus & minus key input when ctrl is pressed
$(document).keydown(function(event) {
if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {
        event.preventDefault();
     }
});

// Prevent mousewheel action when ctrl is pressed
$(window).bind('mousewheel DOMMouseScroll', (event) => {
       if (event.ctrlKey == true) {
       event.preventDefault();
       }
});

// Prevent touch event if more than one finger is present
$(window).bind('touchstart', (event) => {
    if(event.touches.length > 1){
        event.preventDefault();
    }
});
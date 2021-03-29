if (!window.document.documentMode) {
	// Prevent plus & minus key input when ctrl is pressed
	document.addEventListener('keydown', (event) => {
	if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'))
	        event.preventDefault();
	});

	// Prevent mousewheel action when ctrl is pressed
	document.addEventListener('DOMMouseScroll', (event) => {
		if (event.ctrlKey == true)
	       event.preventDefault();
	}, {passive: false}); 
	document.addEventListener('mousewheel', (event) => {
		if (event.ctrlKey == true)
	       event.preventDefault();
	}, {passive: false}); 
	document.addEventListener('wheel', (event) => {
		if (event.ctrlKey == true)
	       event.preventDefault();
	}, {passive: false}); 

  function preventZoom(e) {
      var t2 = e.timeStamp;
      var t1 = e.target.dataset.lastTouch || t2;
      var dt = t2 - t1;
      var fingers = e.touches.length;
      e.target.dataset.lastTouch = t2;

      if (!dt || dt > 500 || fingers > 1) return; // not double-tap

      e.preventDefault();
      e.target.click();
  }

	document.addEventListener('touchend', preventZoom);

}

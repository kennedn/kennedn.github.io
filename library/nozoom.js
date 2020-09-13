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

	// Prevent touch event if more than one finger is present
	document.addEventListener('touchstart',(event) => {
	    if(event.touches.length > 1)
	        event.preventDefault();
	}, {passive: false});
}
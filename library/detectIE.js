document.addEventListener('DOMContentLoaded', function() {
	if (window.document.documentMode) {
		var body = document.getElementsByTagName("body")[0];
		var colors = [ "#6e04a9", "#1c817e", "#dd2164"];
		body.setAttribute("style", "background-color:" + colors[Math.floor(Math.random() * colors.length)]); 
		body.innerHTML += "<p style='font-size:32;'> 1999 called, it want's its browser back.</p><p>Sadly some of the features included in this webpage are not compatible with internet explorer, please try a modern browser such as Firefox, Chrome or even Edge.</p>";
		body.innerHTML += "<p>Or if you are a stubborn sort, heres a taster from the site:";
		body.innerHTML += "<p><a href='tetris/index.html'>jsTetris</a>";
		body.innerHTML += "<p>Normal keyboard controls are as follows:</p><table><thead><tr><th>Normal Keys</th><th>Action</th></tr></thead><tbody><tr><td>Left Arrow</td><td>Move Left</td></tr><tr><td>Right Arrow</td><td>Move Right</td></tr><tr><td>Z</td><td>Rotate Left</td></tr><tr><td>X</td><td>Rotate Right</td></tr><tr><td>Down Arrow</td><td>Soft Drop</td></tr><tr><td>Space</td><td>Hard Drop</td></tr><tr><td>P</td><td>Pause</td></tr><tr><td>R</td><td>Restart</td></tr></tbody></table>";

	}
});
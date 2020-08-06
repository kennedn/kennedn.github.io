var passedValue = 'None';
var passedValue = localStorage.getItem('caller', passedValue);

//localStorage.clear();
$(document).ready(function() {
	colors = ["#12b9ee", "#bc1142", "#b2cd49"];
	//$("p").append(passedValue);
	switch(passedValue) {
		case "1":
		case "2":
		case "3":
			$("body").css("background-color", colors[passedValue - 1]);
			break;
		case "1":
			break;
		case "2":
			break;
		case "3":
			break;
		case "2.1":
			break;
		case "2.2":
			break;
		case "2.3":
			break;
	}
});
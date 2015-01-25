/*=============================================================================*/	
/* Utility
/*=============================================================================*/
var xhttp, nowTime, thenTime, deltaTime;

window.requestAnimFrame = ( function() {
	return window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function( callback ) {
				window.setTimeout( callback, 1000 / 60 );
			};
})();


function loadXMLDoc(filename, successCallback, errorCallback){
	if (window.XMLHttpRequest){
	  	xhttp=new XMLHttpRequest();
	} else // code for IE5 and IE6
	{
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xhttp.onload = function() {
	  console.log(xhttp.responseXML.documentElement.nodeName);
	  if (successCallback) {
		  successCallback(xhttp.responseXML);
	  }
	}
	
	xhttp.onerror = function() {
	  console.log("Error while getting XML.");
	}
	
	xhttp.open("GET",filename,false);
	xhttp.send();
}

//update the delta value
function setDelta(){
	nowTime = Date.now();
	deltaTime = (nowTime - thenTime);
	thenTime = nowTime;
}

// A helping function, get a random number from the min to the max
function RandomFromMinToMax (min, max) {
	return Math.random() * (max - min) + min;
}


/*=============================================================================*/	
/* Initialize
/*=============================================================================*/


// Global variables for the Fireworks
var canvas, context, canvas_w, canvas_h, lastTime = 0, // to save the canvas related info
	// Array contain our firework
	fireworkArray = new Array(),
	// Array contain the particles (particle pool)
	particles = new Array(),
	//to instatiate the classes
	FireworksWindow = this,
	//limited number of particles, need to adjust depending how many particles created (more for garbage collection)
	MAX_PARTICLES = 5000;

$(document).ready(function() {
	//define canvas
	canvas = $("#canvas")[0];
    context = canvas.getContext("2d");
    
    //to setup values based o the CSS
    canvas.width = $("#canvas").width();
    canvas.height = $("#canvas").height();
    canvas_w = canvas.width;
    canvas_h = canvas.height;

    //load the xml, then initiate the animation based on the XML
    loadXMLDoc("config/fireworks.xml", init);
});

function init(data){
    parseFirewokXML(data);	
	//start the App (first time to define)
	thenTime = Date.now();
	loop();
}

function parseFirewokXML(xml) {
	// Get info and start the fireworks
	var xmlFireworkArray = xml.getElementsByTagName("Firework");
	var fireworkNumber = xmlFireworkArray.length;
	
	// Create each firework
	for (var i=0; i<fireworkNumber; i++) {
		//Error handler for the case i not exist setup a default value
		//could have other ooptions as to not include on the objected created
		var velocity = xmlFireworkArray[i].getElementsByTagName("Velocity")[0];
		var vx = typeof velocity !== "undefined" && velocity !== null && velocity.attributes["x"] ? parseInt(velocity.attributes["x"].value)  * 0.001 : 0; 
		var vy =  typeof velocity !== "undefined" && velocity !== null && velocity.attributes["y"] ?parseInt(velocity.attributes["y"].value) * -0.001 : 0
		
		// Read the firework attribute from XML, and create an object (here could be treate the erros, or missing data)
		var opts = {
			type 		: xmlFireworkArray[i].attributes["type"].value,
			begin	 	: parseInt(xmlFireworkArray[i].attributes["begin"].value),
			colour 		: xmlFireworkArray[i].attributes["colour"].value.replace ("0x", "#"),
			duration	: parseInt(xmlFireworkArray[i].attributes["duration"].value),
			px			: parseInt(xmlFireworkArray[i].getElementsByTagName("Position")[0].attributes["x"].value) + canvas_w / 2,
			py			: canvas_h / 2 - parseInt(xmlFireworkArray[i].getElementsByTagName("Position")[0].attributes["y"].value),
			vx			: vx,
			vy			: vy
		}
	
		if (typeof FireworksWindow[opts.type] == 'function') {
			var firework = new FireworksWindow[opts.type](opts);
			fireworkArray.push (firework);
		}
	}
}

function loop() {
	setDelta();
	update(deltaTime);	
	// Request the browser to give us the next frame when it's ready
	requestAnimFrame(loop);
}

// Loop and draw firework in this loop
function update(deltaTime) {
	// Set draw mode to destination-out, then clear the canvas to black, will make things fade out...
	context.globalCompositeOperation = 'destination-out';
	context.fillStyle = "rgba(0, 0, 0, 0.2)"; 
	context.fillRect(0, 0, canvas_w, canvas_h);
	
	// Then set draw mode to lighter (additive), it will draw things brighter
	context.globalCompositeOperation = 'lighter';
	
	// If no firework is living, that's mean we should need to restart them
	var needRestart = true;
	for (var i=0; i<fireworkArray.length; i++) {
		if (fireworkArray[i].live == true) {
			needRestart = false;
		}
	}
	
	if (needRestart == true) {
		for (var i=0; i<fireworkArray.length; i++) {
			fireworkArray[i].restart();
		}
	}
	
	// Update all firework emitter
	for (var i=0; i<fireworkArray.length; i++) {
		fireworkArray[i].update (deltaTime);
		fireworkArray[i].render (context);
	}
	
	var existingParticles = [];
	// Update all firework particle in the pool and draw
	for (var i=0; i<particles.length; i++) {
		if (particles[i].live == true) {
			particles[i].update(deltaTime);
			particles[i].render(context);
			existingParticles.push(particles[i]);
		}
	}
	
	// update array with existing particles - old particles should be garbage collected
    particles = existingParticles;

    while (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
}


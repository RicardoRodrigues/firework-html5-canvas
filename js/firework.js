/*=============================================================================*/	
/* Firework class
/*=============================================================================*/
var DEG_TO_RAD = 0.0174532925199433;

//General class
function Firework(opts) {
	this.default = opts;
	
	this.x 			= opts.px;
	this.y 			= opts.py;
	
	this.begin		= opts.begin;
	this.colour 	= opts.colour;
	this.duration 	= opts.duration;
	
	this.timer		= 0;

	this.live		= false;
};

//Rocket extends from class Fireworks
var Rocket = function(opts) {
	Firework.call(this,opts);

	this.EMIT_NUMBER	    = 80;

	this.oldX		= opts.px;
	this.oldY		= opts.py;
	
	this.vx         = opts.vx;
	this.vy         = opts.vy;
	
	this.timer		= 0;
	
    this.type = "Rocket";
};

Rocket.prototype.constructor=Rocket;

Rocket.prototype.restart = function () {
	this.x 			= this.default.px;
	this.y 			= this.default.py;
	this.oldX		= this.default.px;
	this.oldY		= this.default.py;
	this.begin		= this.default.begin;
	this.colour 	= this.default.colour;
	this.duration 	= this.default.duration;
	
	this.timer		= 0;
	this.live		= true;
};

Rocket.prototype.update = function (deltaTime) {
	if (this.live == true) {
		// An emitter silently count the time
		this.timer += deltaTime;
		// If it's in its action time, fly...
		if (this.timer >= this.begin) {
			this.oldX = this.x;
			this.oldY = this.y;
			this.x += this.vx * deltaTime;
			this.y += this.vy * deltaTime;
		}
		
		// If it's burst time. EXPLODE!
		if (this.timer >= this.begin + this.duration) {
			this.explode();
		}
	}
};

Rocket.prototype.render = function (context) {
	// Draw the project tile, which will explode mid-air
	if (this.live == true) {
		context. beginPath();
		context.moveTo (this.oldX, this.oldY);
		context.lineTo (this.x, this.y);
		context.lineWidth = 3;
		context.strokeStyle = this.colour;
		context.stroke();
	}
};

Rocket.prototype.explode = function() {
	// We emit stuff
	for (var i=0; i< this.EMIT_NUMBER; i++) {		
		// Start it
		var particle = new Particle( this.x, this.y, this.colour);
		particles.push(particle);
	}
	// Kill the firework
	this.live = false;
}


//Fountain extends from class Fireworks
var Fountain = function(opts) {
	Firework.call(this,opts);
	
	this.EMIT_RATE			= 1;
	this.EMIT_FORCE_X_MIN	= 0.3;
	this.EMIT_FORCE_X_MAX	= 0.1;
	this.EMIT_FORCE_Y_MIN	= 0.4;
	this.EMIT_FORCE_Y_MAX	= 0.2;
	
	// See if this firework is still active...
	this.live = false;
	
	this.oldX		= opts.px;
	this.oldY		= opts.py;
	
	this.vx         = opts.vx;
	this.vy         = opts.vy;
	
	this.timer		= 0;
	
    this.type = "Fountain";
};

Fountain.prototype.constructor=Fountain;

Fountain.prototype.update = function (deltaTime) {
	if (this.live == true) {
		// An emitter silently count the time
		this.timer += deltaTime;
		// If it's in its action time
		if (this.timer >= this.begin && this.timer <= this.begin + this.duration) {
			// We emit stuff
			// How many particle we will emit?
			this.emitNumber += (this.EMIT_RATE * deltaTime);;
			
			// If the number of particle need to be emit is bigger than 1
			// Emit them one by one.
			while (this.emitNumber > 1) {
				// Get a free particle from the pool
				var particle = new Particle(this.x, this.y, this.colour);
				particles.push(particle);
				// One down, nine to go (quote)
				this.emitNumber -= 1;
			}
		}
		else if (this.timer > this.begin + this.duration) {
			// This firework burned out. It's dead.
			this.live = false;
		}
	}
};

Fountain.prototype.restart = function () {
	this.x 			= this.default.px;
	this.y 			= this.default.py;

	this.begin		= this.default.begin;
	this.colour 	= this.default.colour;
	this.duration 	= this.default.duration;
	
	this.timer		= 0;
	this.emitNumber = 0;
	this.live		= true;
};

Fountain.prototype.render = function(){}

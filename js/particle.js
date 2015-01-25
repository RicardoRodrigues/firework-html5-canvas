/*=============================================================================*/	
/* Particle effect 
/*=============================================================================*/

var Particle = function(x,y,colour) {
	this.PARTICLE_LIFE_TIME = 5000;
	this.GRAVITY 			= 0.0002;
	this.EMIT_FORCE_MIN		= 0;
	this.EMIT_FORCE_MAX		= 0.3;
	
	// Choose a force and an angle for it to burst out
	this.force = RandomFromMinToMax (this.EMIT_FORCE_MIN, this.EMIT_FORCE_MAX);
	this.angle = RandomFromMinToMax (0, 360) * DEG_TO_RAD;
	
	// Particle position
	this.x = x;
	this.y = y;
	
	// Save old position to draw a trail
	this.oldX = null;
	this.oldY = null;
	
	// Particle speed
	this.speedX = Math.sin(this.angle) * this.force;
	this.speedY = Math.cos(this.angle) * this.force;
	
	// Other attribute
	this.live = false;
	this.colour = colour;
	
	this.shrink = .95;
    this.size = 2;
    
	this.live = true;
}

Particle.prototype.constructor=Particle;

Particle.prototype.update = function(deltaTime) {
	if (this.live == true) {
		// Particle should just live for a while, then it dies.
		this.lifeTime += deltaTime;
		if (this.lifeTime >= this.PARTICLE_LIFE_TIME) {
				this.live = false;
		}
		// Gravity will pull it down
		this.speedY += this.GRAVITY * deltaTime;
		
		// Save the current position
		this.oldX = this.x;
		this.oldY = this.y;
		
		// Update its position based on its speed
		this.x += this.speedX * deltaTime;
		this.y += this.speedY * deltaTime;
		
		// Also consider it dead if it fall out of the canvas
		if (this.y > canvas_h) {
			this.live = false;
		}
		
		// shrink
	    this.size *= this.shrink;
	
	}
};

Particle.prototype.render = function(context) {
	// Also consider it dead if not visible
    if (!this.exists()) {
    	this.live = false;
        return;
    }
    context.save();

    context.globalCompositeOperation = 'lighter';

    var x = this.x,
        y = this.y,
        r = this.size / 2;

    var gradient = context.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.8, this.colour);
    gradient.addColorStop(1, this.colour);

    context.fillStyle = gradient;

    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();

    context.restore();
};

Particle.prototype.exists = function() {
    return this.size >= 0.4;
};

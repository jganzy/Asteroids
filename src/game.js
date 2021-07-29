
//	Create your Phaser game and inject it into the gameContainer div.
//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)

var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
    leveldelay: 3
};

var whitefont = {fontSize:'20px', fill:'#FFF'};
var score = 0;
var scoreText;
var lives = 5;
var bullets;
var bulletProperties = {
    speed: 400,
    interval: 250,
    lifespan: 2000,
    maxCount: 30
}
var shipProperties = {
    acceleration: 300,
    drag: 100,
    maxVelocity: 300,
    angularVelocity: 300,
    lives: 2,
    timetoreset: 3,
    blinkdelay: 0.2
}

var asteroidProperties = {
    startingAsteroids: 4,
    maxAsteroids: 20,
    incrementAsteroids: 2,

    asteroidLarge: {minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity: 200, score: 20, nextSize: 'asteroidMedium', pieces: 2},
    asteroidMedium: {minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity: 200, score: 50, nextSize: 'asteroidSmall', pieces: 2},
    asteroidSmall: {minVelocity: 50, maxVelocity: 300, minAngularVelocity: 0, maxAngularVelocity: 200, score: 100}
}

scoretrack = 0;
shiplives = shipProperties.lives;
var scoreLives;
startx = gameProperties.screenWidth/2;
starty = gameProperties.screenHeight/2;


var gameState = function(game) {
    this.starttext;
}

gameState.prototype = {
    preload: function() {		
    	game.load.image('asteroidLarge', 'assets/asteroidLarge.png');
        game.load.image('asteroidSmall', 'assets/asteroidSmall.png');
        game.load.image('asteroidMedium', 'assets/asteroidMedium.png');
        game.load.image('Bullet', 'assets/bullet.png');
        game.load.image('Ship', 'assets/ship.png');

    },

    create: function() {	
    	game.physics.startSystem(Phaser.Physics.ARCADE);

    	this.bullets = game.add.group();
    	this.bullets.enableBody = true;
    	this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    	this.bullets.createMultiple(bulletProperties.maxCount, 'Bullet');
    	this.bullets.setAll('anchor.x', 0.5);
    	this.bullets.setAll('anchor.y', 0.5);
    	this.bullets.setAll('lifespan', bulletProperties.lifespan);
    	this.bulletInterval = 0;

    	this.player = game.add.sprite(startx, starty, 'Ship');	
    	this.player.angle = -90;
        this.player.anchor.set(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.drag.set(shipProperties.drag);
        this.player.body.maxVelocity.set(shipProperties.maxVelocity);
        this.invulnerable = false;

        this.asteroids = game.add.group();
        this.asteroidsCount = asteroidProperties.startingAsteroids;
        this.asteroids.enableBody = true;
        this.player.physicsBodyType = Phaser.Physics.ARCADE;
        this.resetAsteroids();

        cursors = game.input.keyboard.createCursorKeys();
        firekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        akey = game.input.keyboard.addKey(Phaser.Keyboard.A);

        scoreText = game.add.text(10, 10, 'Score: 0', {fontSize:'20px', fill:'#FFF'});
        scoreLives = game.add.text(10, 40, shipProperties.lives, {font: '20px Arial', fill: '#FFFFFF', align: 'center'});
    },

   update: function() {

        this.checkBoundaries(this.player);
        this.bullets.forEachExists(this.checkBoundaries, this);
        this.asteroids.forEachExists(this.checkBoundaries, this);
        this.move();

        game.physics.arcade.overlap(this.bullets, this.asteroids, this.asteroidCollision, null, this);
     
        if (!this.invulnerable) {
            game.physics.arcade.overlap(this.player, this.asteroids, this.asteroidCollision, null, this);
        }

    },

    shipblink: function () {
        this.player.visible = !this.player.visible;
    },

    nextlevel: function () {
        this.asteroids.removeAll(true);

        if (this.asteroidsCount < asteroidProperties.maxAsteroids) {
            this.asteroidsCount += asteroidProperties.incrementAsteroids;
        }

        this.resetAsteroids();
    },

    updateScore: function (score) {
        scoretrack += score;
        scoreText.text = scoretrack;
    },

    splitAsteroid: function (asteroid) {
        if (asteroidProperties[asteroid.key].nextSize) {
            this.createAsteroid(asteroid.x, asteroid.y, asteroidProperties[asteroid.key].nextSize, asteroidProperties[asteroid.key].pieces);
        }
    },

    removeinvul: function () {
        this.invulnerable = false;
        this.player.visible = true;
    },

    respawn: function () {
        this.invulnerable = true;
        this.player.reset(startx, starty);
        this.player.angle = -90;

        game.time.events.add(Phaser.Timer.SECOND * shipProperties.timetoreset, this.removeinvul, this);
        game.time.events.repeat(Phaser.Timer.SECOND * shipProperties.blinkdelay, shipProperties.timetoreset / shipProperties.blinkdelay, this.shipblink, this);
    },

    killShip: function () {
        shiplives --;
        scoreLives.text = shiplives;
        
        if (shiplives > 0) {
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timetoreset, this.respawn, this);
        }
        else {
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timetoreset, this.endGame, this);
            shiplives = shipProperties.lives;
        }
    },

    endGame: function() {
        game.state.start('main');
    },

    asteroidCollision: function (target, asteroid) {
        target.kill();
        asteroid.kill();

        if (target.key == 'Ship') {
            this.killShip();
        }

        this.splitAsteroid(asteroid);
        this.updateScore(asteroidProperties[asteroid.key].score);

        if (!this.asteroids.countLiving()) {
            game.time.events.add(Phaser.Timer.SECOND * gameProperties.leveldelay, this.nextlevel, this);
        }
    },

    checkBoundaries: function (player) {
            if (player.x < 0) {
                player.x = game.width;
            } else if (player.x > game.width) {
                player.x = 0;
            } 

            if (player.y < 0) {
                player.y = game.height;
            } else if (player.y > game.height) {
                player.y = 0;
            }
    },

    move: function() {
    	if (cursors.left.isDown)
        {
            this.player.body.angularVelocity = -shipProperties.angularVelocity;
        }
        else if (cursors.right.isDown)
        {
            this.player.body.angularVelocity = shipProperties.angularVelocity;
        }
        else
        {
            this.player.body.angularVelocity = 0;
        }

        if (cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(this.player.rotation, shipProperties.acceleration, this.player.body.acceleration);
        }
        else
        {
         	this.player.body.acceleration.set(0);   
        }

        if (firekey.isDown) {
        	this.shoot();
        }
    },

    shoot: function() {
    	if (!this.player.alive) {
            return;
        }
        if (game.time.now > this.bulletInterval) {
    		var bullet = this.bullets.getFirstExists(false);

    		if (bullet) {
    			var length = this.player.width*0.5;
    			var x = this.player.x + (Math.cos(this.player.rotation) * length);
    			var y = this.player.y + (Math.sin(this.player.rotation) * length);

    			bullet.reset(x,y);
    			bullet.lifespan = bulletProperties.lifespan;
    			bullet.rotation = this.player.rotation;

    			game.physics.arcade.velocityFromRotation(this.player.rotation, bulletProperties.speed, bullet.body.velocity);
    			this.bulletInterval = game.time.now + bulletProperties.interval;
    		}
    	}
    },

    createAsteroid: function (x, y, size, pieces) {
        if (pieces === undefined) {
            pieces = 1;
        }

        for (var i=0; i<pieces; i++) {
        	var asteroid = this.asteroids.create(x, y, size);
        	asteroid.anchor.set(0.5,0.5);
        	asteroid.body.angularVelocity = game.rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);

        	var randomAngle = game.math.degToRad(game.rnd.angle());
        	var randomVelocity = game.rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);
        	game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
        }
    },

    resetAsteroids: function () {
    	for (var i=0; i < this.asteroidsCount; i++) {
    		var side = Math.round(Math.random());
    		var x;
    		var y;

    		if (side) {
    			x = Math.round(Math.random()) * gameProperties.screenWidth;
    			y = Math.random() * gameProperties.screenHeight;
    		}
    		else {
    			x = Math.random() * gameProperties.screenWidth;
    			y = Math.round(Math.random()) * gameProperties.screenHeight;
    		}

    		this.createAsteroid(x, y, 'asteroidLarge');
        }
       
    }
}

var mainState = function(game) {
    this.starttext;
}

mainState.prototype = {
    create: function () {
        var startInstructions = 'Click to start -\n\nUP arrowkey for thrust \n\nLeft/Right to turn \n\nSpace to fiya';
        this.starttext = game.add.text(startx, starty, startInstructions, whitefont);
        this.starttext.align = 'center';
        this.starttext.anchor.set(0.5, 0.5);

        game.input.onDown.addOnce(this.startGame, this);

    },

    startGame: function () {
        game.state.start('game');
    }
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.add('game', gameState);
game.state.start('main');
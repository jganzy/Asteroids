
//	Create your Phaser game and inject it into the gameContainer div.
//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)

var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
    leveldelay: 3
};

var mainState = function(game) {
    starttext;
}

mainState.prototype = {
    function createmain () {
        var startInstructions = 'Click to start -\n\nUP arrowkey for thrust \n\nLeft/Right to turn \n\nSpace to fiya';
        starttext = game.add.text(game.world.centerX. game.world.centerY, whitefont);
        starttext.align = 'center';
        starttext.anchor.set(0.5, 0.5);

        game.input.onDown.addOnce(startGame,);

    },

    function startGame () {

    }
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
game.state.add('main', mainState);
game.state.add('game', gameState);
game.state.start('main');

function preload() {		
	game.load.image('asteroidLarge', 'assets/asteroidLarge.png');
    game.load.image('asteroidSmall', 'assets/asteroidSmall.png');
    game.load.image('asteroidMedium', 'assets/asteroidMedium.png');
    game.load.image('Bullet', 'assets/bullet.png');
    game.load.image('Ship', 'assets/ship.png');
}

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
    lives: 3,
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


function create() {	

	game.physics.startSystem(Phaser.Physics.ARCADE);

	bullets = game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(bulletProperties.maxCount, 'Bullet');
	bullets.setAll('anchor.x', 0.5);
	bullets.setAll('anchor.y', 0.5);
	bullets.setAll('lifespan', bulletProperties.lifespan);
	bulletInterval = 0;

	player = game.add.sprite(startx, starty, 'Ship');	
	player.angle = -90;
    player.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.body.drag.set(shipProperties.drag);
    player.body.maxVelocity.set(shipProperties.maxVelocity);
    invulnerable = false;

    asteroids = game.add.group();
    asteroidsCount = asteroidProperties.startingAsteroids;
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    resetAsteroids();

    cursors = game.input.keyboard.createCursorKeys();
    firekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    akey = game.input.keyboard.addKey(Phaser.Keyboard.A);

    scoreText = game.add.text(10, 10, 'Score: 0', {fontSize:'20px', fill:'#FFF'});
    scoreLives = game.add.text(10, 40, shipProperties.lives, {font: '20px Arial', fill: '#FFFFFF', align: 'center'});
}


function update() {

    checkBoundaries(player);
    bullets.forEachExists(checkBoundaries);
    asteroids.forEachExists(checkBoundaries);
    move();

    game.physics.arcade.overlap(bullets, asteroids, asteroidCollision, null, );
 
    if (!invulnerable) {
        game.physics.arcade.overlap(player, asteroids, asteroidCollision, null, );
    }
}

function shipblink () {
    player.visible = !player.visible;
}

function nextlevel () {
    asteroids.removeAll(true);

    if (asteroidsCount < asteroidProperties.maxAsteroids) {
        asteroidsCount += asteroidProperties.incrementAsteroids;
    }

    resetAsteroids();
}

function updateScore (score) {
    scoretrack += score;
    scoreText.text =  scoretrack;
}

function splitAsteroid (asteroid) {
    if (asteroidProperties[asteroid.key].nextSize) {
        createAsteroid(asteroid.x, asteroid.y, asteroidProperties[asteroid.key].nextSize, asteroidProperties[asteroid.key].pieces);
    }
}

function removeinvul () {
    invulnerable = false;
    player.visible = true;
}

function respawn() {
    invulnerable = true;
    player.reset(startx, starty);
    player.angle = -90;

    game.time.events.add(Phaser.Timer.SECOND * shipProperties.timetoreset, removeinvul, );
    game.time.events.repeat(Phaser.Timer.SECOND * shipProperties.blinkdelay, shipProperties.timetoreset / shipProperties.blinkdelay, shipblink, );
}

function killShip () {
    shiplives --;
    scoreLives.text = shiplives;

    if (shiplives > 0) {
        game.time.events.add(Phaser.Timer.SECOND * shipProperties.timetoreset, respawn, );
    }
}

function asteroidCollision (target, asteroid) {
    target.kill();
    asteroid.kill();

    if (target.key == 'Ship') {
        killShip();
    }

    splitAsteroid(asteroid);
    updateScore(asteroidProperties[asteroid.key].score);

    if (!asteroids.countLiving()) {
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.leveldelay, nextlevel,);
    }
}

function checkBoundaries (player) {
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
}

function move() {
	if (cursors.left.isDown)
    {
        player.body.angularVelocity = -shipProperties.angularVelocity;
    }
    else if (cursors.right.isDown)
    {
        player.body.angularVelocity = shipProperties.angularVelocity;
    }
    else
    {
        player.body.angularVelocity = 0;
    }

    if (cursors.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(player.rotation, shipProperties.acceleration, player.body.acceleration);
    }
    else
    {
     	player.body.acceleration.set(0);   
    }

    if (firekey.isDown) {
    	shoot();
    }
}

function shoot() {
	if (!player.alive) {
        return;
    }
    if (game.time.now > bulletInterval) {
		var bullet = bullets.getFirstExists(false);

		if (bullet) {
			var length = player.width*0.5;
			var x = player.x + (Math.cos(player.rotation) * length);
			var y = player.y + (Math.sin(player.rotation) * length);

			bullet.reset(x,y);
			bullet.lifespan = bulletProperties.lifespan;
			bullet.rotation = player.rotation;

			game.physics.arcade.velocityFromRotation(player.rotation, bulletProperties.speed, bullet.body.velocity);
			bulletInterval = game.time.now + bulletProperties.interval;
		}
	}
}

function createAsteroid (x, y, size, pieces) {
    if (pieces == undefined) {
        pieces = 1;
    }

    for (var i=0; i<pieces; i++) {
    	var asteroid = asteroids.create(x, y, size);
    	asteroid.anchor.set(0.5,0.5);
    	asteroid.body.angularVelocity = game.rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);

    	var randomAngle = game.math.degToRad(game.rnd.angle());
    	var randomVelocity = game.rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);
    	game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
    }
}

function resetAsteroids () {
	for (var i=0; i < asteroidsCount; i++) {
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

		createAsteroid(x, y, 'asteroidLarge');
    }
}



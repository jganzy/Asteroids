var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
}

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
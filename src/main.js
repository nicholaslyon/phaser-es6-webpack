import 'pixi';
import 'p2';
import Phaser from 'phaser';

import config from './config';

function updateScore() {
  //  Add and update the score
  window.score.amount += 10;
  window.score.text.text = `Score: ${window.score.amount}`;
}

function collectStar(player, star) {
  // remove star
  star.kill();

  updateScore();
}

function preload() {
  // load some images
  window.game.load.image('sky', 'assets/images/sky.png');
  window.game.load.image('ground', 'assets/images/platform.png');
  window.game.load.image('star', 'assets/images/star.png');
  window.game.load.spritesheet('dude', 'assets/images/dude.png', 32, 48);
}

function create() {
  //  We're going to be using physics, so enable the Arcade Physics system
  window.game.physics.startSystem(Phaser.Physics.ARCADE);

  //  A simple background for our game
  window.game.add.sprite(0, 0, 'sky');

  //  The platforms group contains the ground and the 2 ledges we can jump on
  window.platforms = window.game.add.group();

  //  We will enable physics for any object that is created in this group
  window.platforms.enableBody = true;

  // Here we create the ground.
  const ground = window.platforms.create(0, window.game.world.height - 64, 'ground');

  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  ground.scale.setTo(2, 2);

  //  This stops it from falling away when you jump on it
  ground.body.immovable = true;

  //  Now let's create two ledges
  let ledge = window.platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;

  ledge = window.platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;

  // The player and its settings
  window.player = window.game.add.sprite(32, window.game.world.height - 150, 'dude');

  //  We need to enable physics on the window.player
  window.game.physics.arcade.enable(window.player);

  //  Player physics properties. Give the little guy a slight bounce.
  // window.player.body.bounce.y = 0.2;
  window.player.body.gravity.y = 900;
  window.player.body.collideWorldBounds = true;

  //  Our two animations, walking left and right.
  window.player.animations.add('left', [0, 1, 2, 3], 10, true);
  window.player.animations.add('right', [5, 6, 7, 8], 10, true);

  // create star grouping
  window.stars = window.game.add.group();
  window.stars.enableBody = true;

  //  Here we'll create 12 of them evenly spaced apart
  for (let i = 0; i < 12; i += 1) {
    //  Create a star inside of the 'stars' group
    const star = window.stars.create(i * 70, 0, 'star');

    //  Let gravity do its thing
    star.body.gravity.y = 400;

    //  This just gives each star a slightly random bounce value
    star.body.bounce.y = 0.7 + (Math.random() * 0.2);
    star.body.collideWorldBounds = true;
  }

  // score object
  window.score.text = window.game.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    fill: '#000',
  });

  // game controls
  window.cursors = window.game.input.keyboard.createCursorKeys();
}

function update() {
  // console.log(window.cursors.up.justDown);
  //  Collide the player and the stars with the platforms
  const hitPlatform = window.game.physics.arcade.collide(window.player, window.platforms);

  // collide stars with platforms and overlap with players
  window.game.physics.arcade.collide(window.stars, window.platforms);
  window.game.physics.arcade.overlap(window.player, window.stars, collectStar, null, this);

  //  Reset the players velocity (movement)
  window.player.body.velocity.x = 0;

  if (window.cursors.left.isDown) {
    //  Move to the left
    window.player.body.velocity.x = -250;

    window.player.animations.play('left');
  } else if (window.cursors.right.isDown) {
    //  Move to the right
    window.player.body.velocity.x = 250;

    window.player.animations.play('right');
  } else {
    //  Stand still
    window.player.animations.stop();

    window.player.frame = 4;
  }

  //  Allow the player to jump if they are touching the ground.
  if (window.cursors.up.justDown && window.player.body.touching.down && hitPlatform) {
    window.player.body.velocity.y = -550;
  }
}

class Game extends Phaser.Game {
  constructor() {
    const docElement = document.documentElement;
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth;
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight;

    super(width, height, Phaser.AUTO, 'content', {
      preload, create, update,
    });
  }
}

window.game = new Game();
window.platforms = null;
window.player = null;
window.cursors = null;
window.stars = null;
window.score = {
  amount: 0,
  text: undefined,
};

if (window.cordova) {
  const app = {
    initialize() {
      document.addEventListener(
        'deviceready',
        this.onDeviceReady.bind(this),
        false
      );
    },

    // deviceready Event Handler
    //
    onDeviceReady() {
      this.receivedEvent('deviceready');

      // When the device is ready, start Phaser Boot state.
      window.game.state.start('Boot');
    },

    receivedEvent(id) {
      console.log(`Received Event: ${id}`);
    },
  };

  app.initialize();
}

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private zombies?: Phaser.Physics.Arcade.Group;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText?: Phaser.GameObjects.Text;
  private score: number = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets here
    this.load.image('player', '/assets/player.png');
    this.load.image('zombie', '/assets/zombie.png');
  }

  create() {
    // Create game objects
    this.player = this.physics.add.sprite(400, 300, 'player');
    if (this.player) {
      this.player.setCollideWorldBounds(true);
    }

    this.zombies = this.physics.add.group();
    if (this.input && this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#fff'
    });

    // Add collision detection
    if (this.player && this.zombies) {
      this.physics.add.collider(
        this.player,
        this.zombies,
        this.handleZombieCollision,
        undefined,
        this
      );
    }

    // Start spawning zombies
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnZombie,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    // Handle player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
  }

  private spawnZombie() {
    if (!this.zombies || !this.player) return;

    const x = Math.random() < 0.5 ? 0 : 800;
    const y = Math.random() * 600;
    const zombie = this.zombies.create(x, y, 'zombie');
    
    const speed = 100;
    const angle = Phaser.Math.Angle.Between(
      x, y,
      this.player.x, this.player.y
    );
    
    if (zombie.body) {
      this.physics.velocityFromRotation(angle, speed, (zombie.body as Phaser.Physics.Arcade.Body).velocity);
    }
  }

  private handleZombieCollision() {
    if (this.scoreText) {
      this.score -= 10;
      this.scoreText.setText('Score: ' + this.score);
    }
  }
}

export default function GameCanvas() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: MainScene
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
} 
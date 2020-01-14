import "phaser";
import {Player} from "../objects/player";
import {Monster} from "../objects/Monster";
import {Slime} from "../objects/Slime";

export class FirstLevelScene extends Phaser.Scene {
    public player;
    public layer: Phaser.Tilemaps.StaticTilemapLayer;

    private countdownTime: number;
    private countdownTimer: Phaser.Time.TimerEvent;
    private countdownInfo: Phaser.GameObjects.Text;
    private delta: number;
    private lastMonsterTime: number;
    private monsters: string[];
    private monstersReleased: Phaser.Physics.Arcade.Sprite[];
    private playerLives: number;
    private playerLivesInfo: Phaser.GameObjects.Text;
    private invulnerable: boolean;
    private controlsInfo: Phaser.GameObjects.Text;
    private weaponTypeInfo: Phaser.GameObjects.Text;
    private weaponStateInfo: Phaser.GameObjects.Text;

    private testSlime1;
    private testSlime2;
    private testSlime3;
    private testSlime4;
    private testSlime5;

    constructor() {
        super({
            key: "FirstLevelScene"
        });
    }

    init(params): void {
        this.countdownTime = 30;
        this.delta = 3000;
        this.lastMonsterTime = 0;
        this.monsters = ['walkingMonsterOne', 'walkingMonsterTwo', 'flyingMonster'];
        this.playerLives = 3;
        this.monstersReleased = [];
    }

    preload(): void {
        this.load.setBaseURL(
            "https://raw.githubusercontent.com/Mars9934/" +
            "Sword-n-Bow/master/src/");
        this.load.image("sky", "assets/sky.jpg");
        this.load.image("SwordnBowTileset", "assets/tilesets/SwordnBowTileset.png");
        this.load.image("player", "assets/anims/player/playerPic.png");
        this.load.atlas('playerMoves', "assets/anims/player/playerMovement.png", "assets/anims/player/playerMovement.json");
        this.load.atlas('playerCombat', "assets/anims/player/playerCombat.png", "assets/anims/player/playerCombat.json");
        this.load.tilemapTiledJSON("SwordnBowTileMap", "assets/tilemaps/SwordnBowTileMap.json");

        this.load.image("knightSprite", "assets/anims/monsters/knightSprite.png");
        this.load.image("slimeSprite", "assets/anims/monsters/slimeSprite.png");
        this.load.atlas('knight', "assets/anims/monsters/knight.png", "assets/anims/monsters/knight.json");
        this.load.atlas('slime', "assets/anims/monsters/slime.png", "assets/anims/monsters/slime.json");

    }

    create(): void {
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: this.decreaseTime,
            callbackScope: this,
            loop: true
        });
        this.makeTerrain();

        this.countdownInfo = this.add.text(30, 10, 'TIMER: ' + this.countdownTime,
            {font: '30px Arial Bold', fill: '#FF0000'});
        // this.controlsInfo = this.add.text(200, 300, 'SPACE to jump, DOWN to duck',
        //     {font: '36px Arial Bold', fill: '#FFFF00'});
        // this.time.delayedCall(5000, () => {
        //     this.controlsInfo.destroy();
        // });
        this.createPlayerAnimations();
        this.player = new Player(this, 100, 633, 'player');
        this.playerLivesInfo = this.add.text(30, 50, 'HP: ' + this.player.currentHP,
            {font: '30px Arial Bold', fill: '#FFFF00'});

        this.events.on('attack', this.player.sword.damageNearby, this.player.sword);
        this.events.on('monsterAttack', this.player.receiveDamage, this.player);

        this.createMonsterAnimations();
        this.testSlime1 = new Slime(this, 900, 650, 50);
        this.testSlime2 = new Slime(this, 400, 528, 100);
        this.testSlime3 = new Slime(this, 800, 340, 200);
        this.testSlime4 = new Slime(this, 900, 340, 150);
        this.testSlime5 = new Slime(this, 800, 123, 300);

        this.weaponTypeInfo = this.add.text(200, 10, 'Weapon: Sword',
            {font: '30px Arial Bold', fill: '#800080'});
        this.weaponStateInfo = this.add.text(200, 50, 'Attack type: One',
            {font: '30px Arial Bold', fill: '#000000'});
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.layer.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
    }

    update(time: number): void {
        // this.handleJump();
        if (this.player != undefined && this.player.anims != undefined) {
            this.player.update();
        } else this.endScreen("You died!");
        if(this.testSlime1 != undefined) {
            this.testSlime1.update();
        }
        if(this.testSlime2 != undefined) {
            this.testSlime2.update();
        }
        if(this.testSlime3 != undefined) {
            this.testSlime3.update();
        }
        if(this.testSlime4 != undefined) {
            this.testSlime4.update();
        }
        if(this.testSlime5 != undefined) {
            this.testSlime5.update();
        }
        let diff: number = time - this.lastMonsterTime;
        // if (diff > this.delta + Phaser.Math.Between(-600, 600)) {
        //     this.lastMonsterTime = time;
        //     this.releaseMonster();
        // }
        this.playerLivesInfo.text = 'HP: ' + this.player.currentHP;
        this.weaponTypeInfo.text = 'Weapon (Switch - Q): ' + this.player.getWeaponType();
        this.weaponStateInfo.text = 'Attack type (Switch - 1,2,3): ' + this.player.getWeaponState();
    }

    private decreaseTime() {
        if (this.countdownTime == 1) {
            this.countdownTimer.remove();
            this.endScreen("TIME'S UP, GAMER, Good job!");
        }
        this.countdownTime -= 1;
        this.countdownInfo.setText('TIMER: ' + this.countdownTime.toString());
    }

    private monsterJump(monster: Phaser.Physics.Arcade.Sprite): () => void {
        return () => {
            monster.setVelocity(-550, -300);
            this.time.delayedCall(1000, () => {
                monster.setVelocity(-550, 300)
            });
        }
    }

    private releaseMonster() {
        let monster: Phaser.Physics.Arcade.Sprite;
        switch (Phaser.Math.Between(0, 2)) {
            case 0: {
                monster = this.physics.add.sprite(1368, 400, 'walkingMonsterOne1');
                monster.anims.play('walkingMonsterOne', true);
                monster.setVelocityX(-200);
                break;
            }
            case 1: {
                monster = this.physics.add.sprite(1368, 540, 'walkingMonsterOne2');
                monster.anims.play('walkingMonsterTwo', true);
                monster.setVelocity(-300, -300);
                this.time.delayedCall(1000, () => {
                    monster.setVelocity(-300, 300);
                });
                this.time.addEvent({
                    delay: 2000,
                    callback: this.monsterJump(monster),
                    callbackScope: this,
                    loop: true
                });
                break;
            }
            case 2: {
                monster = this.physics.add.sprite(1368, 420, 'flyingMonster');
                monster.anims.play('flyingMonster', true);
                monster.setVelocityX(-500);
            }
        }
        monster.setBounce(0.1);
        this.monstersReleased.push(monster);
    }

    private endScreen(ending: string): void {
        this.time.delayedCall(100, () => {
            this.scene.start("ContinueScene", {
                ending: ending,
                score: this.player.monstersKilled,
                scoreType: "monster(s)",
                finishedScene: "FirstLevelScene"
            })
        })
    }

    private makeTerrain() {
        const map = this.make.tilemap({key: 'SwordnBowTileMap'});
        const tileset = map.addTilesetImage("SwordnBowTileset", "SwordnBowTileset");
        this.layer = map.createStaticLayer("Tile Layer 1", tileset);
        this.layer.setCollisionByProperty({collides: true});
    }

    private createPlayerAnimations(): void {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('playerMoves', {
                prefix: 'run_', start: 0, end: 5, suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('playerMoves', {
                prefix: 'jump_', start: 0, end: 3, suffix: '.png'
            }),
            frameRate: 6,
            repeat: 0
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('playerMoves', {
                prefix: 'idle_', start: 0, end: 2, suffix: '.png'
            }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNames('playerMoves', {
                prefix: 'fall_', start: 0, end: 1, suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'attackOne',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'attackOne_', start: 0, end: 5, suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'attackTwo',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'attackTwo_', start: 0, end: 5, suffix: '.png'
            }),
            frameRate: 24,
            repeat: 0
        });
        this.anims.create({
            key: 'attackThree',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'attackThree_', start: 0, end: 5, suffix: '.png'
            }),
            frameRate: 6,
            repeat: 0
        });
        this.anims.create({
            key: 'attackAirOne',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'attackAirOne_', start: 0, end: 3, suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'attackAirTwo',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'attackAirTwo_', start: 0, end: 2, suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'hurt_', start: 0, end: 2, suffix: '.png'
            }),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNames('playerCombat', {
                prefix: 'die_', start: 0, end: 6, suffix: '.png'
            }),
            frameRate: 3,
            repeat: 0
        })
    }

    private createMonsterAnimations(): void {
        this.createSlimeAnims();
    }

    private createSlimeAnims() {
        this.anims.create({
            key: 'slimeIdle',
            frames: this.anims.generateFrameNames('slime', {
                prefix: 'slimeIdle_', start: 0, end: 3, suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'slimeMove',
            frames: this.anims.generateFrameNames('slime', {
                prefix: 'slimeMove_', start: 0, end: 3, suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'slimeAttack',
            frames: this.anims.generateFrameNames('slime', {
                prefix: 'slimeAttack_', start: 0, end: 4, suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'slimeHurt',
            frames: this.anims.generateFrameNames('slime', {
                prefix: 'slimeHurt_', start: 0, end: 3, suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'slimeDie',
            frames: this.anims.generateFrameNames('slime', {
                prefix: 'slimeDie_', start: 0, end: 3, suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0
        });
    }
}
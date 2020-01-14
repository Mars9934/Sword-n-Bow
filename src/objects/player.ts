import "phaser";
import {Sword} from "./Sword";
import {FirstLevelScene} from "../scenes/firstLevelScene";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private MAX_SPEED = 300;
    private MAX_JUMP = -225;
    private HEALTH = 200;

    public currentHP: number;
    public monstersKilled: number;

    private weaponType: string;
    private weaponState: string;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
    private one: Phaser.Input.Keyboard.Key;
    private two: Phaser.Input.Keyboard.Key;
    private three: Phaser.Input.Keyboard.Key;
    private q: Phaser.Input.Keyboard.Key;
    private attackSwitchCD: number;
    private sword;
    private firstScene: FirstLevelScene;
    private movementLock: number;
    private staggerLock: number;
    private deadLock: number;

    private healthDisplay: Phaser.GameObjects.Text;


    constructor(scene: FirstLevelScene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.initVariables();
        this.initImage();
        this.initInput();
        this.movementLock = 0;
        this.scene = scene;
        this.firstScene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.initPhysics();
        this.currentHP = this.HEALTH;
        this.monstersKilled = 0;
        this.healthDisplay = this.scene.add.text(this.x - this.width / 2, this.y - this.height, 'HP: ' + this.currentHP,
            {font: '26px Arial Bold', fill: '#000000'});
    }

    private initVariables(): void {
        this.sword = new Sword(this.scene, 'sword', this);
        this.weaponType = 'Sword';
        this.weaponState = '(1) Normal'; // Indicates the current attack state
        this.attackSwitchCD = 0;
    }

    private initImage(): void {
        this.setOrigin(0.5, 0.5);
    }

    private initInput(): void {
        this.keyboard = this.scene.input.keyboard;
        this.cursors = this.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.SPACE,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        this.one = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.two = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.three = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.q = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.setInteractive();
    }

    private initPhysics(): void {
        this.scene.physics.world.enable(this);
        this.setGravityY(300);
        this.setSize(30, 50);
        // this.setOffset(10, 0);
        this.setCollideWorldBounds(true);
        this.firstScene.physics.world.addCollider(this.firstScene.layer, this);
    }

    update(): void {
        if (this != undefined && this.anims != undefined && !this.deadLock) {
            this.healthDisplay.setPosition(this.x - this.width / 2, this.y - this.height);
            this.healthDisplay.text = 'HP: ' + this.currentHP;
            if (!this.movementLock) {
                this.checkMovements();
            }
            this.handleAttack();
            this.emitAttack();
        }
    }

    public receiveDamage(event): void {
        if (this.x >= event.range[0] && this.x <= event.range[1] && !this.staggerLock && !this.deadLock) {
            this.currentHP -= event.damage;
            this.checkHealth();
        }
    }

    private checkMovements(): void {
        if (this.anims != undefined) {
            // Check for left/right movements & jump animations + air
            if (this.cursors.left.isDown) {
                if (this.anims.currentAnim.key.indexOf('attack') == 0) {    // Check if currently attacking, if is and not falling, slow down movement
                    // @ts-ignore
                    if (this.body.onFloor()) {
                        this.setVelocityX(-this.MAX_SPEED / 5);
                    } else this.setVelocityX(-this.MAX_SPEED / 1.5);
                } else this.setVelocityX(-this.MAX_SPEED);
            } else if (this.cursors.right.isDown) {
                if (this.anims.currentAnim.key.indexOf('attack') == 0) {    // Check if currently attacking, if is and not falling, slow down movement
                    // @ts-ignore
                    if (this.body.onFloor()) {
                        this.setVelocityX(this.MAX_SPEED / 5);
                    } else this.setVelocityX(this.MAX_SPEED / 1.5);
                } else this.setVelocityX(this.MAX_SPEED);
            } else {
                this.setVelocityX(0);
            }
            // Check for appropriate run-jump animations
            if (this.scene.input.mousePointer.isDown) {
                if (this.scene.input.mousePointer.x <= this.x) {
                    this.setFlipX(true);
                } else this.setFlipX(false);
                this.sword.swingSword(this.weaponState);
            } else if (this.cursors.left.isDown) {
                this.setFlipX(true);
                if (this.cursors.up.isDown || this.body.velocity.y < 0) {
                    this.anims.play('jump', true);
                } else this.anims.play('run', true);
            } else if (this.cursors.right.isDown) {
                this.setFlipX(false);
                if (this.cursors.up.isDown || this.body.velocity.y < 0) {
                    this.anims.play('jump', true);
                } else this.anims.play('run', true);
            } else {
                if (this.cursors.up.isDown || this.body.velocity.y < 0) {
                    this.anims.play('jump', true);
                } else this.anims.play('idle', true);
            }
            // Check for jump movements and fall animation
            // @ts-ignore
            if (this.cursors.up.isDown && this.body.onFloor()) {
                this.setVelocityY(this.MAX_JUMP);
                this.anims.play('jump', true);
            }
            if (this.body.velocity.y > 0) {
                if (this.scene.input.mousePointer.isDown) {
                    if (this.scene.input.mousePointer.x <= this.x) {
                        this.setFlipX(true);
                    } else this.setFlipX(false);
                    this.sword.swingSword(this.weaponState);
                } else this.anims.play('fall', true);
            }
        }
    }

    private handleAttack(): void {
        if (this.q.isDown && this.attackSwitchCD != 1) {
            if (this.weaponType == 'Sword') {
                this.weaponType = 'Bow';
            } else this.weaponType = 'Sword';
            this.attackSwitchCD = 1;
            this.scene.time.delayedCall(250, () => {
                this.attackSwitchCD = 0;
            })
        }
        if (this.weaponType == 'Sword') {
            if (this.one.isDown) {
                this.weaponState = '(1) Normal';
            }
            if (this.two.isDown) {
                this.weaponState = '(2) Fast';
            }
            if (this.three.isDown) {
                this.weaponState = '(3) Swirl';
            }
        }
    }

    private checkHealth(): void {
        if (!this.staggerLock) {
            this.stagger();
        }
        if (this.currentHP <= 0) {
            this.deadLock = 1;
            this.healthDisplay.setVisible(false);
            this.anims.play('die', true);
            this.on('animationcomplete-die', () => {
                this.destroy();
            });
        }
    }

    private emitAttack() {
        if (this.anims.currentFrame == this.scene.anims.get('attackOne').frames[2] ||
            this.anims.currentFrame == this.scene.anims.get('attackTwo').frames[3] ||
            this.anims.currentFrame == this.scene.anims.get('attackThree').frames[2] ||
            this.anims.currentFrame == this.scene.anims.get('attackAirOne').frames[1]) {
            this.scene.events.emit('attack');
        }
    }

    private stagger() {
        this.staggerLock = 1;
        this.setTint(0xffcccb);
        this.movementLock = 1;
        this.anims.play('hurt', true);
        if (this.flipX) {
            this.setVelocityX(60);
        } else this.setVelocityX(-60);
        this.on('animationcomplete-hurt', () => {
            this.clearTint();
            this.setVelocityX(0);
            this.movementLock = 0;
            this.staggerLock = 0;
        })
    }

    public getWeaponType(): string {
        return this.weaponType;
    }

    public getWeaponState(): string {
        return this.weaponState;
    }

}
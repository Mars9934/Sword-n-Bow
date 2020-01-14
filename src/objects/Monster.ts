import "phaser";
import {FirstLevelScene} from "../scenes/firstLevelScene";

export abstract class Monster extends Phaser.Physics.Arcade.Sprite {
    private X_DETECTION_RANGE: number = 300;
    private Y_DETECTION_RANGE: number = 100;
    private COLLISION_DAMAGE: number = 10;

    private patrolTime: number;
    private currentHP: number;
    private speed: number;

    private healthDisplay: Phaser.GameObjects.Text;
    private firstScene: FirstLevelScene;
    private initiallyRight: boolean;
    private lastPatrolDir: number; // 0 = left, 1 = right
    private patrolLock: number;
    protected attackLock: number;
    private isDead: boolean;

    protected constructor(scene: FirstLevelScene, x: number, y: number, texture: string, health: number, initiallyRight: boolean,
                          speed: number, patrolTime: number) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.firstScene = scene;
        this.initPhysics();
        this.setData({
            monster: true,
            health: health
        });
        this.speed = speed;
        this.patrolTime = patrolTime;

        this.patrolLock = 0;
        this.attackLock = 0;
        this.lastPatrolDir = Phaser.Math.Between(0, 1);
        this.isDead = false;

        this.currentHP = this.getData('health');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.healthDisplay = this.scene.add.text(this.x - this.width / 2, this.y - this.height, 'HP: ' + this.getData('health'),
            {font: '26px Arial Bold', fill: '#000000'});
    }

    private initPhysics() {
        this.scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.setGravityY(300);
        this.scene.physics.world.addCollider(this.firstScene.layer, this);
    }

    update(): void {
            this.checkHealth();
            this.healthDisplay.setPosition(this.x - this.width / 2, this.y - this.height);
            this.healthDisplay.text = 'HP: ' + this.getData('health');
            if (this.anims != undefined && !this.isDead) {
                this.emitAttack();
                this.checkBoundsAndFlip();
                if (!this.playerIsNear()) {
                    this.patrol();
                } else if (this.playerIsNear()) {
                    if (this.playerInRange()[0] && !this.attackLock) {
                        this.handleAttack();
                    } else if (!this.attackLock) {
                        this.moveToPlayer();
                    }
                }
            }
        }

    public patrol(): void {
        this.playPatrolAnim();
        if (!this.patrolLock) {
            if (this.lastPatrolDir == 0) {
                this.setVelocityX(this.speed);
                if (this.initiallyRight) {
                    this.setFlipX(false);
                } else {
                    this.setFlipX(true);
                }
                this.lastPatrolDir = 1;
            } else if (this.lastPatrolDir == 1) {
                this.setVelocityX(-this.speed);
                if (this.initiallyRight) {
                    this.setFlipX(true);
                } else {
                    this.setFlipX(false);
                }
                this.lastPatrolDir = 0;
            }
            this.patrolLock = 1;
            this.scene.time.delayedCall(this.patrolTime, () => {
                this.patrolLock = 0;
            })
        }
    }

    protected isHit(): boolean {
        return this.getData('health') < this.currentHP;
    }

    protected checkHealth(): void {
        if (this.isHit()) {
            this.attackLock = 1;
            this.currentHP = this.getData('health');
            this.setTint(0xffcccb);
            this.scene.time.delayedCall(150, () => {
                this.clearTint();
            });
            let hurtAnim;
            if(this.anims != undefined && this.getData('health') > 0) {
                hurtAnim = this.playHurtAnim();
                this.setVelocityX(0);
            }
            this.on('animationcomplete-' + hurtAnim, () => {
                this.attackLock = 0;
            })
        }
        if (this.getData('health') <= 0 && !this.isDead) {
            this.healthDisplay.setVisible(false);
            this.isDead = true;
            this.firstScene.player.monstersKilled += 1;
            this.playDieAnim();
            this.on('animationcomplete-slimeDie', () => {
                this.destroy();
            })
        }
    }

    protected playerIsNear(): boolean {
        const xDist = Math.abs(this.x - this.firstScene.player.x);
        const yDist = this.y - this.firstScene.player.y;
        return xDist < this.X_DETECTION_RANGE && yDist >= 0 && yDist < this.Y_DETECTION_RANGE;
    }

    private checkBoundsAndFlip(): void {
        let xCoord = Math.floor(this.x / 16), yCoord = Math.floor(this.y / 16),
            widthInTile = Math.floor(this.width / 32), height = Math.floor(this.height / 16);
        const leftBotTile = this.firstScene.layer.getTileAt(xCoord - widthInTile, yCoord + height, true);
        const rightBotTile = this.firstScene.layer.getTileAt(xCoord + widthInTile, yCoord + height, true);
        const leftTile = this.firstScene.layer.getTileAt(xCoord - widthInTile, yCoord, true);
        const rightTile = this.firstScene.layer.getTileAt(xCoord + widthInTile, yCoord, true);

        let leftBotCollides, rightBotCollides, leftTileCollides, rightTileCollides;
        if (leftBotTile != undefined) {
            leftBotCollides = leftBotTile.collides;
        }
        if (rightBotTile != undefined) {
            rightBotCollides = rightBotTile.collides;
        }
        if (leftTile != undefined) {
            leftTileCollides = leftTile.collides;
        }
        if (rightTile != undefined) {
            rightTileCollides = rightTile.collides;
        }
        if (!leftBotCollides || leftTileCollides || xCoord - widthInTile <= 0) {
            if (this.initiallyRight) {
                this.setFlipX(false);
            } else this.setFlipX(true);
            this.setVelocityX(this.speed);
        } else if (!rightBotCollides || rightTileCollides || xCoord + widthInTile >= 86) {
            if (this.initiallyRight) {
                this.setFlipX(true);
            } else this.setFlipX(false);
            this.setVelocityX(-this.speed);
        }
    }

    protected getScene(): FirstLevelScene {
        return this.firstScene;
    }

    // Monster-specific behaviors
    abstract moveToPlayer();

    abstract playerInRange();

    abstract handleAttack();

    abstract emitAttack();

    // Monster-specific animations
    abstract playHurtAnim(): string;

    abstract playPatrolAnim();

    abstract playDieAnim();
}
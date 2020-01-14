import "phaser";
import {Monster} from "./Monster";
import {FirstLevelScene} from "../scenes/firstLevelScene";

export class Slime extends Monster {
    private SPEED: number = 25;
    private ATTACK_DAMAGE: number = 30;
    private ATTACK_RANGE: number = 50;

    constructor(scene: FirstLevelScene, x: number, y: number, health: number) {
        super(scene, x, y, 'slimeSprite', health, false, 25, 7000);
        this.setSize(this.width, this.height - 10);
    }

    moveToPlayer(): void {
        this.anims.play('slimeMove', true);
        if (this.getScene().player.x < this.x - 10) {
            this.setVelocityX(-this.SPEED * 2);
            this.setFlipX(false);
        } else if (this.getScene().player.x > this.x + 10) {
            this.setVelocityX(this.SPEED * 2);
            this.setFlipX(true);
        }
    }

    playerInRange(): [boolean, string] {
        let dist = this.x - this.getScene().player.x;
        if (dist >= 0 && dist <= this.ATTACK_RANGE) {
            return [true, 'left'];
        } else if (dist <= 0 && dist >= -this.ATTACK_RANGE) {
            return [true, 'right'];
        } else return [false, 'none'];
    }

    playHurtAnim(): string {
        this.anims.play('slimeHurt', true);
        return 'slimeHurt';
    }

    playPatrolAnim(): void {
        this.anims.play('slimeMove', true);
    }

    playDieAnim(): void {
        this.anims.play('slimeDie', true);
    }

    handleAttack(): void {
        const isPlayerInRange = this.playerInRange();
        if (isPlayerInRange[0]) {
            if (isPlayerInRange[1] == 'left') {
                this.setFlipX(false);
            } else if (isPlayerInRange[1] == 'right') {
                this.setFlipX(true);
            }
            this.attackLock = 1;
            this.anims.play('slimeAttack', true);
            this.on('animationcomplete-slimeAttack', () => {
                this.anims.play('slimeIdle', true);
                this.setVelocityX(0);
            });
            this.getScene().time.delayedCall(300, () => {
                this.attackLock = 0;
            })
        }
    }

    emitAttack(): void {
        if(this.anims.currentFrame == this.scene.anims.get('slimeAttack').frames[2]) {
            this.scene.events.emit('monsterAttack', {
                damage: this.ATTACK_DAMAGE,
                range: this.currAttackRange(),
                verticalRange: [this.y + this.width / 2, this.y - this.width / 2]
            });
        }
    }

    private currAttackRange(): [number, number] {
        if(this.flipX) {
            return [this.x, this.x + this.ATTACK_RANGE];
        }
        else return [this.x - this.ATTACK_RANGE, this.x];
    }
}
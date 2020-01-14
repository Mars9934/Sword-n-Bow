import "phaser";
import {Monster} from "./Monster";

export class Sword extends Phaser.GameObjects.GameObject {
    private player;
    private ATTACK_DAMAGE = 5;
    private ATTACK_RANGE = 60;

    constructor(scene: Phaser.Scene, attack: string, player: Phaser.Physics.Arcade.Sprite) {
        super(scene, attack);
        this.player = player;
    }

    public swingSword(weaponState: string): void {
        if (!this.player.body.onFloor()) {
            this.player.anims.play('attackAirOne', true);
        } else this.player.anims.play('attack' + this.stateToNum(weaponState), true);
    }


    private damageNearby(): void {
        this.scene.children.getAll().forEach(
            (obj: any) => {
                if (obj.getData('monster') != undefined) {
                    const distDirToPlayer = this.calcDistanceToPlayer(obj);
                    if (distDirToPlayer[0] < this.ATTACK_RANGE) {
                        if ((distDirToPlayer[1] == 'left' && this.player.flipX) ||      // If monster to the left
                            (distDirToPlayer[1] == 'right' && !this.player.flipX) ||    //            to the right
                            (distDirToPlayer[1] == 'top' && this.player.y >= obj.y) ||  //            on top of
                            (distDirToPlayer[1] == 'bottom' && this.player.y <= obj.y)) {//           below
                            obj.data.values.health -= this.ATTACK_DAMAGE;
                        }
                    }
                }
            }
        );
    }

    private calcDistanceToPlayer(monster: Monster): [number, string] {
        let xDist = monster.x - this.player.x;
        let yDist = monster.y - this.player.y;
        let objectLocX = 'right';
        let objectLocY = 'bottom';
        if (xDist < 0) {
            xDist = Math.abs(xDist);
            objectLocX = 'left';
        }
        if (yDist < 0) {
            yDist = Math.abs(yDist);
            objectLocY = 'top';
        }
        if (xDist >= yDist) {
            return [xDist, objectLocX];
        } else return [yDist, objectLocY];
    }

    private stateToNum(state: string): string {
        if (state == '(1) Normal') {
            return 'One';
        } else if (state == '(2) Fast') {
            return 'Two';
        } else if (state == '(3) Swirl') {
            return 'Three';
        }
    }


}
import "phaser";

export class CoinScene extends Phaser.Scene {
    delta: number;
    lastDropTime: number;
    coinsCaught: number;
    knivesCaught: number;
    coinsMissed: number;
    maxCoinsMissed: number;
    maxKnivesCaught: number;
    countdownTime: number;
    countdownTimer: Phaser.Time.TimerEvent;
    countdownInfo: Phaser.GameObjects.Text;
    hand: Phaser.Physics.Arcade.Image;
    info: Phaser.GameObjects.Text;
    score: Phaser.GameObjects.Text;
    lava: Phaser.Physics.Arcade.StaticGroup;
    layer;

    constructor() {
        super({
            key: "CoinScene"
        });
    }

    init(params): void {
        this.delta = 1000;
        this.lastDropTime = 0;
        this.coinsCaught = 0;
        this.knivesCaught = 0;
        this.coinsMissed = 0;
        this.maxCoinsMissed = 5;
        this.maxKnivesCaught = 3;
        this.countdownTime = 30;
    }

    preload(): void {
        this.load.setBaseURL(
            "https://raw.githubusercontent.com/Mars9934/" +
            "9Rooms/master/src/");
        this.load.image("coin", "assets/coin.png");
        this.load.image("knife", "assets/knife.png");
        this.load.image("hand", "assets/hand.png");
        this.load.image("lava", "assets/lava.jpg");
        this.load.image("castleBackground", "assets/castleBackground.jpg");
        this.load.image("SwordnBowTileset", "assets/tilesets/SwordnBowTileset.png");
        this.load.tilemapTiledJSON("SwordnBowTilemap", "assets/tilemaps/SwordnBowTilemap.json");
    }

    create(): void {
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: this.decreaseTime,
            callbackScope: this,
            loop: true
        });
        this.add.image(400, 300, 'castleBackground');
        const map = this.make.tilemap({key: 'SwordnBowTilemap'});
        const tileset = map.addTilesetImage("SwordnBowTileset", "SwordnBowTileset");
        this.layer = map.createStaticLayer("Tile Layer 1", tileset);
        this.layer.setCollisionByProperty({collides: true});
        this.layer.collideTop = true;
        // this.lava = this.physics.add.staticGroup({
        //     key: 'lava',
        //     frameQuantity: 20
        // });
        // Phaser.Actions.PlaceOnLine(this.lava.getChildren(),
        //     new Phaser.Geom.Line(20, 580, 820, 580));
        // this.lava.refresh();

        this.countdownInfo = this.add.text(600, 10, 'TIMER: ' + this.countdownTime,
            {font: '24px Arial Bold', fill: '#FF0000'});
        this.hand = this.physics.add.image(50, 500, 'hand').setInteractive();
        // this.hand.setImmovable(true);
        this.physics.add.collider(this.hand, this.layer);
        this.info = this.add.text(10, 10, '',
            {font: '24px Arial Bold', fill: '#000000'});
        this.score = this.add.text(600, 50, '' + this.coinsCaught,
            {font: '24px Arial Bold', fill: '#DAA520'});
    }

    update(time): void {
        this.physics.world.collide(this.hand, this.layer);
        if(Math.abs(this.input.x - this.hand.x) > 0) {
            this.physics.moveTo(this.hand, this.input.x, this.input.y, 2000, 100);
        }
        let diff: number = time - this.lastDropTime;
        if (diff > this.delta) {
            this.lastDropTime = time;
            if (this.delta > 500) {
                this.delta -= 50;
            }
            if (Phaser.Math.Between(0, 9) < 3) { // 1/3 chance of new dropped object being knife
                this.dropKnife();
            } else this.dropCoin();
        }
        this.info.text =
            this.coinsMissed + ` coins missed (max ${this.maxCoinsMissed})   ` +
            this.knivesCaught + ` knives caught (max ${this.maxKnivesCaught})`;
        this.score.text = 'Coins caught: ' + this.coinsCaught;
    }

    private onClick(object: Phaser.Physics.Arcade.Image): () => void {
        return () => {
            object.disableBody(true);
            object.setVelocity(0, 0);
            if (object.getData('type') == 'coin') {
                this.coinsCaught += 1;
                object.setTint(0x00ff00); // Got coin, click = green
            } else {
                this.knivesCaught += 1;
                object.setTint(0xff0000); // Got knife, click = red
            }
            if (this.knivesCaught >= this.maxKnivesCaught) {
                this.scene.start("ContinueScene", {
                    ending: "YOU CAUGHT TOO MANY KNIVES, GAMER!",
                    score: this.coinsCaught,
                    scoreType: "coin(s)",
                    finishedScene: "CoinScene"
                })
            }
            this.time.delayedCall(100, function (object) {
                object.destroy();
            }, [object], this);
        }
    }

    private onFall(object: Phaser.Physics.Arcade.Image): () => void {
        return () => {
            if (object.getData('type') == 'coin') {
                this.coinsMissed += 1;
                object.setTint(0xff0000); // Missed coin = red
            } else object.setTint(0x00ff00); // Missed knife = green
            if (this.coinsMissed >= this.maxCoinsMissed) {
                this.scene.start("ContinueScene", {
                    ending: "YOU MISSED TOO MANY COINS, GAMER!",
                    score: this.coinsCaught,
                    scoreType: "coin(s)",
                    finishedScene: "CoinScene"
                })
            }
            this.time.delayedCall(100, function (object) {
                object.destroy();
            }, [object], this);
        }
    }

    private dropCoin(): void {
        var coin: Phaser.Physics.Arcade.Image;
        var x = Phaser.Math.Between(25, 775);
        var y = 26;
        coin = this.physics.add.image(x, y, "coin").setData({type: 'coin'});
        coin.setDisplaySize(60, 60);
        coin.setVelocity(0, 200);
        coin.setInteractive();
        this.physics.add.collider(coin, this.hand,
            this.onClick(coin), null, this);
        this.physics.add.collider(coin, this.lava,
            this.onFall(coin), null, this);
    }

    private dropKnife(): void {
        var knife: Phaser.Physics.Arcade.Image;
        var x = Phaser.Math.Between(25, 775);
        var y = 26;
        knife = this.physics.add.image(x, y, "knife").setData({type: 'knife'});
        knife.setDisplaySize(60, 70);
        knife.setVelocity(0, 300);
        knife.setInteractive();
        this.physics.add.collider(knife, this.hand,
            this.onClick(knife), null, this);
        this.physics.add.collider(knife, this.lava,
            this.onFall(knife), null, this);
    }

    private decreaseTime() {
        if (this.countdownTime == 1) {
            this.countdownTimer.remove();
            this.scene.start("ContinueScene", {
                ending: "TIME'S UP, GAMER, Good job!",
                score: this.coinsCaught,
                scoreType: "coin(s)",
                finishedScene: "CoinScene"
            })
        }
        this.countdownTime -= 1;
        this.countdownInfo.setText('TIMER: ' + this.countdownTime.toString());
    }
}
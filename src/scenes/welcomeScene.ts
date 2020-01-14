import "phaser";
export class WelcomeScene extends Phaser.Scene {
    title: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    constructor() {
        super({
            key: "WelcomeScene"
        });
    }

    create(): void {
        var titleText: string = "Sword n Bow";
        this.title = this.add.text(250, 200, titleText,
            {font: '64px Arial Bold', fill: '#800080'});
        var hintText: string = "Click to start";
            this.hint = this.add.text(300, 350, hintText,
                {font: '24px Arial Bold', fill: '#800080'});
        this.input.on('pointerdown', function(/*pointer*/) {
            this.scene.start("FirstLevelScene");
        }, this);
    }
}
import "phaser";

export class ContinueScene extends Phaser.Scene {
    score: number;
    scoreType: string;
    ending: string;
    endingText: Phaser.GameObjects.Text;
    result: Phaser.GameObjects.Text;
    hint: Phaser.GameObjects.Text;
    roomScenes: string[] = ["FirstLevelScene"];

    constructor() {
        super({
            key: "ContinueScene"
        });
    }

    init(params: any): void {
        this.score = params.score;
        this.ending = params.ending;
        this.scoreType = params.scoreType;

        if(params.restartContinueScene) {
            this.roomScenes = ["FirstLevelScene"];
        }

        // Remove Room that player just played
        const sceneIndex = this.roomScenes.indexOf(params.finishedScene);
        if (sceneIndex > -1) {
            this.roomScenes.splice(sceneIndex, 1);
        }
    }

    preload(): void {
        this.load.setBaseURL(
            "https://raw.githubusercontent.com/Mars9934/" +
            "9Rooms/master/src/");
        this.load.image("continueBackground", "assets/continueBackground.jpg");
    }

    create(): void {
        this.endingText = this.add.text(125, 100, this.ending,
            {font: '32px Arial Bold', fill: '#FF0000'});
        var resultText: string = 'You killed ' + this.score + ' ' + this.scoreType + '!';
        this.result = this.add.text(125, 350, resultText,
            {font: '48px Arial Bold', fill: '#00008B'});

        if (this.roomScenes.length == 0) {
            var hintText: string = 'Click to restart';
            this.hint = this.add.text(125, 500, hintText,
                {font: '28px Arial Bold', fill: '#FFDF00'});
            this.input.on('pointerdown', () => {
                this.scene.sendToBack('ContinueScene');
                this.scene.restart({
                    restartContinueScene: true
                });
                this.scene.start('WelcomeScene');
            }, this);
        } else {
            var hintText: string = 'Click to continue to next Room';
            this.hint = this.add.text(125, 400, hintText,
                {font: '28px Arial Bold', fill: '#FFDF00'});
            this.input.on('pointerdown', () => {
                this.scene.sendToBack('ContinueScene');
                // Find next random Room for player
                const nextScene: string = this.roomScenes[Phaser.Math.Between(0, this.roomScenes.length)];
                this.scene.start(nextScene);
            }, this);
        }
    }
}
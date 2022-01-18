class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    init() {
        const image = new Image();
        image.onload = () => {
            this.ctx.drawImage(image,0,0);
        }
        image.src = "/images/maps/DemoLower.png";

        const mc = new Image();
        mconsole.onload = () => {
            
        }


    }
}
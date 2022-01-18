class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    init() {
        // draw background
        const image = new Image();
        image.onload = () => {
            this.ctx.drawImage(image,0,0);
        };
        image.src = "/images/maps/DemoLower.png";

        // place mc
        const mc = new GameObject({
            x: 5,
            y: 6,
            src: "/images/characters/people/hero.png"
        })

        // place customer
        const customer = new GameObject({
            x: 7,
            y: 9,
            src: "/images/characters/people/npc1.png"
        })

        
        // draw objects using method draw in sprite class
        setTimeout(() => {
            customer.sprite.draw(this.ctx);
        }, 600);

        setTimeout(() => {
            mc.sprite.draw(this.ctx);
        }, 100);

        // have game loop started when you click play or smth
        // loading screen
        
    }
}
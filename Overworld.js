class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    startGameLoop() {
        const step = () => {

            // Clears previous frames from the canvas to allow for smooth clean movement
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Establish the camera person
            const cameraPerson = this.map.gameObjects.hero; // reference to camera person

            // update all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction
                });
            })

            // draws lower layer
            this.map.drawLowerImage(this.ctx, cameraPerson);

            //Draw Game Objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            })

            // draws upper layer
            this.map.drawUpperImage(this.ctx, cameraPerson);

            // makes it run abt 60 fps, a new frame loading for each "step"
            requestAnimationFrame(() => {
                step();
            })
        }
        step();
    }

    init() {
        // draw the map and start the game loop
        this.map = new OverworldMap(window.OverworldMaps.DemoRoom);

        this.directionInput = new DirectionInput();
        this.directionInput.init();
        this.directionInput.direction; // returns strings such as "down"

        this.startGameLoop();
    }
}
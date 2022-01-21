class DirectionInput {
    constructor() {
        // see how many and which keys are being held at any given time, provides that niceness and fluidity
        this.heldDirections = [];

        // defines the keys we actually care about
        this.map = {
            "ArrowUp": "up",
            "KeyW": "up",
            "ArrowDown": "down",
            "KeyS": "down",
            "ArrowLeft": "left",
            "KeyA": "left",
            "ArrowRight": "right",
            "KeyD": "right",
        }
    }

    get direction() {
        return this.heldDirections[0];
    }

    // used to check for keys pressed
    init() {
        document.addEventListener("keydown", e => {
            const dir = this.map[e.code];
            // checks the held keys
            if (dir && this.heldDirections.indexOf(dir) === -1) {
                this.heldDirections.unshift(dir);
                console.log(this.heldDirections)
            }
        });
        document.addEventListener("keyup", e=>{
            const dir = this.map[e.code];
            const index = this.heldDirections.indexOf(dir);
            if (index > -1) {
                this.heldDirections.splice(index, 1);
                console.log(this.heldDirections)
            }
        })
    }
}
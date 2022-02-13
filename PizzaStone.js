class PizzaStone extends GameObject{
    constructor(config) {
        super(config);
        this.sprite = new Sprite ({
            gameObject: this,
            src: "/images/characters/pizza-stone.png",
            animations: {
                "used-down" : [ [0,0] ], // pizza is already crafted, no dough
                "unused-down" : [ [1,0] ] // has dough that will be used to craft the pizza
            },
            currentAnimation: "used-down"
        });
        this.storyFlag = config.storyFlag;
        this.pizzas = config.pizzas;

        // doesn't work yet cuz not implemented yet // video 14
        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    { type: "textMessage", text: "You have already used this." }
                ],
                // required: ["TALKED_TO_CHEF_FLOP"],
                // events: [
                //     { type: "addStoryFlag", flag: this.storyFlag },
                //     { type: "textMessage", text: "Approaching the legendary pizza stone..."},
                //     { type: "craftingMenu", pizzas: this.pizzas },
                // ]
            },
            {
                
                events: [
                    // { type: "textMessage", text: "You're not allowed to use this."},
                    { type: "textMessage", text: "Approaching the legendary pizza stone..."},
                    { type: "craftingMenu", pizzas: this.pizzas },
                    { type: "addStoryFlag", flag: this.storyFlag },
                    ]
            }
        ]
    }
    // video 14
    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
        ? "used-down" // if we have the pizza stone, it's used
        : "unused-down" // otherwise if we don't have it, its unused
    }

}
class Hud {
    constructor() {
        this.scoreboards = [];
    }

    update() {
        this.scoreboards.forEach(s => {
            //update me.
        })
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        const {playerState} = window;
        playerState.lineup.forEach(key => { // iterate through lineup array
            const pizza = playerState.pizzas(key);
            const scoreboard = new Combatant({ // class not implemented yet, used in battles
                id: key, //helps us know which scoreboard to update
                ...Pizzas[pizza.pizzaId],
                ...pizza,
            }, null)
            scoreboard.createElement(); // creates individual element for each pizza
            this.scoreboards.push(scoreboard); // keeps reference of all scoreboards in array in constructor
            this.element.appendChild(scoreboard.hudElement);
        })
        this.update();
    }

    init(container) {
        this.createElement();
        container.appendChild(this.hudElement);
        container.appendChild(this.pizzaElement);
        this.update();
    }
}
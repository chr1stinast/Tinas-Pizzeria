class PauseMenu {
    constructor({onComplete}) {
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        
        // Case 1: Show the first page of options
        if (pageKey === "root") {
            // doesn't work yet -- uses code from battle (i think)
            const lineupPizzas = playerState.lineup.map(id => {
                const {pizzaId} = playerState.pizzas[id];
                const base = Pizzas[pizzaId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(id) )
                    }
                }
            })
            return [
                //All of our pizzas (dynamic)
                ...lineupPizzas,
                {
                    label: "Save",
                    description: "Save your progress",
                    handler: () => {
                        this.save();
                    }
                },
                {
                    label: "Close",
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        }

        // Case 2: Show the options for just one pizza (by id)
        const unequipped = Object.keys(playerState.pizzas).filter(id => {
            return playerState.lineup.indexOf(id) === -1; // not in array
        }).map(id => {
            const {pizzaId} = playerState.pizzas[id];
            const base = Pizzas[pizzaId];
            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id);
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        })
        return [
            // Swap for any unequipped pizza...
            ...unequipped,
            {
                label: "Move to front",
                description: "Move this pizza to the front of the list",
                handler: () => {
                    playerState.moveToFront(pageKey);
                    this.keyboardMenu.setOptions( this.getOptions("root"));
                }
            },
            {
                label: "Back",
                description: "Back to root menu",
                handler: () => {
                    this.keyboardMenu.setOptions( this.getOptions("root") );
                }
            }
        ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
    }

    save () {
        //
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));
        
        container.appendChild(this.element);

        //escape key closes pause menu
        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }
}
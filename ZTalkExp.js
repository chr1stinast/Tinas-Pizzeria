class ZTalkExp {
    constructor({optionA, optionB, optionC, onComplete}) {
        this.onComplete = onComplete;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
    }

    getOptions() {
        
            return [
                //All of our pizzas (dynamic)
                //...lineupPizzas,
                {
                    label: this.optionA,
                    description: "Save your progress",
                    handler: () => {
                        // this.menuSubmit(action);
                        this.close();
                    }
                },
                {
                    label: this.optionB,
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                },
                {
                    label: this.optionC,
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Options");
        // this.element.innerHTML = (`
        //     <h2>Choose a response!</h2>
        // `)
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

        // //escape key closes pause menu
        // utils.wait(200);
        // this.esc = new KeyPressListener("Escape", () => {
        //     this.close();
        // })
    }
}
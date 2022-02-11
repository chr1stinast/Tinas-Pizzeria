class ZTalkExp {
    constructor({onComplete, optionA, optionB, optionC}) {
        this.onComplete = onComplete;
    }

    getOptions() {
        
            return [
                //All of our pizzas (dynamic)
                //...lineupPizzas,
                {
                    label: optionA,
                    description: "Save your progress",
                    handler: () => {
                        this.menuSubmit(action);
                        this.close();
                    }
                },
                {
                    label: optionB,
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                },
                {
                    label: optionC,
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `)
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
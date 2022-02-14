class ZTalkExp {
    constructor({optionA, optionB, optionC, description, onComplete}) {
        this.onComplete = onComplete;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.description = description;
    }

    getOptions() {
        
            return [
                //All of our pizzas (dynamic)
                //...lineupPizzas,
                {
                    label: this.optionA, 
                    description: this.description,
                    handler: () => {
                        // this.menuSubmit(action);
                        this.close(1);
                    }
                },
                {
                    label: this.optionB,
                    description: this.description,
                    handler: () => {
                        this.close(2);
                    }
                },
                {
                    label: this.optionC,
                    description: this.description,
                    handler: () => {
                        this.close(3);
                    }
                }
            ]
        
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Choose a response!</h2>
        `)
    }

    // close(actionId) {
    //     this.esc?.unbind();
    //     this.keyboardMenu.end();
    //     this.element.remove();
    //     this.onComplete(actionId);
    // }
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
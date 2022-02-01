class SceneTransition {
    constructor() {
        this.element = null;
    }
    createElement() {
        this.element = document.createElement("div");
        this.element = classList.add("SceneTransition");
    }

    fadeOut() {
        this.element.classList.add("fade-out")
        this.element.addEvenetListener("animationend", () => {
            this.element.remove();
        }, { once: true })
    }


    init(container, callback) {
        this.createElement();
        container.appendChild(this.element);

        this.element.addEvenetListener("animationend", () => {
            callback();
        }, { once: true })
    }
}
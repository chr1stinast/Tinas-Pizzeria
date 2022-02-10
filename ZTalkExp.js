class ZTalkExp {
    constructor() {
        let btn = document.createElement("button");
        btn.innerHTML = "Save";
        btn.onclick = function () {
        alert("Button is clicked");
        };
    document.body.appendChild(btn);

    }

    getOptions() {
        return[
            {
                label: "Hi??",
                description: "Start a new pizza adventure!",
                handler: () => {
                    this.close();
                    resolve();
                }
            }
        ]
    }
    
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML = (`
            <img class="TitleScreen_logo" src="/images/logo.png" alt="Papas-Games-Remake" />
        `)
    }
    
    close() {
        this.keyboardMenu.end();
        this.element.remove();
    }

    init(container) {
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);
            this.keyboardMenu = new KeyboardMenu();
            this.keyboardMenu.init(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve));
        })
    }
}
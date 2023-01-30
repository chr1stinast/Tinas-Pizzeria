class RevealingText{
    constructor(config) {
        this.element = config.element;
        this.text = config.text;
        this.audioloc = config.audioloc || "asr";
        this.speed = config.speed || 70;

        this.timeout = null;
        this.isDone = false;
    }

    revealOneCharacter(list) {
        const next = list.splice(0,1) [0];
        next.span.classList.add("revealed");

        if (list.length > 0) {
            this.timeout = setTimeout(() => {
                // this.mySound.play();
                if (next != " " && next != "!" && next != "?" && next != "." && next != ",") {
                    this.play();
                }
                this.revealOneCharacter(list)
            }, next.delayAfter)
        } else {
            this.isDone = true;
        }
    }

    play() {
        var audio = new Audio("Sounds/snd_txt"+this.audioloc+".wav");
        audio.play();
    }

    warpToDone() {
        clearTimeout(this.timeout);
        this.isDone = true;
        this.element.querySelectorAll("span").forEach(s => {
            s.classList.add("revealed");
        })
    }

    init() {
        let characters = [];
        this.text.split("").forEach(character => {

            // create each span
            let span = document.createElement("span");
            span.textContent = character;
            this.element.appendChild(span);

            characters.push({
                span,
                delayAfter: character === " " ? 0 : this.speed
            })
        })

        this.revealOneCharacter(characters);
    }
}
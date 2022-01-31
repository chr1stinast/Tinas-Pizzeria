class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
 }

  startGameLoop() {
    const step = () => {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      //Update all objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })

      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
 }

 bindActionInput() {
  new KeyPressListener("Enter", () => {
    //Is there a person here to talk to?
    this.map.checkForActionCutscene()
  })
}

bindHeroPositionCheck() {
  document.addEventListener("PersonWalkingComplete", e => {
    if (e.detail.whoId === "hero") {
      //Hero's position has changed
      // note: using console.log on these kinds of methods can be incredibly helpful for bug fixing etc
      this.map.checkForFootstepCutscene()
    }
  })
}

startMap(mapConfig) {
 this.map = new OverworldMap(mapConfig);
 this.map.overworld = this;
 this.map.mountObjects();
}

init() {
 this.hud = new Hud();
 this.hud.init(document.querySelector(".game-container"));

 this.startMap(window.OverworldMaps.DemoRoom);


 this.bindActionInput();
 this.bindHeroPositionCheck();

 this.directionInput = new DirectionInput();
 this.directionInput.init();

 this.startGameLoop();


 this.map.startCutscene([
   
   { type: "textMessage", text: "This is the very first message!"}
   
 ])

    const order1 = new Order("Pepperoni", 5, 60, 1);
    order1.displayInfo();

    const order2 = new Order("Pepperoni", 6, 60, 2);
    order2.displayInfo();
    

    this.startGameLoop();
  }
}
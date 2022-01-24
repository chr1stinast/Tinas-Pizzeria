class OverworldMap {
  constructor(config) {
    this.gameObjects = config.gameObjects;
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.values(this.gameObjects).forEach(o => {

      //TODO: determine if this object should actually mount
      o.mount(this);

    })
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  // can be used to set up different maps
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/kitchen.png",
    upperSrc: "/images/maps/upperKitchen.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npc1: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png"
      })
    },
    walls: {
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    }
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        src: "/images/characters/people/hero.png"
      })
    }
    // cutsceneSpaces: { video 15
    //   [utils.asGridCoord(29,9)]: [
    //     {
    //       events: [
    //         {
    //           type: "changeMap",
    //           map: "Kitchen",
    //           x: utils.withGrid(5),
    //           y: utils.withGrid(6),
    //           direction: "up"
    //         }
    //       ]
    //     }
    //   ]
    // }
  }
}
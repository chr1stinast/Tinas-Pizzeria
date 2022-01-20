class OverworldMap {
  constructor(config) {
    this.gameObjects = config.gameObjects;

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
  }

  drawMap(ctx) {
    ctx.drawImage(this.lowerImage, 0, 0)
  }
}

// list of maps 
window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    gameObjects: {
      hero: new GameObject({
        x: 5,
        y: 6,
        src: "/images/characters/people/hero.png"
      }),
      npc1: new GameObject({
        x: 7,
        y: 9,
        src: "/images/characters/people/npc1.png"
      })
    }
  }
}
class GameObject {
    constructor(config) {
      this.id = null;
      this.x = config.x || 0;
      this.y = config.y || 0;
      this.direction = config.direction || "down";
      this.sprite = new Sprite({
        gameObject: this,
        src: config.src || "images/characters/people/Tina.png"
      });

      this.behaviorLoop = config.behaviorLoop || [];
      this.behaviorLoopIndex = 0;

      this.talking = config.talking || [];
    }

  mount(map) { // makes object count as a wall to avoid collisions
    console.log("mounting!")
    this.isMounted = true;
    map.addWall(this.x, this.y);

    // if we have a behavior, kick off after a short delay
    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10)
  }

  update() {
  }

  async doBehaviorEvent(map) { // async key word allows await

    // dont do anything if there's a cutscene playing or if it doesn't have a behavior
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
      // by placing a return here, it stops the method if any of the above conditions (which we don't want) are true
      return;
    }

    // setting up our event with relevant info
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id

    // create an event instance out of our next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init(); // gonna tell the code that this bit is gonna wait a little to resolve
    //nothing is gonna run until previous line is finished

    // setting the next event to fire
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }

    // do it again!
    this.doBehaviorEvent(map);

  }
}
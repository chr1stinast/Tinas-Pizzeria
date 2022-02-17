class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
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
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;
    
    // start a loop of async events
    // await each one
    for(let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    // reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  walkToDoor(doorx, doory) {
    // not perfect, doesn't account for walls in the way
    var i = 0;
    var xx = hero.x;
    var yy = hero.y;
    var directions = [];
   while (doorx != xx) {
      if (doorx > xx) {
        directions[i] = "right"
        xx += utils.withGrid(1);
      } else {
        directions[i] = "left"
        xx -= utils.withGrid(1);
      }
      if (this.walls[`${xx}, ${yy}`]) {
        if (this.walls[`${xx}, ${yy + utils.withGrid(1)}`]){
          directions[i] = "up"
        } else {
          directions[i] = "down"
        }
      }
      i++;
    }
    while (doory != yy) {
      if (doory > yy) {
        directions[i] = "down"
        yy += utils.withGrid(1);
      } else {
        directions[i] = "up"
        yy -= utils.withGrid(1);
      }
      i++;
    }
    directions.forEach(directionn => {
      this.startBehavior(state, {
        type: "walk",
        direction: directionn
      })
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
    lowerSrc: "/images/maps/DiningLower.png",
    upperSrc: "/images/maps/DiningUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [ // makes behavior loops for characters
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "up", time: 800 },
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "up", time: 300 }
        ],
        talking: [
          {
            required: ["MARIA1", "MARIA2", "MARIA3"],
            events: [
              { type: "textMessage", text: "you know, I think you have an unhealthy obsession with Maria.", faceHero: "npcA"},
            ]
          },
          {
            required: ["MARIA3"],
            events: [
              { type: "textMessage", text: "...You know, you're really getting on my nerves.", faceHero: "npcA"},
            ]
          },
          {
            required: ["YAY"],
            events: [
              { type: "textMessage", text: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", faceHero: "npcA"},
            ]
          },
          {
            required: ["BOO"],
            events: [
              { type: "textMessage", text: "oh.. well im sorry i put you through that.", faceHero: "npcA"},
            ]
          },
          {
            required: ["MARIA2"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "WELL?? HOW DID IT GO?", faceHero: "npcA"},
              { type: "talk", optionA: "That was absolutely horrid. I broke his heart", optionB: "I accepted!! We're together now!", optionC: "maria's a flop", 
              description: "Maria wants to know how the confession went!", ans1: "oh.. well im sorry i put you through that.", ans2: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", ans3: "...You know, you're really getting on my nerves.",
              flag1: "BOO", flag2: "YAY", flag3: "MARIA3"},
            ]
          },
          {
            required: ["SUCCESS"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "WELL?? HOW DID IT GO?", faceHero: "npcA"},
              { type: "talk", optionA: "That was absolutely horrid. I broke his heart", optionB: "I accepted!! We're together now!", optionC: "maria's a flop", 
              description: "Maria wants to know how the confession went!", ans1: "oh.. well im sorry i put you through that.", ans2: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", ans3: "...You know, you're really getting on my nerves.",
              flag1: "BOO", flag2: "YAY", flag3: "MARIA3"},
            ]
          },
          {
            required: ["FAIL"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "WELL?? HOW DID IT GO?", faceHero: "npcA"},
              { type: "talk", optionA: "That was absolutely horrid. I broke his heart", optionB: "I accepted!! We're together now!", optionC: "maria's a flop", 
              description: "Maria wants to know how the confession went!", ans1: "oh.. well im sorry i put you through that.", ans2: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", ans3: "...You know, you're really getting on my nerves.",
              flag1: "BOO", flag2: "YAY", flag3: "MARIA3"},
            ]
          },
          {
            required: ["OK"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "well?? what are you waiting for?? go talk to him!", faceHero: "npcA"}
            ]
          },
          {
            required: ["MARIA1"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "well?? what are you waiting for?? go talk to him!", faceHero: "npcA"}
            ]
          },
          {
            // maybe they say something in one point of the game but say something else after another point in the game
            // wonderful tool to insert easter eggs
            events: [
              { type: "textMessage", text: "Have you talked to Mika yet?", faceHero: "npcA" },
              { type: "textMessage", text: "He's waiting for you outside"},
              { type: "talk", optionA: "Only for you mar mar", optionB: "ew what the heck no", optionC: "maria's a flop", 
                description: "Go talk to Mika?", ans1: "Wonderful! Well I'll be here waiting! Tell me how it goes!", ans2: "Well that's rude. But just don't let him hear you say that.", ans3: "Um... ok?",
                flag1: "OK", flag2: "OK", flag3: "MARIA1"}, // work from here//TODO: just offer scenario instead of options
                // { type: "ask", target: 1, answer: "yayy"},
              // { type: "ask", target: 2, answer: "k."},
              // { type: "ask", target: 3, answer: "ok?"},
              // { type: "ask"},
              // i can call walk to door through this!
              { who: "hero", type: "walk",  direction: "up" },
            ]
          } // set off the next event??
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/Matt.png",
        // behaviorLoop: [
        //   { type: "walk", diretion: "left"},
        //   { type: "stand", direction: "up", time: 800 },
        //   { type: "walk", diretion: "right"},
        //   { type: "walk", diretion: "down"},
        // ]  /
      }),
      // pizzaStone: new PizzaStone ({
      //   x: utils.withGrid(4),
      //   y: utils.withGrid(7),
      //   storyFlag: "USED_PIZZA_STONE"
      // })
    },
    walls: {
      // add walls along outside of map--figure out more optimal way to create walls
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,

      [utils.asGridCoord(13,4)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(13,6)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(13,9)] : true,
      [utils.asGridCoord(13,10)] : true,
      [utils.asGridCoord(13,11)] : true,
      [utils.asGridCoord(13,12)] : true,
      [utils.asGridCoord(12,12)] : true,
      [utils.asGridCoord(10,12)] : true,
      [utils.asGridCoord(9,12)] : true,
      [utils.asGridCoord(8,12)] : true,
      [utils.asGridCoord(7,12)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(10,5)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(12,5)] : true,
      [utils.asGridCoord(2,7)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,7)] : true,
      [utils.asGridCoord(3,7)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
      [utils.asGridCoord(9,7)] : true,








      //[utils.asGridCoord(5,10)] : true,
      [utils.asGridCoord(5,13)] : true,
      [utils.asGridCoord(4,12)] : true,
      [utils.asGridCoord(3,12)] : true,
      [utils.asGridCoord(2,12)] : true,
      [utils.asGridCoord(1,12)] : true,
      [utils.asGridCoord(0,12)] : true,

      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,11)] : true,
      [utils.asGridCoord(0,10)] : true,
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(8,2)] : true,
      [utils.asGridCoord(8,1)] : true,
      [utils.asGridCoord(7,0)] : true,
      [utils.asGridCoord(6,1)] : true,
      [utils.asGridCoord(6,2)] : true,
      [utils.asGridCoord(5,12)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(6,4)] : true,
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(3,5)] : true,
      [utils.asGridCoord(4,5)] : true,







    }, //
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          // bug: hero can keep walking even after event is triggered
          events: [
            { type: "changeMap", map: "Kitchen" }
            // { who: "npcB", type: "walk",  direction: "left" },
            // { who: "npcB", type: "stand",  direction: "up", time: 500 },
            // { type: "textMessage", text:"You can't be in there!"},
            // { who: "npcB", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "down" },
            // { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            { type: "changeMap", map: "Street" }
          ]
        }
      ],
      // [utils.asGridCoord(5,7)]:[
      //   {
      //     events: [
      //       { who: "hero", type: "walk", direction: "left" }
      //     ]
      //   }
      // ]
    }
    
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/NewKitchen.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcC: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc4.png",
        
        talking: [
          {
            required: ["TALKED_TO_CHEF_FLOP"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "KEEP MAKING PIZZAS!", faceHero: "npcC"},
              { who: "npcC", type: "stand",  direction: "up"}
            ]
          },
          {
            // maybe they say something in one point of the game but say something else after another point in the game
            // wonderful tool to insert easter eggs
            events: [
              
              { type: "textMessage", text: "CHEF FLOP JUST GOT FIRED!", faceHero: "npcC"},
              { type: "textMessage", text: "We need somebody to take over...", faceHero: "npcC"},
              { type: "textMessage", text: "YOU'RE IN CHARGE!", faceHero: "npcC"},
              { type: "textMessage", text: "What?! But I'm not qualified!", faceHero: "npcC"},
              { type: "textMessage", text: "IT DOESN'T MATTER! START COOKING PIZZAS!", faceHero: "npcC"},
              { who: "npcC", type: "walk",  direction: "up"},
              {type: "addStoryFlag", flag: "TALKED_TO_CHEF_FLOP"}
            ]
          }
        ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
      }),
      
    },
    walls: {
      // add walls along outside of map--figure out more optimal way to create walls
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,

      [utils.asGridCoord(11,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      //[utils.asGridCoord(5,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(0,10)] : true,

      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(8,2)] : true,
      [utils.asGridCoord(8,1)] : true,
      [utils.asGridCoord(7,0)] : true,
      [utils.asGridCoord(6,1)] : true,
      [utils.asGridCoord(6,2)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "DemoRoom" }
          ]
        }
      ],
    },
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(10),
        src: "/images/characters/people/Tina.png"
      }),
      npcB: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(10),
        src: "/images/characters/people/Mika.png",
        talking: [
          {
            required: ["MARIA2"],
            events: [
              { type: "textMessage", text: "...", faceHero: "npcB"},
              { type: "textMessage", text: "If you're not going to take me seriously just forget I said anything."}
            ]
          },
          {
            required: ["SUCCESS"],
            events: [
              { type: "textMessage", text: "I love you! I'm in love! we should get married!", faceHero: "npcB"},
              { type: "textMessage", text: "You are the only one for me. Every night I lay awake just thinking of how much I love you."},
              { type: "textMessage", text: "Please... never leave me... I love you so dearly."}
            ]
          },
          {
            required: ["FAIL"],
            events: [
              { type: "textMessage", text: "well?? have you changed your mind??", faceHero: "npcB"},
              { type: "talk", optionA: "no", optionB: "yes", optionC: "maria's a flop", description: "Mika is confessing to you!... again.",
              ans1: "then leave me alone.", flag1: "FAIL", ans2: "OMGOMGOMGOGMG YAYYAYAY.", flag2: "SUCCESS", ans3: "...I hate you. I hope you know that.", flag3: "MARIA"}
            ]
          },
          {
            events: [
              { type: "textMessage", text: "You made it!", faceHero:"npcB" }, //faceHEro refers to who the hero should face
              { type: "textMessage", text: "I'm so happy you're here, now I can finally confess!" },
              { type: "textMessage", text: "I... I... I love you..." },
              { type: "talk", optionA: "ha ha! absolutely not!", optionB: "I... I love you too!!!", optionC: "maria's a flop", description: "Mika is confessing to you!",
              ans1: "oh...", flag1: "FAIL", ans2: "OMGOMGOMGOGMG YAY.", flag2: "SUCCESS", ans3: "what?? what does that mean... I love you...", flag3: "MARIA2"}
              // { who: "hero", type: "walk",  direction: "left" },
              // { who: "hero", type: "walk",  direction: "up" },
              // walkToDoor(5*16, 9*16),
              // { type: "changeMap", map: "DemoRoom" },
              // {type: "addStoryFlag", flag: "TALKED_TO_MIKA"}
              // walkToDoor(5*16, 9*16)
            ]
          }
        ]
      })
    },
    walls: {
      // add walls along outside of map--figure out more optimal way to create walls
      [utils.asGridCoord(5,8)] : true,
      [utils.asGridCoord(4,8)] : true,
      [utils.asGridCoord(4,7)] : true,
      [utils.asGridCoord(6,7)] : true,
      [utils.asGridCoord(6,8)] : true,
      [utils.asGridCoord(6,9)] : true,
      [utils.asGridCoord(8,9)] : true,
      [utils.asGridCoord(4,9)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(3,11)] : true,
      [utils.asGridCoord(3,12)] : true,
      [utils.asGridCoord(3,13)] : true,
      [utils.asGridCoord(3,14)] : true,
      [utils.asGridCoord(3,15)] : true,
      [utils.asGridCoord(3,16)] : true,
      [utils.asGridCoord(3,17)] : true,
      [utils.asGridCoord(3,18)] : true,
      [utils.asGridCoord(4,19)] : true,
      [utils.asGridCoord(5,19)] : true,
      [utils.asGridCoord(6,19)] : true,
      [utils.asGridCoord(7,19)] : true,
      [utils.asGridCoord(8,19)] : true,
      [utils.asGridCoord(9,19)] : true,
      [utils.asGridCoord(10,19)] : true,
      [utils.asGridCoord(11,19)] : true,
      [utils.asGridCoord(12,19)] : true,
      [utils.asGridCoord(13,19)] : true,
      [utils.asGridCoord(14,19)] : true,
      [utils.asGridCoord(15,19)] : true,
      [utils.asGridCoord(16,19)] : true,
      [utils.asGridCoord(17,19)] : true,
      [utils.asGridCoord(18,19)] : true,
      [utils.asGridCoord(19,19)] : true,
      [utils.asGridCoord(20,19)] : true,
      [utils.asGridCoord(21,19)] : true,
      [utils.asGridCoord(22,19)] : true,
      [utils.asGridCoord(23,19)] : true,
      [utils.asGridCoord(24,19)] : true,
      [utils.asGridCoord(25,19)] : true,
      [utils.asGridCoord(26,19)] : true,
      [utils.asGridCoord(27,19)] : true,
      [utils.asGridCoord(28,19)] : true,
      [utils.asGridCoord(29,19)] : true,
      [utils.asGridCoord(30,19)] : true,
      [utils.asGridCoord(31,19)] : true,
      [utils.asGridCoord(32,19)] : true,
      [utils.asGridCoord(33,19)] : true,
      [utils.asGridCoord(34,18)] : true,
      [utils.asGridCoord(34,17)] : true,
      [utils.asGridCoord(34,16)] : true,
      [utils.asGridCoord(34,15)] : true,
      [utils.asGridCoord(34,14)] : true,
      [utils.asGridCoord(34,13)] : true,
      [utils.asGridCoord(34,12)] : true,
      [utils.asGridCoord(34,11)] : true,
      [utils.asGridCoord(34,10)] : true,
      [utils.asGridCoord(33,9)] : true,
      [utils.asGridCoord(32,9)] : true,
      [utils.asGridCoord(31,9)] : true,
      [utils.asGridCoord(30,9)] : true,
      [utils.asGridCoord(28,9)] : true,
      [utils.asGridCoord(28,8)] : true,
      [utils.asGridCoord(28,9)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      

    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          // bug: hero can keep walking even after event is triggered
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(5,9)]: [
        {
          events: [
            { type: "changeMap", map: "DemoRoom" }
          ]
        }
      ]
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
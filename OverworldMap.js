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
      const relevantScenario = match.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
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
            required: ["APOLOGIZE"],
            events: [
              { type: "textMessage", text: "I have to go apologize.", audioloc: "1"},
            ]
          },
          {
            required: ["DANGER"],
            events: [
              { type: "textMessage", text: "No time to chat, I have to go check on Chef Flop number 75!!", audioloc: "1"}
            ]
          },
          {
            required: ["MARIA0", "MARIA1", "MARIA2", "MARIA3", "MARIA4"],
            events: [
              { type: "textMessage", text: "you know, I think you have an unhealthy obsession with Maria.", audioloc: "sans", faceHero: "npcA"},
            ]
          },
          {
            required: ["MARIA3"],
            events: [
              { type: "textMessage", text: "...You know, you're really getting on my nerves.", audioloc: "sans", faceHero: "npcA"},
            ]
          },
          {
            required: ["YAY"],
            events: [
              { type: "textMessage", text: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", audioloc: "sans", faceHero: "npcA"},
            ]
          },
          {
            required: ["BOO"],
            events: [
              { type: "textMessage", text: "oh.. well im sorry i put you through that.", audioloc: "sans", faceHero: "npcA"},
            ]
          },
          {
            required: ["MARIA2"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "WELL?? HOW DID IT GO?", faceHero: "npcA"},
              { type: "talk", optionA: "That was absolutely horrid. I broke his heart", optionB: "I accepted!! We're together now!", optionC: "maria's a flop", 
              description: "Maria wants to know how the confession went!", ans1: "oh.. well im sorry i put you through that.", ans2: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", ans3: "...You know, you're really getting on my nerves.",
              flag1: "BOO", flag2: "YAY", flag3: "MARIA3", audioloc: "sans"},
            ]
          },
          {
            required: ["SUCCESS"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "WELL?? HOW DID IT GO?", faceHero: "npcA"},
              { type: "talk", optionA: "That was absolutely horrid. I broke his heart", optionB: "I accepted!! We're together now!", optionC: "maria's a flop", 
              description: "Maria wants to know how the confession went!", ans1: "oh.. well im sorry i put you through that.", ans2: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", ans3: "...You know, you're really getting on my nerves.",
              flag1: "BOO", flag2: "YAY", flag3: "MARIA3", audioloc: "sans"},
            ]
          },
          {
            required: ["FAIL"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "WELL?? HOW DID IT GO?", faceHero: "npcA"},
              { type: "talk", optionA: "That was absolutely horrid. I broke his heart", optionB: "I accepted!! We're together now!", optionC: "maria's a flop", 
              description: "Maria wants to know how the confession went!", ans1: "oh.. well im sorry i put you through that.", ans2: "YAY. WHOS THE ULTIMATE CUPID NOW HUH??? ITS ME. ITS ME. ITS ME.", ans3: "...You know, you're really getting on my nerves.",
              flag1: "BOO", flag2: "YAY", flag3: "MARIA3", audioloc: "sans"}, //
            ]
          },
          {
            required: ["OK"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "well?? what are you waiting for?? go talk to him!", audioloc: "sans", faceHero: "npcA"}
            ]
          },
          {
            required: ["MARIA1"],
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "well?? what are you waiting for?? go talk to him!", audioloc: "sans", faceHero: "npcA"}
            ]
          },
          {
            // maybe they say something in one point of the game but say something else after another point in the game
            // wonderful tool to insert easter eggs
            events: [
              { type: "textMessage", text: "Have you talked to Mika yet?", audioloc: "sans", faceHero: "npcA" },
              { type: "textMessage", text: "He's waiting for you outside", audioloc: "sans"},
              { type: "talk", optionA: "Only for you mar mar", optionB: "ew what the heck no", optionC: "maria's a flop", 
                description: "Go talk to Mika?", ans1: "Wonderful! Well I'll be here waiting! Tell me how it goes!", ans2: "Well that's rude. But just don't let him hear you say that.", ans3: "Um... ok?",
                flag1: "OK", flag2: "OK", flag3: "MARIA1", audioloc: "sans"}, // work from here//TODO: just offer scenario instead of options
                // { type: "ask", target: 1, answer: "yayy"},
              // { type: "ask", target: 2, answer: "k."},
              // { type: "ask", target: 3, answer: "ok?"},
              // { type: "ask"},
              // i can call walk to door through this!
              { who: "hero", type: "walk",  direction: "down" },
            ]
          } // set off the next event??
        ]
      }),
      hungryMate: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(12),
        src: "/images/characters/people/npc1.png",
        // behaviorLoop: [ // makes behavior loops for characters
        //   { type: "stand", direction: "left", time: 800 },
        //   { type: "stand", direction: "up", time: 800 },
        //   { type: "stand", direction: "right", time: 1200 },
        //   { type: "stand", direction: "up", time: 300 }
        // ],
        talking: [
          {
            required: ["SATISFIED"],
            events: [
              { type: "textMessage", text: "you have satisfied me mortal. And for that I thank you.", audioloc: "sans2", faceHero: "hungryMate" },
              { who: "hungryMate", type: "walk",  direction: "down" },
              { who: "hungryMate", type: "walk",  direction: "down" },
              { who: "hungryMate", type: "walk",  direction: "down" },
              { who: "hungryMate", type: "walk",  direction: "down" },
            ]
          },
          {
            required: ["HUNGRYY", "USED_PIZZA_STONE"],
            events: [
              { type: "textMessage", text: "...", audioloc: "sans2", faceHero: "hungryMate" },
              { type: "textMessage", text: "........", audioloc: "sans2"},
              { type: "textMessage", text: "............................", audioloc: "sans2"},
              { type: "textMessage", text: "Excellent.", audioloc: "sans2"},
              { type: "textMessage", text: "Absolutely exquisite.", audioloc: "sans2"},
              // enter some walking
              { type: "textMessage", text: "You are hereby forgiven for your simply awful customer service.", audioloc: "sans2"},
              { type: "textMessage", text: "You have satisfied me, mortal.", audioloc: "sans2"},
              { type: "textMessage", text: "I can only hope you will keep this excellent cooking up.", audioloc: "sans2"},
              { type: "removeStoryFlag", flag: "HUNGRYY"},
              { type: "removeStoryFlag", flag: "USED_PIZZA_STONE"},
              { type: "addStoryFlag", flag: "SATISFIED"}
            ]
          },
          {
            required: ["HUNGRYY"],
            events: [
              { type: "textMessage", text: "WHAT ARE YOU WAITING FOR? MAKE ME ANOTHER PIZZA.", audioloc: "sans2", faceHero: "hungryMate" }
            ]
          },
          {
            required: ["APOLOGIZE"],
            events: [
              { type: "textMessage", text: "DEAR CUSTOMER, WAIT.", audioloc: "1", faceHero: "hungryMate"},
              { type: "textMessage", text: "I'M SORRY FOR WHAT I SAID. PLEASE, ALLOW ME TO SERVE YOU FOOD.", audioloc: "1"},
              { type: "textMessage", text: "CHEF NUMBER 75 HAS WORKED SO HARD ON THIS RESTAURANT, HARDER THAN ANYONE I KNOW", audioloc: "1"},
              { type: "textMessage", text: "PLEASE DON'T LET IT ALL GO TO WASTE BECAUSE OF ME.", audioloc: "1"},
              { type: "textMessage", text: "PLEASE... JUST GIVE HER ONE MORE CHANCE...", audioloc: "1"},
              { type: "textMessage", text: "GIVE *US* ONE MORE CHANCE...", audioloc: "1"},
              { type: "textMessage", text: "...", audioloc: "sans2"},
              { type: "textMessage", text: "See I'm not normally the forgiving type, but I am hungry.", audioloc: "sans2"},
              { type: "textMessage", text: "So let's see if all the hype is really worth it. serve me a pizza.", audioloc: "sans2"},
              { type: "addStoryFlag", flag: "FOOD"},
              { type: "removeStoryFlag", flag: "END"},
              { type: "removeStoryFlag", flag: "APOLOGIZE"}
            ]
          },
          {
            required: ["DANGER"],
            events: [
              { type: "textMessage", text: "No time to chat, I have to go check on Chef Flop number 75!!", audioloc: "1"}
            ]
          },
          {
            required: ["END"],
            events: [
              { type: "textMessage", text: "Why are you still here? Haven't I made it clear you're not welcome here?", audioloc: "1", faceHero: "hungryMate" },
              { type: "textMessage", text: "I was just on my way out darling", audioloc: "sans2" },
              //{ who: "hungryMate", type: "walk",  direction: "down"},
              // { who: "hungryMate", type: "walk",  direction: "down"},
              { type: "textMessage", text: "say, won't you be a dear and check up on that little friend of yours?", audioloc: "sans2" },
              { type: "textMessage", text: "what was her name again...", audioloc: "sans2" },
              { type: "textMessage", text: "flop number 75, was it?", audioloc: "sans2" },
              { type: "textMessage", text: "well, her name sure befits her now.", audioloc: "sans2" },
              { type: "textMessage", text: "BAHAHAHAHAAHA", audioloc: "sans2" },
              { type: "textMessage", text: "what did you do?? D:<", audioloc: "1" },
              { type: "textMessage", text: "why, why don't you go and see for yourself?", audioloc: "sans2" },
              { type: "addStoryFlag", flag: "HUNGRY_SERVED"},
              { type: "addStoryFlag", flag: "DANGER"}
            ]
          },
          {
            required: ["FOOD"],
            events: [
              { type: "textMessage", text: "...", audioloc: "sans2", faceHero: "hungryMate" },
              { type: "textMessage", text: "........", audioloc: "sans2"},
              { type: "textMessage", text: "............................", audioloc: "sans2"},
              { type: "textMessage", text: "Why that.", audioloc: "sans2"},
              { type: "textMessage", text: "Was.", audioloc: "sans2"},
              { type: "textMessage", text: "DELICIOUS!!!!", audioloc: "sans2"},
              { type: "textMessage", text: "MAKE ME ANOTHER ONE, RIGHT NOW.", audioloc: "sans2"},
              { type: "addStoryFlag", flag: "HUNGRY_SERVED"},
              { type: "addStoryFlag", flag: "HUNGRYY"},
              { type: "removeStoryFlag", flag: "FOOD"},
              { type: "removeStoryFlag", flag: "USED_PIZZA_STONE"}
            ]
          },
          {
            required: ["MARIA4"],
            events: [
              { type: "textMessage", text: "...", audioloc: "sans2", faceHero: "hungryMate" },
              { type: "textMessage", text: "........", audioloc: "sans2"},
              { type: "textMessage", text: "............................", audioloc: "sans2"},
              { type: "textMessage", text: "Why that.", audioloc: "sans2"},
              { type: "textMessage", text: "Was.", audioloc: "sans2"},
              { type: "textMessage", text: "DELICIOUS!!!!", audioloc: "sans2"},
              { type: "textMessage", text: "MAKE ME ANOTHER ONE, RIGHT NOW.", audioloc: "sans2"},
              { type: "addStoryFlag", flag: "HUNGRY_SERVED"},
              { type: "addStoryFlag", flag: "HUNGRYY"},
              { type: "removeStoryFlag", flag: "FOOD"},
              { type: "removeStoryFlag", flag: "USED_PIZZA_STONE"}
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Excuse me miss, can I help you with anything?", audioloc: "1", faceHero: "hungryMate" },
              { type: "textMessage", text: "I.", audioloc: "sans2" },
              { type: "textMessage", text: "NEED.", audioloc: "sans2" },
              { type: "textMessage", text: "FOOOOOOOOOOOOOOOOD.", audioloc: "sans2" },
              { type: "talk", optionA: "Most certainly ma'am! Why don't you take a sit right here?", optionB: "Of course! And would you like that with a nice side of attitude and a seasoning of disrespect?", optionC: "maria's a flop", 
                description: "The hungry customer wants food!", ans1: "Finally, some decent service around here. Now fetch me a pizza won't you", ans2: "Oh ho ho, you're going to regret saying that.", ans3: "...I'll sit myself down. Just get me my food will you.",
                flag1: "FOOD", flag2: "END", flag3: "MARIA4", audioloc: "sans2"},
                { type: "removeStoryFlag", flag: "USED_PIZZA_STONE"},
            ]
          }
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
        // ] // causes a really weird and severe bug
      })
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
          required: ["HUNGRY_SERVED"],
          events: [
            { type: "changeMap", map: "Kitchen" }
          ]
        },
        {
          events: [
            { type: "textMessage", text: "UH OH, I SHOULD PROBABLY CHECK IN ON HER...", audioloc: "1" },
          ]
        }
      ],
      [utils.asGridCoord(7,5)]: [
        {
          required: ["HUNGRY_NOT_SERVED"],
          events: [
            { type: "textMessage", text: "MY OH MY", audioloc: "sans2" },
            { who: "hungryMate", type: "walk",  direction: "up"},
            { who: "hungryMate", type: "walk",  direction: "up"},
            { who: "hungryMate", type: "walk",  direction: "up"},
            { who: "hungryMate", type: "walk",  direction: "up"},
            { type: "textMessage", text: "NEVER IN MY 23 YEARS OF LIVING HAVE I EVER", audioloc: "sans2" },
            { type: "textMessage", text: "E V E R", audioloc: "sans2" },
            { type: "textMessage", text: "EXPERIENCED SUCH TERRIBLE CUSTOMER EXPERIENCE.", audioloc: "sans2" },
            { who: "hungryMate", type: "stand", direction: "down", time: 500 },
            { who: "hungryMate", type: "stand", direction: "right", time: 500 },
            { who: "hungryMate", type: "stand", direction: "left", time: 500 },
            { who: "hungryMate", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "WHY, THIS IS ABSOLUTELY HORRID.", audioloc: "sans2" },
            { who: "hungryMate", type: "stand", direction: "down", time: 400 },
            { who: "hungryMate", type: "stand", direction: "right", time: 400 },
            { who: "hungryMate", type: "stand", direction: "left", time: 400 },
            { who: "hungryMate", type: "stand", direction: "up", time: 400 },
            { type: "textMessage", text: "NOT A SINGLE CHAIR OFFERED TO ME, NO NOTHING", audioloc: "sans2" },
            { who: "hungryMate", type: "stand", direction: "up", time: 200 },
            { who: "hungryMate", type: "stand", direction: "right", time: 200 },
            { who: "hungryMate", type: "stand", direction: "down", time: 200 },
            { who: "hungryMate", type: "stand", direction: "left", time: 200 },
            { type: "textMessage", text: "WHY, IT FEELS AS IF I AM LOSING MY MIND.", audioloc: "sans2" },
            { who: "hungryMate", type: "walk", direction: "up"},
            { who: "hungryMate", type: "walk", direction: "left"},
            { who: "hungryMate", type: "walk", direction: "down"},
            { who: "hungryMate", type: "walk", direction: "right"},
            { type: "textMessage", text: "I AM SO...", audioloc: "sans2" },
            { who: "hungryMate", type: "walk", direction: "up"},
            { who: "hungryMate", type: "walk", direction: "left"},
            { who: "hungryMate", type: "walk", direction: "down"},
            { who: "hungryMate", type: "walk", direction: "right"},
            { who: "hungryMate", type: "walk", direction: "up"},
            { who: "hungryMate", type: "walk", direction: "left"},
            { who: "hungryMate", type: "walk", direction: "down"},
            { who: "hungryMate", type: "walk", direction: "right"},
            { type: "textMessage", text: "SOOOO", audioloc: "sans2" },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 50 },
            { who: "hungryMate", type: "stand", direction: "right", time: 50 },
            { who: "hungryMate", type: "stand", direction: "left", time: 50 },
            { who: "hungryMate", type: "stand", direction: "up", time: 50 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { who: "hungryMate", type: "stand", direction: "down", time: 10 },
            { who: "hungryMate", type: "stand", direction: "right", time: 10 },
            { who: "hungryMate", type: "stand", direction: "left", time: 10 },
            { who: "hungryMate", type: "stand", direction: "up", time: 10 },
            { type: "textMessage", text: "HUNGRYYYYYY", audioloc: "sans2" },
            { type: "removeStoryFlag", flag: "HUNGRY_NOT_SERVED"}
          ]
        }
      ],
      [utils.asGridCoord(6,12)]: [
        {
          required: ["DANGER"],
          events: [
            { type: "textMessage", text: "I have no time for that, I have to go check on Chef Flop number 75!!", audioloc: "1"}
          ]
        },
        {
          events: [
            { type: "changeMap", map: "Street" }
          ]
        }
      ],
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
        y: utils.withGrid(6),
        src: "/images/characters/people/npc4.png",
        
        talking: [
          {
            required: ["APOLOGIZE"],
            events: [
              { type: "textMessage", text: "I have to go apologize.", audioloc: "1"},
            ]
          },
          {
            required: ["DANGER"],
            events: [
              { type: "textMessage", text: "*SOB* *SOB*", audioloc: "tor"},
              { type: "textMessage", text: "CHEF FLOP NUMBER 75, ARE YOU ALRIGHT?", audioloc: "1"},
              { type: "textMessage", text: "TINA... THEY'RE CLOSING DOWN OUR RESTAURAUNT", audioloc: "tor"},
              { type: "textMessage", text: "No... That can't be, but you worked so hard to build it from the ground up!", audioloc: "1"},
              { type: "textMessage", text: "YEAH, AND NOW IT'S ALL GONE.", audioloc: "tor"},
              { type: "textMessage", text: "APPARENTLY SOME INFLUENTIAL MEANIE POSTED A BAD REVIEW", audioloc: "tor"},
              { type: "textMessage", text: "SOMETHING ABOUT, 'TERRIBLE CUSTOMER SERVICE', OR SOMETHING...", audioloc: "tor"},
              { type: "textMessage", text: "AND NOW IT'S ALL GONE, IN THE BLINK OF AN EYE.", audioloc: "tor"},
              { type: "textMessage", text: "oh no... flop number 75, this is all my fault!", audioloc: "1"},
              { type: "textMessage", text: "No. It's not the end yet. I'm going to go apologize.", audioloc: "1"},
              { type: "removeStoryFlag", flag: "DANGER"},
              { type: "addStoryFlag", flag: "APOLOGIZE"}
            ]
          },
          {
            required: ["TUTORIAL","USED_PIZZA_STONE"],
            events: [
              { type: "textMessage", text: "WOW, YOU MADE THAT??", audioloc: "tor", faceHero: "npcC"},
              { type: "textMessage", text: "WOW... CHEF TINA.... I DONT SAY THIS LIGHTLY BUT", audioloc: "tor"},
              { type: "textMessage", text: "IM REALLY PROUD OF YOU", audioloc: "tor"},
              { type: "textMessage", text: "YOU'RE LIKE THE DAUGHTER I NEVER HAD...", audioloc: "tor"},
              { type: "talk", optionA: "um... okay?", optionB: "and you're like the mom i have had, chef flop number 75!", optionC: "maria's a flop", description: "Chef flop number 75 is approving of you!",
              ans1: "...JUST GET BACK TO WORK KIDDO.", flag1: "TUT_DONE", ans2: "HE HE, TAKE CARE OF YOURSELF OUT THERE KIDDO.", flag2: "TUT_DONE", ans3: "HE HE, YOU'RE A WEIRD ONE, KIDDO.", flag3: "MARIA0", audioloc: "tor"},
              { type: "removeStoryFlag", flag: "TUTORIAL"},
              { type: "addStoryFlag", flag: "READY"},
              { who: "npcC", type: "stand",  direction: "up"}
            ]
          },
          {
            required: ["P1", "TUTORIAL"],
            events: [
              { type: "textMessage", text: "CHEF FLOP NUMBER 74 JUST GOT FIRED!", audioloc: "tor", faceHero: "npcC"},
              { type: "textMessage", text: "WE NEED SOMEBODY TO TAKE OVER...", audioloc: "tor"},
              { type: "textMessage", text: "YOU'RE IN CHARGE!", audioloc: "tor"},
              { type: "textMessage", text: "What?! But I'm not qualified!", audioloc: "1"},
              { type: "textMessage", text: "IT DOESN'T MATTER! START COOKING PIZZAS!", audioloc: "tor"},
              { type: "textMessage", text: "COME BACK TO TALK TO ME ONCE YOU'RE DONE.", audioloc: "tor"},
              { who: "npcC", type: "walk",  direction: "up"},
              { type: "addStoryFlag", flag: "TALKED_TO_CHEF_FLOP"},
              { type: "removeStoryFlag", flag: "P1"}
            ]
          },
          {
            events: [
              // { type: "textMessage", text: "...", faceHero: "npcA"},
              { type: "textMessage", text: "KEEP MAKING PIZZAS!", audioloc: "tor", faceHero: "npcC"},
              { who: "npcC", type: "stand",  direction: "up"}
            ]
          },
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
      [utils.asGridCoord(6,7)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(1,7)] : true,
      [utils.asGridCoord(1,6)] : true,
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(1,9)] : true,
      [utils.asGridCoord(2,9)] : true,
      [utils.asGridCoord(10,9)] : true,
      [utils.asGridCoord(9,9)] : true,

      // [utils.asGridCoord(11,4)] : true,
      // [utils.asGridCoord(11,5)] : true,
      // [utils.asGridCoord(11,6)] : true,
      // [utils.asGridCoord(11,7)] : true,
      // [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(13,6)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(13,8)] : true,
      [utils.asGridCoord(13,9)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(12,4)] : true,
      [utils.asGridCoord(11,4)] : true,




      [utils.asGridCoord(12,10)] : true,

      [utils.asGridCoord(11,10)] : true,
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
      [utils.asGridCoord(7,3)] : true,

      [utils.asGridCoord(7,0)] : true,
      [utils.asGridCoord(6,1)] : true,
      [utils.asGridCoord(6,2)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          required: ["TUT_DONE"],
          events: [
            { type: "changeMap", map: "DemoRoom" }
          ]
        },
        {
          required: ["MARIA0"],
          events: [
            { type: "changeMap", map: "DemoRoom" }
          ]
        },
        {
          required: ["TALKED_TO_CHEF_FLOP"],
          events: [
            { type: "textMessage", text:"I should probably make my first pizza first", audioloc: "1"}
          ]
        },
        {
          events: [
            { type: "textMessage", text:"I should probably see what chef flop wants first", audioloc: "1"}
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
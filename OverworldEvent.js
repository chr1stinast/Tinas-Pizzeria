class OverworldEvent {
  constructor({ map, event}) {
    this.map = map;
    this.event = event;
    this.submission = 1;
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.mapF
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })
    
    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init( document.querySelector(".game-container") )
  }

  changeMap(resolve) {

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map] );
      resolve();

      sceneTransition.fadeOut();

    })
  }

  // can make walk to door here!

  pause(resolve) {
    //console.log("PAUSE NOW!");
    this.map.isPaused = true;
    const menu = new PauseMenu({
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  talk(resolve) {
    this.map.isPaused = true;
    const menu = new ZTalkExp({
      optionA: this.event.optionA,
      optionB: this.event.optionB,
      optionC: this.event.optionC,
      description: this.event.description,
      // onComplete: submission => {
      //   resolve(submission);
      //   this.map.isPaused = false;
      //   this.map.overworld.startGameLoop();
      // }
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
        this.map.submission = menu.getIndex();
        console.log(this.map.submission);
        if (this.map.submission == 1) {
          const message = new TextMessage({
            text: this.event.ans1,
            onComplete: () => resolve()
          })
          message.init( document.querySelector(".game-container") )
        }
        else if (this.map.submission == 2) {
          const message = new TextMessage({
            text: this.event.ans2,
            onComplete: () => resolve()
          })
          message.init( document.querySelector(".game-container") )
        }
        else if (this.map.submission == 3) {
          const message = new TextMessage({
            text: this.event.ans3,
            onComplete: () => resolve()
          })
          message.init( document.querySelector(".game-container") )
        }
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  ask(resolve) {
    // target = this.event.target, // problem is with these..
    // answer = this.event.answer,
    if (this.map.submission == 1) {
      const message = new TextMessage({
        text: "hi",
        onComplete: () => resolve()
      })
      message.init( document.querySelector(".game-container") )
    }
    resolve();
  }

  // choice() {
  //   const submission = await this.onNewEvent({
  //     type: "talk",
  //     optionA: this.event.optionA,
  //     optionB: this.event.optionB,
  //     optionC: this.event.optionC,
  //     description: this.event.description
  //   })
  // }

  submissionMenu(resolve) {
    this.map.isPaused = true;
    const menu = new ZSubmissionMenu({
      optionA: this.event.optionA,
      optionB: this.event.optionB,
      optionC: this.event.optionC,
      onComplete: submission => {
        //submission { what move to use, who to use it on }
        resolve(submission);
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      }
    });
    menu.init( document.querySelector(".game-container") );
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"));
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}
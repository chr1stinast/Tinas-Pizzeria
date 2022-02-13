class ZSubmissionMenu { 
    constructor({ scenario, onComplete }) {
      this.scenario = scenario;
      this.onComplete = onComplete;

    }
  
    getPages() {
  
      // const backOption = {
      //   label: "Go Back",
      //   description: "Return to previous page",
      //   handler: () => {
      //     this.keyboardMenu.setOptions(this.getPages().root)
      //   }
      // };
  
      return {
        root: [
            // ...this.Actions.map(key => {
            //     const action = Actions[key];
            //     return {
            //       label: action.name,
            //       description: action.description,
            //       handler: () => {
            //         this.menuSubmit(action)
            //       }
            //     }
            // })
            {
              label: "hi",
              description: "help me",
              handler: () => {
                console.log("help")
                this.menuSubmit(0)
              }
            }
        ]
      }
    }
  
    menuSubmitReplacement(replacement) {
      this.keyboardMenu?.end();
      this.onComplete({
        replacement
      })
    }
  
    menuSubmit(actionId) {
  
      this.keyboardMenu?.end();
  
      this.onComplete({
        actionId
      })
    }
  
    decide() {
      //TODO: Enemies should randomly decide what to do...
      this.menuSubmit(Actions[ this.caster.actions[0] ]);
    }
  
    showMenu(container) {
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(container);
      this.keyboardMenu.setOptions( this.getPages().root )
    }
  
    init(container) {
        // TODO: add a timer to make dialogue decisions, if timer runs out decide automatically
        //Show some UI
        this.showMenu(container)
    }
  }
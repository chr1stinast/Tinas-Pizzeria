class Sprite {
    constructor(config) {
      // set up image
      this.image = new Image();
      this.image.src = config.src;
      this.image.onload = () => {
        this.isLoaded = true;
      }
  
      // set up shadow
      this.shadow = new Image();
      this.useShadow = true; // add (config.useShadow || false) if you want option to not add shadow
      if (this.useShadow) {
        this.shadow.src = "/images/characters/shadow.png";
      }
      // load shadow
      this.shadow.onload = () => {
        this.isShadowLoaded = true;
      }
  
      // set up animation
      this.animations = config.animations || {
        // define each animation and cycle through frames
        "idle-down" : [ [0,0] ],
        "idle-right": [ [0,1] ],
        "idle-up"   : [ [0,2] ],
        "idle-left" : [ [0,3] ],
        "walk-down" : [ [1,0],[0,0],[3,0],[0,0], ],
        "walk-right": [ [1,1],[0,1],[3,1],[0,1], ],
        "walk-up"   : [ [1,2],[0,2],[3,2],[0,2], ],
        "walk-left" : [ [1,3],[0,3],[3,3],[0,3], ]
      }
      this.currentAnimation = "idle-right"; //config.currentAnimation || "idle-down"; 
      this.currentAnimationFrame = 0;
      
      // time element to know when to switch frames (greater the number the more slow)
      this.animationFrameLimit = config.animationFrameLimit || 16;

      // how much time before switching to next frame
      this.animationFrameProgress = this.animationFrameLimit;

      // reference game object
      this.gameObject = config.gameObject;
    }
    
    // returns which animation + animation frame we're on
    get frame() {
      return this.animations[this.currentAnimation][this.currentAnimationFrame]
    }

    // called to set current animation based on key input
    setAnimation(key) {
      if (this.currentAnimation !== key) {
        this.currentAnimation = key;
        this.currentAnimationFrame = 0;
        this.animationFrameProgress = this.animationFrameLimit;
      }
    }

    updateAnimationProgress() {
      // downtick frame progress
      if (this.animationFrameProgress > 0) {
        this.animationFrameProgress -= 1;
        return;
      }

      // reset the counter
      this.animationFrameProgress = this.animationFrameLimit;
      this.currentAnimationFrame += 1;

      if (this.frame === undefined) {
        this.currentAnimationFrame = 0;
      }
      console.log(this.animationFrameLimit);
    }

    // draw game object on canvas using coordinates 
    draw(ctx, cameraPerson) {
      const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
      const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;
  
      this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);
      
      const [frameX, frameY] = this.frame;
      this.isLoaded && ctx.drawImage(this.image,
        // multiply by grid size
        frameX * 32 , frameY * 32, // left cut
        32,32, // right cut
        x,y, // 16x16 coordinates 
        32,32 // px size
      )
      this.updateAnimationProgress();
    }
  }
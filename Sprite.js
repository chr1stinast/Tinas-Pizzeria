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
        "idle-down": [ [0,0] ],
        "idle-right": [ [0,1] ],
        "idle-up": [ [0,2] ],
        "idle-left": [ [0,3] ],
        "walk-down": [ [1,0],[0,0],[3,0],[0,0] ],
        "walk-right": [ [1,1],[0,1],[3,1],[0,1] ],
        "walk-up": [ [1,2],[0,2],[3,2],[0,2] ],
        "walk-left": [ [1,3],[0,3],[3,3],[0,3] ],
        
      }
      this.currentAnimation = "idle-up"; // config.currentAnimation || "idle-down";
      this.currentAnimationFrame = 0;

      this.animationFrameLimit = config.animationFrameLimit || 4;
      this.animationFrameProgress = this.animationFrameLimit;

      // reference game object
      this.gameObject = config.gameObject;
    }

    get frame() {
      return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    setAnimation(key) {
      if (this.currentAnimation != key) {
        this.currentAnimation = key;
        this.currentAnimationFrame = 0;
        this.animationFrameProgress = this.animationFrameLimit;
      }
    }

    updateAnimationProgress() {
      //Downstrick frame progress
      if (this.animationFrameProgress > 0) {
        this.animationFrameProgress -= 1;
        return;
      }

      this.animationFrameProgress = this.animationFrameLimit;
      this.currentAnimationFrame += 1;

      // handles if it goes off the bounds of the frames given
      if (this.frame === undefined) {
        this.currentAnimationFrame = 0;
      }

    }
    
    // draw game object on canvas using coordinates 
    draw(ctx, cameraPerson) {
      const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
      const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;
  
      this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);
  

      const [frameX, frameY] = this.frame;
      this.isLoaded && ctx.drawImage(this.image,
        frameX * 32, frameY * 32,// left cut
        32,32, // right cut
        x,y, // 16x16 coordinates 
        32,32 // px size
      )
      this.updateAnimationProgress();
    }
  }
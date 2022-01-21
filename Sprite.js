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
        idleDown: [
          [0,0]
        ]
        
      }
      this.currentAnimation = config.currentAnimation || "idleDown";
      this.currentAnimationFrame = 0;
  
      // reference game object
      this.gameObject = config.gameObject;
    }
    
    // draw game object on canvas using coordinates 
    draw(ctx) {
      const x = this.gameObject.x - 8;
      const y = this.gameObject.y - 18;
  
      this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);
  
      this.isLoaded && ctx.drawImage(this.image,
        0,0, // left cut
        32,32, // right cut
        x,y, // 16x16 coordinates 
        32,32 // px size
      )
    }
  }
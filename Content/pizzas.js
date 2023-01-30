window.PizzaTypes = {
    normal: "normal",
    spicy: "spicy",
    veggie: "veggie",
    fungi: "fungi",
    chill: "chill",
  }
  
  window.Pizzas = {
    "v001": {
      name: "Flop Favorite",
      description: "Pizza of the Day!",
      type: PizzaTypes.veggie,
      src: "/images/characters/pizzas/v001.png",
      icon: "/images/icons/veggie.png",
      actions: [ "damage1" ],
    },
    "f001": {
      name: "Pepperoni Deluxe",
      description: "A classic Pepperoni Pizza.",
      type: PizzaTypes.fungi,
      src: "/images/characters/pizzas/f001.png",
      icon: "/images/icons/fungi.png",
      actions: [ "damage1" ],
    }
  }
class Order {
    // order class that stores information for each order
    constructor(topping, num, orderNumber) {
        this.topping = topping;
        this.num = num;
        // work on making orderNumber a static variable that automatically increments and doesn't need to be passed through
        this.orderNumber = orderNumber;
    }
    displayInfo() {
        console.log("Order #" + this.orderNumber + ": " + this.topping + " pizza with " + this.num + " on it.");
    }
}
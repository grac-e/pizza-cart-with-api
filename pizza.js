document.addEventListener("alpine:init", () => {

    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: '',
            message: '',
            change: 0,
            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                    alert("Username is too short");
                }
            },

            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                }

            },
            createCart() {
                if (!this.username) {
                    // this.cartId = 'No username to create a cart for'
                    return Promise.resolve();
                }
                const cartId = localStorage['cartId'];

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        });
                }
            },
            // pizzaId: 0,

            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return axios.get(getCartURL);
            },

            addPizza(pizzaId) {
                return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/add`, {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })
            },

            removePizza(pizzaId) {
                return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/remove`, {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                });
            },

            pay(amount) {

                return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/pay`,
                    {
                        "cart_code": this.cartId,
                        amount
                    })
            },

            showCartData() {
                this.getCart().then(result => {
                    this.cartPizzas = result.data.pizzas;
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                })
            },

            init() {

                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername;
                }
               

                    axios
                        .get(`https://pizza-api.projectcodex.net/api/pizzas`)
                        .then(result => {
                            // console.log(result.data);
                            this.pizzas = result.data.pizzas
                        });

                if (!this.cartId) {
                    this
                        .createCart()
                        .then(() => {
                            this.showCartData();
                        })
                }

            },
            addPizzaToCart(pizzaId) {
                this.addPizza(parseInt(pizzaId))
                    .then(() => {
                        this.showCartData();
                    })
                console.log(pizzaId)
            },

            removePizzaFromCart(pizzaId) {
                // const pizza = this.cartPizzas.find(p => p.id === pizzaId);
                // if (pizza && pizza.qty > 0) {
                this.removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    });

            },

            payForCart() {
                // alert("Pay now : " + this.paymentAmount)

                this
                    .pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status == 'failure') {
                            this.message = result.data.message;
                            setTimeout(() => this.message = '', 3000);
                        } else {
                            this.message = 'Payment received. Enjoy your pizzas!';

                            if (this.paymentAmount > this.cartTotal) {
                                this.change = this.paymentAmount - this.cartTotal;
                            } else {
                                this.change = 0;
                            }

                            setTimeout(() => {
                                this.message = '';
                                this.change = 0;
                                this.cartPizzas = [];
                                this.cartTotal = 0.00
                                this.cartId = ''
                                this.paymentAmount = '';
                                localStorage['cartId'] = '';
                                this.createCart();
                            }, 3000);
                        }
                    })
            }

        }
    })
});


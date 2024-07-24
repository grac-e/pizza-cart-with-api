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
            messageType: '',
            change: 0,
            pizzaHistory: [],
            cartData: [],
            featuredPizzas: [],
            showOrderHistory: false,
            orderHistory: [],



            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                    // this.showOrderHistory = false;
                    // this.loadHistory();
                } else {
                    alert("Username is too short");
                }
            },

            logout() {
                if (confirm('Do you want to logout?')) {
                    // this.saveHistory();
                    this.featuredPizzas = [];
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    localStorage['username'] = '';
                    // localStorage.removeItem('cartId');
                    // this.showOrderHistory = false;
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

            fetchFeaturedPizzas() {
                const featuredPizzasURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`;
                axios.get(featuredPizzasURL).then((result) => {
                    this.featuredPizzas = result.data.pizzas;
                });
            },

            manageFeaturedPizzas(pizzaId) {
                const featuredPizzasURL = `https://pizza-api.projectcodex.net/api/pizzas/featured`;
                axios.post(featuredPizzasURL, {
                    'username': this.username,
                    'pizza_id': pizzaId
                }).then(() => {
                    this.fetchFeaturedPizzas();
                });
            },

            showCartData() {
                this.getCart().then(result => {
                    this.cartPizzas = result.data.pizzas;
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                })
            },

            fetchPizzaHistory() {
                this.pizzaHistory = JSON.parse(localStorage.getItem('pizzaHistory') || []);
                console.log(this.pizzaHistory);
            },

            // new
            fetchOrderHistory() {
                const orderHistoryURL = `https://pizza-api.projectcodex.net/api/pizza-cart/history?username=${this.username}`;
                axios.get(orderHistoryURL)
                    .then(result => {
                        this.orderHistory = result.data.orders;
                    });
            },

            // saveOrderHistory() {
            //                     axios.get(orderHistoryURL)
            //         .then(result => {
            //             this.orderHistory = result.data.orders;
            //         });
            // },
            // new ends

            init() {

                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername;
                    this.fetchOrderHistory();
                }


                axios
                    .get(`https://pizza-api.projectcodex.net/api/pizzas`)
                    .then(result => {
                        // console.log(result.data);
                        this.pizzas = result.data.pizzas
                    });
                    // this.fetchOrderHistory();

                if (!this.cartId) {
                    this
                        .createCart()
                        .then(() => {
                            this.showCartData();
                        })
                }
                this.fetchPizzaHistory();
                this.fetchFeaturedPizzas();
                // console.log(this.addPizzafetchFeaturedPizzas());

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
                            this.messageType = 'error-message';
                            setTimeout(() => this.message = '', 3000);
                        } else {
                            this.message = 'Payment received. Enjoy your pizzas!';
                            this.messageType = 'success-message';


                            var localStorageData = JSON.parse(localStorage.getItem('pizzaHistory')) || [];
                            var pizzaHistoryArr = [...this.cartPizzas, ...localStorageData]
                            localStorage.setItem('pizzaHistory', JSON.stringify(pizzaHistoryArr))
                            console.log(pizzaHistoryArr)


                            // console.log("is enough", this.paymentAmount > this.cartTotal)
                            // console.log("amount", this.paymentAmount)

                            const amount = parseInt(this.paymentAmount)
                            if (amount > this.cartTotal) {
                                // console.log("change",this.paymentAmount - this.cartTotal)
                                // console.log("total",this.cartTotal)
                                this.change = (amount - this.cartTotal);
                            } else {
                                this.change = 0;
                            }

                            setTimeout(() => {
                                this.message = '';
                                this.messageType = '';
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


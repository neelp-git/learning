paypal.Buttons({
    style : {
        color: 'blue',
        shape: 'pill'
    },
    createOrder: function (data, actions) {
        return actions.order.create({
            purchase_units : [{
                amount: {
                    value: document.getElementById("pd_total").innerHTML
                }
            }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(details => {
            console.log(details)
            window.location = "http://localhost:3000/cartsuccess.html"
        })
    },
    onCancel: function (data) {
        window.location = "http://localhost:3000/cartcancel.html"
    }
}).render('#paypal-payment-button');
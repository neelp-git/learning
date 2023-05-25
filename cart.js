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
            //console.log(details)
            console.log("approved paypal client checkout");
            alert("PAYPAL CLIENT CHECKOUT APPROVED");
            window.location = "http://localhost:3000/cartsuccess.html"
        })
    },
    onCancel: function (data) {
        console.log("cancelled paypal client checkout");
        alert("PAYPAL CLIENT CHECKOUT CANCELLED");
        window.location = "http://localhost:3000/cartcancel.html"
    }
}).render('#paypal-payment-button');


// Paypal server side processing buttons
function setupPaypalServerSide() {
    const intent = "capture";
    try {
        let paypal_buttons = paypal.Buttons({ // https://developer.paypal.com/sdk/js/reference
            onClick: (data) => { // https://developer.paypal.com/sdk/js/reference/#link-oninitonclick
                //Custom JS here
            },
            style: { //https://developer.paypal.com/sdk/js/reference/#link-style
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'paypal'
            },

            createOrder: function(data, actions) { //https://developer.paypal.com/docs/api/orders/v2/#orders_create
                return fetch("http://localhost:3000/create_order", {
                    method: "post", headers: { "Content-Type": "application/json; charset=utf-8" },
                    body: JSON.stringify({ 
                        "intent": intent, 
                        "amount": document.getElementById("pd_total").innerHTML,
                    })
                })
                .then((response) => response.json())
                .then((order) => { return order.id; });
            },

            onApprove: function(data, actions) {
                let order_id = data.orderID;
                return fetch("http://localhost:3000/complete_order", {
                    method: "post", headers: { "Content-Type": "application/json; charset=utf-8" },
                    body: JSON.stringify({
                        "intent": intent,
                        "order_id": order_id,
                    })
                })
                .then((response) => response.json())
                .then((order_details) => {
                    //console.log(order_details); //https://developer.paypal.com/docs/api/orders/v2/#orders_capture!c=201&path=create_time&t=response
                    //let intent_object = intent === "authorize" ? "authorizations" : "captures";
                    //Custom Successful Message
                    console.log("approved paypal server checkout");
                    alert("PAYPAL SERVER CHECKOUT APPROVED");
                    window.location = "http://localhost:3000/cartsuccess.html"

                    //Close out the PayPal buttons that were rendered
                    //paypal_buttons.close();
                })
                .catch((error) => {
                    console.log(error);
                    window.location = "http://localhost:3000/cartcancel.html"
                });
            },

            onCancel: function (data) {
                console.log("cancelled paypal server checkout");
                alert("PAYPAL SERVER CHECKOUT CANCELLED");
                window.location = "http://localhost:3000/cartcancel.html"
            },

            onError: function(err) {
                console.log(err);
            }
        });
        paypal_buttons.render('#payment_options');
    }
    catch(error) {
        console.error(error);
    }
}
setupPaypalServerSide();

// Braintree server side processing buttons

var button = document.querySelector('#bt-submit-button');
braintree.dropin.create({
  // Insert your tokenization key here
  authorization: 'sandbox_9qsnyyst_4j5xphg8mx9vwykt',
  container: '#bt-dropin-container'
}, function (createErr, instance) {
  button.addEventListener('click', function () {
    instance.requestPaymentMethod(function (requestPaymentMethodErr, payload) {
      // When the user clicks on the 'Submit payment' button this code will send the
      // encrypted payment information in a variable called a payment method nonce
      $.ajax({
        type: 'POST',
        url: '/bt-checkout',
        data: {
            'paymentMethodNonce': payload.nonce, 
            'amount': document.getElementById("pd_total").innerHTML 
        }
      }).done(function(result) {
        // Tear down the Drop-in UI
        instance.teardown(function (teardownErr) {
          if (teardownErr) {
            console.error('Could not tear down Drop-in UI!');
          } else {
            console.info('Drop-in UI has been torn down!');
            // Remove the 'Submit payment' button
            $('#bt-submit-button').remove();
          }
        });

        if (result.success) {
          alert("BRAINTREE SERVER CHECKOUT APPROVED");
          window.location = "http://localhost:3000/cartsuccess.html"
        } else {
          console.log(result);
          alert("BRAINTREE SERVER CHECKOUT CANCELLED");
          window.location = "http://localhost:3000/cartcancel.html"
        }
      });
    });
  });
});
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('images'));
app.use('/images', express.static('images'));

const port = process.env.PORT || 3000;
const environment = process.env.ENVIRONMENT || 'sandbox';
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const endpoint_url = environment === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

/**
 * Creates an order and returns it as a JSON response.
 * @function
 * @name createOrder
 * @memberof module:routes
 * @param {object} req - The HTTP request object.
 * @param {object} req.body - The request body containing the order information.
 * @param {string} req.body.intent - The intent of the order.
 * @param {object} res - The HTTP response object.
 * @returns {object} The created order as a JSON response.
 * @throws {Error} If there is an error creating the order.
 */

/* use async-await instead of a promise chain
*/
async function fetchOrderJson(url, payload) {
    const resp = await fetch(url, payload);
    return await resp.json();
}

/* using async-await instead of a promise chain 
*/
app.post('/create_order', async (req, res) => {
    try {
        const access_token = await get_access_token();
        let order_data_json = {
            'intent': req.body.intent.toUpperCase(),
            'purchase_units': [{
                'amount': {
                    'currency_code': 'USD',
                    'value': '300.00'
                }
            }]
        };
        const data = JSON.stringify(order_data_json);

        const json = await fetchOrderJson(endpoint_url + '/v2/checkout/orders', { //https://developer.paypal.com/docs/api/orders/v2/#orders_create
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${access_token}`
                        },
                        body: data
                    });
        
        res.send(json); //Send minimal data to client
    }
    catch(err) {
        console.log(err);
        res.status(500).send(err)
    }
});

/**
 * Completes an order and returns it as a JSON response.
 * @function
 * @name completeOrder
 * @memberof module:routes
 * @param {object} req - The HTTP request object.
 * @param {object} req.body - The request body containing the order ID and intent.
 * @param {string} req.body.order_id - The ID of the order to complete.
 * @param {string} req.body.intent - The intent of the order.
 * @param {object} res - The HTTP response object.
 * @returns {object} The completed order as a JSON response.
 * @throws {Error} If there is an error completing the order.
 */

/* using async-await instead of a promise chain 
*/
app.post('/complete_order', async (req, res) => {
    try {
        const access_token = await get_access_token();

        const json = await fetchOrderJson(endpoint_url + '/v2/checkout/orders/' + req.body.order_id + '/' + req.body.intent, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${access_token}`
                        }
                    });
                
        console.log(json);
        res.send(json);  //Send minimal data to client
     }
    catch(err) {
        console.log(err);
        res.status(500).send(err)
    }
});

// Helper / Utility functions

//Servers the index.html file
app.get('/', (req, res) => {
    //res.sendFile(process.cwd() + '/index.html');
    res.sendFile(process.cwd() + '/cart.html');

});
app.get('/cartsuccess.html', (req, res) => {
    //res.sendFile(process.cwd() + '/index.html');
    res.sendFile(process.cwd() + '/cartsuccess.html');

});
app.get('/cartcancel.html', (req, res) => {
    //res.sendFile(process.cwd() + '/index.html');
    res.sendFile(process.cwd() + '/cartcancel.html');

});
//Servers the style.css file
app.get('/style.css', (req, res) => {
    res.sendFile(process.cwd() + '/style.css');
});
app.get('/cart.css', (req, res) => {
    res.sendFile(process.cwd() + '/cart.css');
});
//Servers the script.js file
app.get('/script.js', (req, res) => {
    res.sendFile(process.cwd() + '/script.js');
});
app.get('/cart.js', (req, res) => {
    res.sendFile(process.cwd() + '/cart.js');
});


/* using async-await instead of a promise chain 
*/
async function get_access_token() {
    const auth = `${client_id}:${client_secret}`
    const data = 'grant_type=client_credentials'
    res = await fetch(endpoint_url + '/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`
            },
            body: data
        });
    json = await res.json();
    
    return json.access_token;
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
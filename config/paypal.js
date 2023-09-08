const paypal = require('paypal-rest-sdk');
// require('dotenv').config()

paypal.configure({
  mode: 'sandbox', // Use 'sandbox' for testing; 'live' for production
  client_id:'AQc_8CFdQSh9xQbCGG_mB33utH_9nuL-4TaY--pMNSdWH8awb76Bu9_2KijPF6nKvtQ53SL4i8LpJ7Fd',
  client_secret:'EF6IHPyBsruaXO3viCNsOEgu3jrxmNSTlcGrDzYvYRsJuL5cZiBERfPZNUMjrXX1WTXc8yj6ViaGz1KK'
});

module.exports = paypal
const express           = require('express');
const route             = express.Router();
const controller        = require('./controller/api');
const auth_token_verify = require('./middleware/auth_middleware'); 
const { validateLogin } = require('./middleware/authvalidator');

route.post('/login', validateLogin,controller.login)

//category routes
route.post('/category', auth_token_verify, controller.addcategory)
route.get('/getcategory', auth_token_verify, controller.getcategory)
route.put('/category/:categoryId', auth_token_verify, controller.upadtecategory)
route.delete('/category/:categoryId', auth_token_verify, controller.deletecategory)

//services
route.post('/category/:categoryId/service', auth_token_verify, controller.addservice)
route.get('/category/:categoryId/services', auth_token_verify, controller.getservice)
route.put('/category/:categoryId/service/:serviceId', auth_token_verify, controller.updateservice)
route.delete('/category/:categoryId/service/:serviceId', auth_token_verify, controller.deleteService)

module.exports = route;


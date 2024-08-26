const express = require('express');
const { newOrder,getOneOder,myorders,getAllOrders,updateOrder,deleteOrder, testemail,testemailnew} = require('../controllers/orderController');
const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth');
const router = express.Router();
router.route("/order/new").post(isAuthenticatedUser,newOrder)
router.route("/order/:id").get(isAuthenticatedUser,getOneOder)
router.route("/orders/my").get(isAuthenticatedUser,myorders)
router.route("/testemail").get(testemail);
router.route("/testemailnew").get(testemailnew);
/*get All orders -- by Admin*/

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"),getAllOrders)
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
module.exports =router
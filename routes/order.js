const express = require('express');
const { createOrder, getOneOrder, getLoggedInOrders, adminGetAllOrders, adminUpdateOrder, adminDeleteOrder } = require('../controller/orderController');
const { isLoggedIn, customRole } = require('../middlewares/user');
const router = express.Router();

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/myorder").get(isLoggedIn, getLoggedInOrders);

router.route("/order/:id").get(isLoggedIn, getOneOrder);


//admin routes
router.route("/admin/orders").get(isLoggedIn,customRole("admin"), adminGetAllOrders);
router.route("/admin/order/:id").put(isLoggedIn,customRole("admin"), adminUpdateOrder)
                                .delete(isLoggedIn,customRole("admin"), adminDeleteOrder);

module.exports = router;
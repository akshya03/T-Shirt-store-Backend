const express = require('express');
const { testProduct, addProduct, getAllProduct, adminGetAllProduct, getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct } = require('../controller/productController');
const { isLoggedIn, customRole } = require('../middlewares/user');
const router = express.Router();

router.route("/testProduct").get(testProduct);

//user routes
router.route("/products").get(getAllProduct);
router.route("/products/:id").get(getOneProduct);

//admin routes
router.route("/admin/product/add").post(isLoggedIn, customRole('admin'), addProduct);
router.route("/admin/products").get(isLoggedIn, customRole('admin'), adminGetAllProduct);
router.route("/admin/product/:id").put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)
                                    .delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct);

module.exports = router;
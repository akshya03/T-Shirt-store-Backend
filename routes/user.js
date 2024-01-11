const express = require('express');
const router = express.Router();

const {signup, login, logout, forgotPassword, passwordReset, getLoggedInUserDetails, changePassword, updateUserDetails, adminAllUser, managerRole, adminGetOneUser, adminUpdateOneUserDetails, adminDeleteOneUser} = require('../controller/userController');
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userDashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

//admin only routes
router.route("/admin/users").get(isLoggedIn, customRole('admin'), adminAllUser);
router.route("/admin/user/:id")
.get(isLoggedIn, customRole('admin'), adminGetOneUser)
.put(isLoggedIn, customRole('admin'), adminUpdateOneUserDetails)
.delete(isLoggedIn, customRole('admin'), adminDeleteOneUser);

//manager only routes
router.route("/manager/users").get(isLoggedIn, customRole('manager'), managerRole);

module.exports = router;
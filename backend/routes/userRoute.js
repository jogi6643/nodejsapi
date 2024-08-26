const express = require('express');

const { register,loginuser,forgotPassword,resetPassword, logout,getUserDetails,updatePassword,profileUpdate ,getAllUsers,getSingleUser,updateUserRole,deleteUser} = require('../controllers/userControllers');
const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.route("/login").post(loginuser)
router.route("/register").post(register)
router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)
router.route("/password/update").put(isAuthenticatedUser,updatePassword)
router.route("/profile").get(isAuthenticatedUser,getUserDetails)
router.route("/profile/update").put(isAuthenticatedUser,profileUpdate)
router.route("/logout").get(logout)

// Admin Routes 
router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers)
router.route("/admin/user/:id")
.get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)
.put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser)

module.exports =router
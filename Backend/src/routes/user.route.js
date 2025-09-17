import { Router } from "express";
import {
  deleteUser,
  forgotPassword,
  getAllUsersLists,
  getProfile,
  getSingleUser,
  loginUser,
  logOutUser,
  registerUser,
  resetPassword,
  updateAccessToken,
  updatePassword,
  updateProfile,
  updateUserRole,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  loginUserValidator,
  updatePasswordValidator,
  userRegistrationValidator,
} from "../validators/index.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);

router.route("/verify-email/:token").get(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

router
  .route("/update-password/:userId")
  .post(updatePasswordValidator(), validate, verifyJWT, updatePassword);

router.route("/login").post(loginUserValidator(), validate, loginUser);
router.route("/logout").get(verifyJWT, logOutUser);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/update/profile").post(verifyJWT, updateProfile);
router.route("/update/refresh-token").post(verifyJWT, updateAccessToken);
router.route("/get-all-user").get(verifyJWT, checkRole, getAllUsersLists);
router.route("/get/user/:userId").get(verifyJWT, checkRole, getSingleUser);
router.route("/update/role/:userId").put(verifyJWT, checkRole, updateUserRole);
router.route("/deleteUser/:userId").delete(verifyJWT, checkRole, deleteUser);
export default router;

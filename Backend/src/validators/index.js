import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email Field can not be empty")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("User Name is required to proceed")
      .isLength({ min: 3, max: 13 })
      .withMessage(
        "userName should be at least of 3 Chars and should not exceed 13 chars"
      ),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password Field can not be empty")
      .isLength({ min: 8, max: 15 })
      .withMessage(
        "Password should be at least of 8 Chars and should not exceed 15 chars"
      ),
  ];
};

const loginUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email Field can not be empty")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password Field can not be empty")
      .isLength({ min: 8, max: 15 })
      .withMessage(
        "Password should be at least of 8 Chars and should not exceed 15 chars"
      ),
  ];
};

const updatePasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("Password Field can not be empty")
      .isLength({ min: 8, max: 15 })
      .withMessage(
        "Password should be at least of 8 Chars and should not exceed 15 chars"
      ),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("Password Field can not be empty")
      .isLength({ min: 8, max: 15 })
      .withMessage(
        "Password should be at least of 8 Chars and should not exceed 15 chars"
      ),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("Password Field can not be empty")
      .isLength({ min: 8, max: 15 })
      .withMessage(
        "Password should be at least of 8 Chars and should not exceed 15 chars"
      ),
  ];
};

const productValidator = () => {
  return [
    body("productName")
      .trim()
      .notEmpty()
      .withMessage("Product Name is required to proceed"),

    body("productDescription")
      .trim()
      .notEmpty()
      .withMessage("Product Description is required to proceed"),

    body("productPrice")
      .isFloat({ gt: 0 })
      .withMessage("Product Price must be a number greater than 0"),

    body("productCategory")
      .trim()
      .notEmpty()
      .withMessage("Product Category is required"),

    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
  ];
};

const orderValidator = () => {
  return [
    body("shippingInfo")
      .notEmpty()
      .withMessage("Shipping Info cannot be empty"),

    body("shippingInfo.address")
      .notEmpty()
      .withMessage("Shipping address is required"),

    body("shippingInfo.city").notEmpty().withMessage("City is required"),

    body("shippingInfo.state").notEmpty().withMessage("State is required"),

    body("shippingInfo.country").notEmpty().withMessage("Country is required"),

    body("shippingInfo.pinCode")
      .notEmpty()
      .withMessage("Pin Code is required")
      .isInt({ min: 100000, max: 999999 })
      .withMessage("Pin Code must be a 6-digit number"),

    body("shippingInfo.phoneNo")
      .notEmpty()
      .withMessage("Phone Number is required")
      .isInt({ min: 1000000000, max: 9999999999 })
      .withMessage("Phone Number must be a 10-digit number"),

    body("orderItems")
      .notEmpty()
      .withMessage("Order Items cannot be empty")
      .isArray()
      .withMessage("Order Items must be an array"),

    body("orderItems.*.name")
      .notEmpty()
      .withMessage("Product Name in Order Items is required"),

    body("orderItems.*.price")
      .isFloat({ gt: 0 })
      .withMessage("Product Price must be a number greater than 0"),

    body("orderItems.*.quantity")
      .isInt({ gt: 0 })
      .withMessage("Product Quantity must be an integer greater than 0"),

    body("orderItems.*.image")
      .notEmpty()
      .withMessage("Product Image is required"),

    body("orderItems.*.product")
      .notEmpty()
      .withMessage("Product ID is required"),

    body("paymentInfo.id").notEmpty().withMessage("Payment ID is required"),

    body("paymentInfo.status")
      .notEmpty()
      .withMessage("Payment Status is required"),

    body("itemPrice")
      .isFloat({ gt: 0 })
      .withMessage("Item price must be a number greater than 0"),

    body("taxPrice")
      .isFloat({ min: 0 })
      .withMessage("Tax price must be a non-negative number"),

    body("shippingPrice")
      .isFloat({ min: 0 })
      .withMessage("Shipping price must be a non-negative number"),
  ];
};

export {
  loginUserValidator,
  orderValidator,
  productValidator,
  updatePasswordValidator,
  userRegistrationValidator,
};

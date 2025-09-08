import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createNewOrder = asyncHandler(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
  } = req.body;

  const newOrder = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  if (!newOrder) {
    return next(
      new ApiError(
        500,
        "Sorry Failed to place the Order, please try after sometime"
      )
    );
  }
  console.log(`Order Details ${newOrder}`);

  return res
    .status(201)
    .json(
      new ApiResponse(201, newOrder, "Your Order has been placed Successfully")
    );
});

export { createNewOrder };

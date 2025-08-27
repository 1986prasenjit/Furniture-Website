import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    sku: {
        type: String,
        required: [true, "Please enter a product SKU"],
        unique: true,
        trim: true
    },
    productName: {
        type: String,
        required: [true, "Please enter the product name"],
        trim: true
    },
    productDescription: {
        type: String,
        required: [true, "Please enter the product description"],
        trim: true
    },
    productPrice: {
        type: Number,
        required: [true, "Please enter the product price"],
        max: [9999999, "Price cannot exceed 7 Digits"]
    },
    rating: {
        type: Number,
        default: 0
    },
    image: [
        {
            publicId: {
                type: String,
                required: true,
            }, url: {
                type: String,
                required: true,
            }
        }
    ],
    productCategory: {
        type: String,
        required: [true, "Please enter Product Category"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter the Product in Stock"],
        max: [99999, "Stock length cannot exceed 5"]
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    review: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comments: {
                type: String,
                required: true
            }
        }
    ]
},{timestamps:true});

const Product = new mongoose.model("Product", productSchema);

export { Product };
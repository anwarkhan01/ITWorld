import express from "express";
import { getFilterProducts, getproducts, getRandomProducts } from "../controllers/product.controller.js";
import { importProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/get-products", getproducts)
router.post("/import-products", importProducts)
router.get("/get-random-products", getRandomProducts)
router.get("/get-filter-products", getFilterProducts)

export default router;

const express = require("express");
const router = express.Router();
const authenticate = require("../config/middleware");
const transactionController = require("../controllers/transaction_controller");

router.post("/create", authenticate, transactionController.createTransaction);
router.put("/edit/:id", authenticate, transactionController.updateTransaction);
router.delete("/delete/:id", authenticate, transactionController.deleteTransaction);
router.get("/", authenticate, transactionController.getUserTransactions);

module.exports = router;

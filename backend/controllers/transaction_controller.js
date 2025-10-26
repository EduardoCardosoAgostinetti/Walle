// controllers/transactionController.js
require("dotenv").config({ path: "../.env", quiet: true });
const { v4: uuidv4 } = require("uuid");
const { PutCommand, UpdateCommand, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDB } = require("../config/database");
const apiResponse = require("../config/api_response");

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE || "Transactions";

/**
 * Cria uma nova transação
 */
exports.createTransaction = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { type, amount, description, date, category } = req.body;

    if (!type) return apiResponse(res, false, "MISSING_TYPE", "Transaction type is required.", null, 400);
    if (!amount) return apiResponse(res, false, "MISSING_AMOUNT", "Transaction amount is required.", null, 400);
    if (!category) return apiResponse(res, false, "MISSING_CATEGORY", "Transaction category is required.", null, 400);
    if (typeof amount !== "number") return apiResponse(res, false, "INVALID_AMOUNT", "Amount must be a number.", null, 400);

    const transaction = {
      id: uuidv4(),
      userId,
      type, // e.g. "income" | "expense"
      amount,
      category,
      description: description || "",
      date: date || new Date().toISOString().split("T")[0], // só YYYY-MM-DD
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: TRANSACTIONS_TABLE,
        Item: transaction,
      })
    );

    return apiResponse(res, true, "TRANSACTION_CREATED", "Transaction created successfully.", transaction, 201);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return apiResponse(res, false, "SERVER_ERROR", "Error creating transaction.", null, 500);
  }
};

/**
 * Atualiza uma transação existente
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    if (!id)
      return apiResponse(res, false, "MISSING_ID", "Transaction ID is required.", null, 400);

    // Verifica se a transação pertence ao usuário
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TRANSACTIONS_TABLE,
        FilterExpression: "id = :id AND userId = :userId",
        ExpressionAttributeValues: { ":id": id, ":userId": userId },
      })
    );

    if (!result.Items || result.Items.length === 0)
      return apiResponse(res, false, "TRANSACTION_NOT_FOUND", "Transaction not found.", null, 404);

    // Cria expressão dinâmica para atualizar apenas os campos fornecidos
    let updateExp = "SET";
    const expAttrValues = {};
    const expAttrNames = {};

    if (type) { 
      updateExp += " #type = :t,"; 
      expAttrValues[":t"] = type; 
      expAttrNames["#type"] = "type";
    }
    if (amount !== undefined) { 
      updateExp += " amount = :a,"; 
      expAttrValues[":a"] = amount; 
    }
    if (category) {
      updateExp += " category = :c,"; 
      expAttrValues[":c"] = category; 
    }
    if (description !== undefined) { 
      updateExp += " description = :d,"; 
      expAttrValues[":d"] = description; 
    }
    if (date) { 
      // salva apenas a string YYYY-MM-DD sem converter para Date
      updateExp += " #date = :dt,"; 
      expAttrValues[":dt"] = date; 
      expAttrNames["#date"] = "date";
    }

    updateExp = updateExp.replace(/,$/, ""); // remove vírgula final

    const updated = await dynamoDB.send(
      new UpdateCommand({
        TableName: TRANSACTIONS_TABLE,
        Key: { id },
        UpdateExpression: updateExp,
        ExpressionAttributeValues: expAttrValues,
        ExpressionAttributeNames: Object.keys(expAttrNames).length ? expAttrNames : undefined,
        ReturnValues: "ALL_NEW",
      })
    );

    return apiResponse(res, true, "TRANSACTION_UPDATED", "Transaction updated successfully.", updated.Attributes, 200);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return apiResponse(res, false, "SERVER_ERROR", "Error updating transaction.", null, 500);
  }
};

/**
 * Deleta uma transação
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    if (!id) return apiResponse(res, false, "MISSING_ID", "Transaction ID is required.", null, 400);

    // Verifica se pertence ao usuário
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TRANSACTIONS_TABLE,
        FilterExpression: "id = :id AND userId = :userId",
        ExpressionAttributeValues: { ":id": id, ":userId": userId },
      })
    );

    if (!result.Items || result.Items.length === 0)
      return apiResponse(res, false, "TRANSACTION_NOT_FOUND", "Transaction not found.", null, 404);

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TRANSACTIONS_TABLE,
        Key: { id },
      })
    );

    return apiResponse(res, true, "TRANSACTION_DELETED", "Transaction deleted successfully.", null, 200);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return apiResponse(res, false, "SERVER_ERROR", "Error deleting transaction.", null, 500);
  }
};

/**
 * Retorna todas as transações de um usuário
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TRANSACTIONS_TABLE,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
    );

    const transactions = result.Items || [];

    // Ordena por data decrescente
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return apiResponse(res, true, "TRANSACTIONS_FOUND", "Transactions retrieved successfully.", transactions, 200);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return apiResponse(res, false, "SERVER_ERROR", "Error retrieving transactions.", null, 500);
  }
};

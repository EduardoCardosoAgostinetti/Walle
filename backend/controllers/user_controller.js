const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  PutCommand,
  ScanCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamoDB } = require("../config/database");
const apiResponse = require("../config/api_response");

const USERS_TABLE = "Users";

/* ---------------------- Helper function to send emails ---------------------- */
async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });
}

/* ---------------------- Create user ---------------------- */
async function createUser(req, res) {
  try {
    const { full_name, email, password, confirmPassword, username } = req.body;

    if (!full_name || !email || !password || !confirmPassword || !username)
      return apiResponse(res, false, "VALIDATION_ERROR", "All fields are required", null, 400);

    if (password !== confirmPassword)
      return apiResponse(res, false, "PASSWORD_MISMATCH", "Passwords do not match", null, 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return apiResponse(res, false, "INVALID_EMAIL", "Invalid email", null, 400);

    // Check if email already exists
    const existing = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );
    if (existing.Items && existing.Items.length > 0)
      return apiResponse(res, false, "EMAIL_EXISTS", "Email already registered", null, 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const capitalizedFullName = full_name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(" ");

    const activationToken = jwt.sign({ id, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await dynamoDB.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: {
          id,
          full_name: capitalizedFullName,
          email,
          username,
          password: hashedPassword,
          isActive: false,
          createdAt: new Date().toISOString(),
        },
      })
    );

    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;
    await sendEmail(
      email,
      "Activate your account",
      `<p>Hello ${capitalizedFullName},</p><p>Click the link to activate your account:</p><a href="${activationLink}">Activate account</a>`
    );

    return apiResponse(res, true, "USER_CREATED", "User created successfully", { id }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return apiResponse(res, false, "USER_CREATE_ERROR", "Error creating user", error.message, 500);
  }
}

/* ---------------------- Activate account ---------------------- */
async function activateUser(req, res) {
  try {
    const { token } = req.query;

    if (!token)
      return apiResponse(res, false, "MISSING_TOKEN", "Activation token not provided", null, 400);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": decoded.email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0)
      return apiResponse(res, false, "USER_NOT_FOUND", "User not found", null, 404);

    const user = userResult.Items[0];
    if (user.isActive)
      return apiResponse(res, true, "ALREADY_ACTIVE", "Account is already active", null, 200);

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id: user.id },
        UpdateExpression: "set isActive = :a",
        ExpressionAttributeValues: { ":a": true },
      })
    );

    return apiResponse(res, true, "ACCOUNT_ACTIVATED", "Account activated successfully", null, 200);
  } catch (error) {
    console.error("Error activating account:", error);
    return apiResponse(res, false, "ACTIVATE_ERROR", "Error activating account", error.message, 500);
  }
}

/* ---------------------- Login ---------------------- */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return apiResponse(res, false, "VALIDATION_ERROR", "Email and password are required", null, 400);

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0)
      return apiResponse(res, false, "USER_NOT_FOUND", "User not found", null, 404);

    const user = userResult.Items[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return apiResponse(res, false, "INVALID_PASSWORD", "Incorrect password", null, 401);

    if (!user.isActive)
      return apiResponse(res, false, "INACTIVE_ACCOUNT", "Activate your account before logging in", null, 403);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return apiResponse(res, true, "LOGIN_SUCCESS", "Login successful", { token }, 200);
  } catch (error) {
    console.error("Error during login:", error);
    return apiResponse(res, false, "LOGIN_ERROR", "Error logging in", error.message, 500);
  }
}

/* ---------------------- Forgot password ---------------------- */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0)
      return apiResponse(res, false, "USER_NOT_FOUND", "User not found", null, 404);

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Password reset",
      `<p>Click the link to reset your password:</p><a href="${resetLink}">Reset password</a>`
    );

    return apiResponse(res, true, "RESET_LINK_SENT", "Password reset link sent to your email", null, 200);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return apiResponse(res, false, "FORGOT_PASSWORD_ERROR", "Error sending email", error.message, 500);
  }
}

/* ---------------------- Reset password ---------------------- */
async function resetPassword(req, res) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token)
      return apiResponse(res, false, "MISSING_TOKEN", "Token not provided", null, 400);

    if (password !== confirmPassword)
      return apiResponse(res, false, "PASSWORD_MISMATCH", "Passwords do not match", null, 400);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": decoded.email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0)
      return apiResponse(res, false, "USER_NOT_FOUND", "User not found", null, 404);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userResult.Items[0];

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id: user.id },
        UpdateExpression: "set password = :p",
        ExpressionAttributeValues: { ":p": hashedPassword },
      })
    );

    return apiResponse(res, true, "PASSWORD_UPDATED", "Password updated successfully", null, 200);
  } catch (error) {
    console.error("Error resetting password:", error);
    return apiResponse(res, false, "RESET_PASSWORD_ERROR", "Error resetting password", error.message, 500);
  }
}

/* ---------------------- Update full name ---------------------- */
async function updateFullName(req, res) {
  try {
    const { id } = req.user;
    const { full_name } = req.body;

    const capitalizedName = full_name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(" ");

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set full_name = :n",
        ExpressionAttributeValues: { ":n": capitalizedName },
      })
    );

    return apiResponse(res, true, "NAME_UPDATED", "Full name updated successfully", null, 200);
  } catch (error) {
    console.error("Error updating full name:", error);
    return apiResponse(res, false, "UPDATE_NAME_ERROR", "Error updating full name", error.message, 500);
  }
}

/* ---------------------- Update email ---------------------- */
async function updateEmail(req, res) {
  try {
    const { id } = req.user;
    const { email } = req.body;

    const existing = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );

    if (existing.Items && existing.Items.length > 0)
      return apiResponse(res, false, "EMAIL_EXISTS", "Email already registered", null, 400);

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set email = :e",
        ExpressionAttributeValues: { ":e": email },
      })
    );

    return apiResponse(res, true, "EMAIL_UPDATED", "Email updated successfully", null, 200);
  } catch (error) {
    console.error("Error updating email:", error);
    return apiResponse(res, false, "UPDATE_EMAIL_ERROR", "Error updating email", error.message, 500);
  }
}

/* ---------------------- Update username ---------------------- */
async function updateUsername(req, res) {
  try {
    const { id } = req.user;
    const { username } = req.body;

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set username = :u",
        ExpressionAttributeValues: { ":u": username },
      })
    );

    return apiResponse(res, true, "USERNAME_UPDATED", "Username updated successfully", null, 200);
  } catch (error) {
    console.error("Error updating username:", error);
    return apiResponse(res, false, "UPDATE_USERNAME_ERROR", "Error updating username", error.message, 500);
  }
}

/* ---------------------- Update password (authenticated) ---------------------- */
async function updatePassword(req, res) {
  try {
    const { id } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword)
      return apiResponse(res, false, "PASSWORD_MISMATCH", "Passwords do not match", null, 400);

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "id = :id",
        ExpressionAttributeValues: { ":id": id },
      })
    );

    const user = userResult.Items[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword)
      return apiResponse(res, false, "INVALID_PASSWORD", "Current password incorrect", null, 401);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set password = :p",
        ExpressionAttributeValues: { ":p": hashedPassword },
      })
    );

    return apiResponse(res, true, "PASSWORD_UPDATED", "Password updated successfully", null, 200);
  } catch (error) {
    console.error("Error updating password:", error);
    return apiResponse(res, false, "UPDATE_PASSWORD_ERROR", "Error updating password", error.message, 500);
  }
}

module.exports = {
  createUser,
  activateUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateFullName,
  updateEmail,
  updateUsername,
  updatePassword,
};

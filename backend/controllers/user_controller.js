// controllers/userController.js
require("dotenv").config({ path: "../.env", quiet: true });
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { PutCommand, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDB } = require("../config/database");
const apiResponse = require("../config/api_response");

const USERS_TABLE = process.env.USERS_TABLE || "Users";

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function capitalizeFullName(name) {
  if (!name || typeof name !== "string") return name;
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(" ");
}

async function createTransporter() {
  // Keep compatibility with MAIL_* env vars used previously
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

async function sendActivationEmail(toEmail, activationToken) {
  const transporter = await createTransporter();
  const activationLink = `${process.env.FRONTEND_URL}/walle/activate?token=${activationToken}`;

  const mailOptions = {
    from: `"Suporte - Walle" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Ative sua conta - Walle",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;">
        <h2 style="color:#333;margin-bottom:0.2rem;">Ative sua conta</h2>
        <p style="color:#555;">Obrigado por se cadastrar na Walle! Para começar a usar sua conta clique no botão abaixo:</p>
        <a href="${activationLink}" 
           style="display:inline-block;background:#28a745;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;margin-top:10px;">
          Ativar Conta
        </a>
        <p style="color:#777;margin-top:16px;">Se você não solicitou este e-mail, pode ignorar.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <small style="color:#999;">Link válido por 25 minutos.</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendResetPasswordEmail(toEmail, resetToken) {
  const transporter = await createTransporter();
  const resetLink = `${process.env.FRONTEND_URL}/walle/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Suporte - Walle" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Redefinição de senha - Walle",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;">
        <h2 style="color:#333;margin-bottom:0.2rem;">Redefinição de senha</h2>
        <p style="color:#555;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para continuar:</p>
        <a href="${resetLink}"
           style="display:inline-block;background:#ff6b6b;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;margin-top:10px;">
          Redefinir Senha
        </a>
        <p style="color:#777;margin-top:16px;">Se você não solicitou essa ação, ignore este e-mail.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <small style="color:#999;">Link válido por 25 minutos.</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

exports.createUser = async (req, res) => {
  try {
    let { full_name, username, email, password, confirmPassword } = req.body;

    // 1️⃣ Individual field validations
    if (!full_name) return apiResponse(res, false, "MISSING_FULLNAME", "The 'Full Name' field is required.", null, 400);
    if (!username) return apiResponse(res, false, "MISSING_USERNAME", "The 'Username' field is required.", null, 400);
    if (!email) return apiResponse(res, false, "MISSING_EMAIL", "The 'Email' field is required.", null, 400);
    if (!isValidEmail(email)) return apiResponse(res, false, "INVALID_EMAIL", "The provided email is not valid.", null, 400);
    if (!password) return apiResponse(res, false, "MISSING_PASSWORD", "The 'Password' field is required.", null, 400);
    if (!confirmPassword) return apiResponse(res, false, "MISSING_CONFIRM_PASSWORD", "The 'ConfirmPassword' field is required.", null, 400);

    // 2️⃣ Check if passwords match
    if (password !== confirmPassword) return apiResponse(res, false, "PASSWORD_MISMATCH", "Passwords do not match.", null, 400);

    // 3️⃣ Format full name
    full_name = capitalizeFullName(full_name);

    // 4️⃣ Check if email or username already exist (Scan since we're using DynamoDB)
    const existing = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email OR username = :username",
        ExpressionAttributeValues: {
          ":email": email,
          ":username": username,
        },
      })
    );

    if (existing.Items && existing.Items.length > 0) {
      const found = existing.Items[0];
      if (found.email === email) return apiResponse(res, false, "EMAIL_EXISTS", "The provided email is already in use.", null, 409);
      if (found.username === username) return apiResponse(res, false, "USERNAME_EXISTS", "The provided username is already in use.", null, 409);
    }

    // 5️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // 6️⃣ Create user item
    const userItem = {
      id,
      full_name,
      username,
      email,
      password: hashedPassword,
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({ TableName: USERS_TABLE, Item: userItem }));

    // 7️⃣ Generate activation token (25 minutes) and send email
    const activationToken = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "25m" });
    await sendActivationEmail(email, activationToken);

    return apiResponse(res, true, "USER_CREATED_SUCCESS", "User created successfully. Check your email for activation link.", {
      id,
      full_name,
      username,
      email,
    }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return apiResponse(res, false, "SERVER_ERROR", "Error creating user.", null, 500);
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return apiResponse(res, false, "MISSING_TOKEN", "Activation token not provided.", null, 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return apiResponse(res, false, "INVALID_TOKEN", "Activation token is invalid or expired.", null, 400);
    }

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": decoded.email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0) return apiResponse(res, false, "USER_NOT_FOUND", "User not found.", null, 404);

    const user = userResult.Items[0];
    if (user.isActive) return apiResponse(res, false, "ALREADY_ACTIVE", "Account is already active.", null, 201);

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id: user.id },
        UpdateExpression: "set isActive = :a",
        ExpressionAttributeValues: { ":a": true },
      })
    );

    return apiResponse(res, true, "ACCOUNT_ACTIVATED", "Account activated successfully.", null, 200);
  } catch (error) {
    console.error("Error activating account:", error);
    return apiResponse(res, false, "ACTIVATE_ERROR", "Error activating account.", null, 500);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validations
    if (!email) return apiResponse(res, false, "MISSING_EMAIL", "The 'Email' field is required.", null, 400);
    if (!isValidEmail(email)) return apiResponse(res, false, "INVALID_EMAIL", "The provided email is not valid.", null, 400);
    if (!password) return apiResponse(res, false, "MISSING_PASSWORD", "The 'Password' field is required.", null, 400);

    // 2️⃣ Find user
    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0) return apiResponse(res, false, "USER_NOT_FOUND", "No user found with this email.", null, 404);

    const user = userResult.Items[0];

    // 3️⃣ Check if active
    if (!user.isActive) {
      const activationToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "25m" });
      await sendActivationEmail(user.email, activationToken);
      return apiResponse(res, false, "USER_NOT_ACTIVE", "User account is not activated. Check your email for activation link.", null, 403);
    }

    // 4️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return apiResponse(res, false, "INVALID_PASSWORD", "Incorrect password.", null, 401);

    // 5️⃣ Generate JWT (1 day)
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return apiResponse(res, true, "LOGIN_SUCCESS", "Logged in successfully.", {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      token,
    }, 200);
  } catch (error) {
    console.error("Error logging in:", error);
    return apiResponse(res, false, "SERVER_ERROR", "Error logging in.", null, 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return apiResponse(res, false, "MISSING_EMAIL", "The 'Email' field is required.", null, 400);
    if (!isValidEmail(email)) return apiResponse(res, false, "INVALID_EMAIL", "The provided email is not valid.", null, 400);

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0) return apiResponse(res, false, "USER_NOT_FOUND", "No user found with this email.", null, 404);

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "25m" });
    await sendResetPasswordEmail(email, resetToken);

    return apiResponse(res, true, "RESET_LINK_SENT", "Password reset link sent to your email.", null, 200);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return apiResponse(res, false, "FORGOT_PASSWORD_ERROR", "Error sending password reset email.", null, 500);
  }
};

function generateJWT(user) {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    full_name: user.full_name,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token) return apiResponse(res, false, "MISSING_TOKEN", "Token not provided.", null, 400);
    if (!newPassword || !confirmPassword) return apiResponse(res, false, "MISSING_PASSWORDS", "Password and confirmation are required.", null, 400);
    if (newPassword !== confirmPassword) return apiResponse(res, false, "PASSWORD_MISMATCH", "Passwords do not match.", null, 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return apiResponse(res, false, "INVALID_TOKEN", "Reset token is invalid or expired.", null, 400);
    }

    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email",
        ExpressionAttributeValues: { ":email": decoded.email },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0) return apiResponse(res, false, "USER_NOT_FOUND", "User not found.", null, 404);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = userResult.Items[0];

    await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id: user.id },
        UpdateExpression: "set password = :p",
        ExpressionAttributeValues: { ":p": hashedPassword },
      })
    );

    return apiResponse(res, true, "PASSWORD_UPDATED", "Password updated successfully.", null, 200);
  } catch (error) {
    console.error("Error resetting password:", error);
    return apiResponse(res, false, "RESET_PASSWORD_ERROR", "Error resetting password.", null, 500);
  }
};

exports.updateFullName = async (req, res) => {
  try {
    const { id } = req.user; // pega do token
    const { full_name } = req.body;

    if (!full_name) {
      return apiResponse(res, false, "MISSING_FULLNAME", "The 'Full Name' field is required.", null, 400);
    }

    const capitalizedName = capitalizeFullName(full_name);

    // Atualiza e retorna os dados novos
    const updated = await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set full_name = :n",
        ExpressionAttributeValues: { ":n": capitalizedName },
        ReturnValues: "ALL_NEW" // retorna os atributos atualizados
      })
    );

    const updatedUser = updated.Attributes; // usuário atualizado
    const newToken = generateJWT(updatedUser);  // novo JWT

    return apiResponse(res, true, "NAME_UPDATED", "Full name updated successfully.", {token: newToken}, 200);

  } catch (error) {
    console.error("Error updating full name:", error);
    return apiResponse(res, false, "UPDATE_NAME_ERROR", "Error updating full name.", null, 500);
  }
};
exports.updateEmail = async (req, res) => {
  try {
    const { id } = req.user;
    const { email } = req.body;

    if (!email) 
      return apiResponse(res, false, "MISSING_EMAIL", "The 'Email' field is required.", null, 400);
    if (!isValidEmail(email)) 
      return apiResponse(res, false, "INVALID_EMAIL", "The provided email is not valid.", null, 400);

    // Verifica se email já existe
    const existing = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "email = :email AND id <> :id",
        ExpressionAttributeValues: { ":email": email, ":id": id },
      })
    );

    if (existing.Items && existing.Items.length > 0) 
      return apiResponse(res, false, "EMAIL_EXISTS", "Email already registered.", null, 409);

    // Atualiza e retorna usuário atualizado
    const updated = await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set email = :e",
        ExpressionAttributeValues: { ":e": email },
        ReturnValues: "ALL_NEW",
      })
    );

    const updatedUser = updated.Attributes;
    const newToken = generateJWT(updatedUser); 

    return apiResponse(res, true, "EMAIL_UPDATED", "Email updated successfully.", {token: newToken}, 200);

  } catch (error) {
    console.error("Error updating email:", error);
    return apiResponse(res, false, "UPDATE_EMAIL_ERROR", "Error updating email.", null, 500);
  }
};
exports.updateUsername = async (req, res) => {
  try {
    const { id } = req.user;
    const { username } = req.body;

    if (!username) 
      return apiResponse(res, false, "MISSING_USERNAME", "The 'Username' field is required.", null, 400);

    // Verifica se username já existe
    const existing = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "username = :username AND id <> :id",
        ExpressionAttributeValues: { ":username": username, ":id": id },
      })
    );

    if (existing.Items && existing.Items.length > 0) 
      return apiResponse(res, false, "USERNAME_EXISTS", "Username already in use.", null, 409);

    // Atualiza e retorna usuário atualizado
    const updated = await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set username = :u",
        ExpressionAttributeValues: { ":u": username },
        ReturnValues: "ALL_NEW",
      })
    );

    const updatedUser = updated.Attributes;
    const newToken = generateJWT(updatedUser); 

    return apiResponse(res, true, "USERNAME_UPDATED", "Username updated successfully.", {token: newToken}, 200);

  } catch (error) {
    console.error("Error updating username:", error);
    return apiResponse(res, false, "UPDATE_USERNAME_ERROR", "Error updating username.", null, 500);
  }
};
exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) 
      return apiResponse(res, false, "MISSING_PASSWORDS", "All password fields are required.", null, 400);
    if (newPassword !== confirmPassword) 
      return apiResponse(res, false, "PASSWORD_MISMATCH", "New passwords do not match.", null, 400);

    // Pega usuário atual
    const userResult = await dynamoDB.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "id = :id",
        ExpressionAttributeValues: { ":id": id },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0) 
      return apiResponse(res, false, "USER_NOT_FOUND", "User not found.", null, 404);

    const user = userResult.Items[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) 
      return apiResponse(res, false, "INVALID_PASSWORD", "Current password incorrect.", null, 401);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza senha e retorna usuário atualizado
    const updated = await dynamoDB.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "set password = :p",
        ExpressionAttributeValues: { ":p": hashedPassword },
        ReturnValues: "ALL_NEW",
      })
    );

    const updatedUser = updated.Attributes;
    const newToken = generateJWT(updatedUser); 

    return apiResponse(res, true, "PASSWORD_UPDATED", "Password updated successfully.", {token: newToken}, 200);

  } catch (error) {
    console.error("Error updating password:", error);
    return apiResponse(res, false, "UPDATE_PASSWORD_ERROR", "Error updating password.", null, 500);
  }
};



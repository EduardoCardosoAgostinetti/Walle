const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";

const isLocal = ENDPOINT.includes("localhost") || ENDPOINT.includes("127.0.0.1");

const client = new DynamoDBClient({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: isLocal
    ? {
        accessKeyId: "fakeAccessKey",
        secretAccessKey: "fakeSecretKey",
      }
    : undefined,
});

const dynamoDB = DynamoDBDocumentClient.from(client);

module.exports = { dynamoDB };

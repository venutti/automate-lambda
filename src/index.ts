import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.API_URL;

const SECRET_NAME = process.env.SECRET_NAME;
const SECRET_KEY = process.env.SECRET_KEY;

const SECRETS_EXTENSION_PORT =
  process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT;

export const handler = async (event: any = {}): Promise<any> => {
  if (!API_URL) {
    throw new Error("API_URL is not provided");
  }

  if (!SECRET_NAME) {
    throw new Error("SECRET_NAME is not provided");
  }

  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not provided");
  }

  if (!SECRETS_EXTENSION_PORT) {
    throw new Error("SECRETS_EXTENSION_PORT is not provided");
  }

  const secretsResponse = await axios.get(
    `http://localhost:${SECRETS_EXTENSION_PORT}/secretsmanager/get?secretId=${SECRET_NAME}`,
    {
      headers: {
        "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN,
      },
    }
  );

  if (!secretsResponse.data.SecretString) {
    throw new Error("No secret found");
  }

  const secretValue = JSON.parse(secretsResponse.data.SecretString)[SECRET_KEY];

  await axios.put(
    API_URL,
    {},
    {
      headers: {
        "x-order-automation-api-key": secretValue,
      },
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: secretValue }),
  };
};

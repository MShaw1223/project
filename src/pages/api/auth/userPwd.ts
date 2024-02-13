import { NextApiRequest, NextApiResponse } from "next";
import { extractBody } from "@/utils/extractBody";
import zod from "zod";

export const config = {
  runtime: "edge",
};

const schema = zod.object({
  username: zod.string(),
  passwd: zod.string(),
});

export default async function handleUserPwd(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = await extractBody(req);
    const { passwd, username } = schema.parse(body);
    console.log("pwd: ", passwd);
    console.log("user: ", username);
    const sendData = JSON.stringify({
      username,
      passwd,
    });
    const success = await fetch("/api/auth/userPwd", {
      method: "POST",
      body: sendData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (success.ok) {
      res.status(200).json({ success: true });
    } else {
      throw new Error("Error submitting details to database");
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}

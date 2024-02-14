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
  console.log("in handleUserPwd in userPwd.ts");
  try {
    console.log("in the try catch block");
    const body = await extractBody(req);
    const { passwd, username } = schema.parse(body);
    console.log("pwd: ", passwd);
    console.log("user: ", username);
    const sendData = JSON.stringify({
      username,
      passwd,
    });
    const success = await fetch("/api/signup", {
      method: "POST",
      body: sendData,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!success.ok) {
      alert("Issue submitting data");
      throw new Error("Issue with success");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

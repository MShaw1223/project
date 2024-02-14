import { signinFunc } from "@/pages/api/auth/signin";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  config: "edge",
};

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { password, user } = req.body;
    await signinFunc(user, password);
  } catch (error) {
    console.error("Failed to sign in, error: ", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}

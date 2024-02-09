import { NextApiRequest, NextApiResponse } from "next";
import { signupFunc } from "@/utils/signup";

export const config = {
  runtime: "edge",
};

export default async function handleUserPwd(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { passwd, username } = req.body;
    await signupFunc({ passwd, username });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}

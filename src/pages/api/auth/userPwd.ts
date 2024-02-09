import { NextApiRequest, NextApiResponse } from "next";
import { signupFunc } from "@/utils/signUp/signup";

export const config = {
  runtime: "edge",
};

export default async function handleUserPwd(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { passwd, username } = req.body;
    const success = await signupFunc({ passwd, username });
    if (success === true) {
      res.status(200).json({ success: true });
    } else {
      throw new Error("Error submitting details to database");
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}

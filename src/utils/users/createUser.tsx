import { FormEvent } from "react";
import { useMutation } from "react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const config = {
  runtime: "edge",
};

const UserCreate = () => {
  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/userPwd", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to send off new user");
      }
      return response.json();
    },
    onError: (error) => {
      console.error("Mutation error", error);
    },
  });
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.target as HTMLFormElement);
    const username = data.get("username");
    const unhashed_passwd = data.get("passwd");
    const confpasswd = data.get("confpasswd");
    if (confpasswd !== unhashed_passwd) {
      alert("Passwords do not match");
      return;
    } else {
      const dataPackage = JSON.stringify({
        username,
        unhashed_passwd,
      });
      mutation.mutate(dataPackage);
    }
  }

  return (
    <div className="flex items-center justify-center">
      {mutation.isLoading && <p>Creating new user...</p>}
      {!mutation.isLoading && (
        <form onSubmit={handleSubmit}>
          <h1 className="font-bold text-lg underline underline-offset-8">
            New User
          </h1>
          <div className="flex flex-row">
            <div className="p-2">
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Username....."
              />
            </div>
            <div className="p-2">
              <Input
                id="passwd"
                name="passwd"
                type="text"
                placeholder="Password....."
              />
            </div>
          </div>
          <div className="flex flex-row">
            <div className="p-2">
              <Input
                id="confusername"
                name="confusername"
                type="text"
                placeholder="Confirm Username....."
              />
            </div>
            <div className="p-2">
              <Input
                id="confpasswd"
                name="confpasswd"
                type="text"
                placeholder="Confirm Password....."
              />
            </div>
          </div>
          <div className="p-4">
            <Button type="submit" className="w-full">
              New User
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
export default UserCreate;

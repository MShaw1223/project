import { extractBody } from "@/utils/extractBody";
import { useRouter } from "next/router";
import { FormEvent } from "react";
import { useMutation } from "react-query"
import { ComboboxAccount } from "@/components/ui/comboBox";

export default function Home() {

  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (handle: string) => {
      return fetch("/api/pages",{
        method: "POST",
        body: JSON.stringify({ handle })
      })
    },
    onSuccess: async (res) => {
      const body = await extractBody(res);
      const handle = body.handle;
      router.push(`/${handle}`);
    }
  })
  function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    const data = new FormData(event.target as HTMLFormElement)
    const handle = data.get("handle")as string;
    if(!handle)return
    mutation.mutate(handle);
  }
  return (
    <main className="text-centre p-3">
      <div className="flex flex-col items-center">
        <h1 className="m-4 text-4xl font-extrabold dark:text-white">
          Enter data
        </h1>
      </div>
      {mutation.isLoading && <p>Creating Page...</p>}
      {!mutation.isLoading && (
        <div className="w-full flex justify-center">
          <ComboboxAccount></ComboboxAccount>
        </div>)}
    </main>
  )
}

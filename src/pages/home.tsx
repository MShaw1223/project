import { NextPage } from "next";
import Menu from "@/components/ui/menu";
import { FaHome } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

//const datainthetable1 = sql statement
//const datainthetable2 = sql statement
//const datainthetable3 = sql statement
//etc etc add manipulation where needed

const Home: NextPage = () => {
  /*
  have this as a const and then you can do mutations in each div within the table cells?

  const mutation = useMutation({
    mutationFn: async (formData: string) => {
      const response = await fetch("/api/homeSearch", {
        #stuff needed here#
      });
      if (!response.ok) {
        throw new Error("Failed to find trade data");
      }

      return response.json();
    },
    onSettled: () => {
      // Reset any state related to the mutation
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  use a button to trigger mutation manually, work out how to do it on load up
*/

  return (
    <div className="flex h-screen bg-slate-200">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaHome className="h-10 w-10"></FaHome>
          <span className="ml-4 my-auto font-bold">Home</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center ">
          <Table className="bg-slate-400 border-black rounded-full">
            <TableCaption>A Table of your recent Trades.</TableCaption>
            <TableHeader className="ml-2">
              <TableRow>
                <TableHead className="w-[200px] text-slate-200">Trades Taken</TableHead>
                <TableHead className="text-slate-200 text-center">Winning Trades</TableHead>
                <TableHead className="text-slate-200">Win %</TableHead>
                <TableHead className="text-slate-200">Best Pair</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="ml-2">
              <TableRow>
                <TableCell className="font-medium text-slate-200">10</TableCell>
                <TableCell className="text-slate-200">7</TableCell>
                <TableCell className="text-slate-200">70%</TableCell>
                <TableCell className="text-slate-200">EURGBP</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default Home;

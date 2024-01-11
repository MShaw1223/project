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
    <div className="flex h-screen bg-slate-400">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex p-3 text-3xl">
          <FaHome className="h-10 w-10"></FaHome>
          <span className="ml-4 my-auto font-bold">Home</span>
        </div>
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          <Table>
            <TableCaption>A Table of your recent Trades.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Trades Taken</TableHead>
                <TableHead>Winning Trades</TableHead>
                <TableHead>Win %</TableHead>
                <TableHead>Best Pair</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">10</TableCell>
                <TableCell>7</TableCell>
                <TableCell>70%</TableCell>
                <TableCell>EURGBP</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default Home;

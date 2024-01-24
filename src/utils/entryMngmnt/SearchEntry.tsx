import { NextPage } from "next";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const searchEntry: NextPage = () => {
  return (
    <>
      <div className="text-3xl font-semibold p-2">
        <div className="flex-1 overflow-auto p-4 text-justify justify-center">
          <Table className="bg-gray-400 rounded-2xl">
            <TableCaption className="text-gray-500">
              A Table of trades taken.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-200">Trade ID</TableHead>
                <TableHead className="text-slate-200">
                  Other fields...
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>abc</TableCell>
                <TableCell>xyz</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
export default searchEntry;

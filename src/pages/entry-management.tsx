import { NextPage } from "next";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

const EntryManagement: NextPage = () => {
    return(
        <div>
            <div>
            <Link href="/home">
              <FaHome></FaHome>
            </Link>
            </div>
            <div>
                <h1>Entry Management</h1>
                <p>This is where there will be trades searched for, deleted & edited</p>
            </div>
        </div>
    )
}

export default EntryManagement;
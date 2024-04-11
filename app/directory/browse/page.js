import BrowseCard from "./components/BrowseCard"
import { connectDB } from "@/app/lib/database"
export default async function Browse() {

    return (
        <div className="flex  flex-wrap justify-evenly mt-[16px]">
            <BrowseCard/>
            <BrowseCard />
            <BrowseCard />
            <BrowseCard />
        </div>
    )

}
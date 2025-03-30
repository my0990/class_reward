'use client'
import { fetchData } from "@/hooks/swrHooks";

export default function Random() {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    if (isClassLoading ) return <div>Loading data...</div>;
    if (isClassError ) return <div>Error loading data</div>;

    return(
        <div>
            random 
        </div>
    )
}
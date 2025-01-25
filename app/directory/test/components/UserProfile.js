'use client'
import { fetchData} from "@/hooks/swrHooks";
import { useEffect } from "react";
import { mutate } from "swr";
export default function UserProfile() {
  const { swrResult, isLoading, isError, mutateUser } = fetchData('/api/user');
  useEffect(()=>{
    console.log('data: ', swrResult)
  },[swrResult])
  if (isLoading) return <div>Loading user...</div>;
  if (isError) return <div>Error loading user data</div>;

  //   const updateUserName = async () => {
  //     const newName = 'Jane Doe';

  //     mutateUser({ ...user, name: newName }, false); // Optimistic UI
  //     await fetch('/api/user', {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ name: newName }),
  //     });
  //     mutateUser(); // Revalidate data
  //   };
  const updateUserName = () => {
    // 캐시 데이터 직접 수정
    mutate('/api/user', { ...user, userId: 'Jane Doe' }, false);
  };
  return (
    <div>
      {/* <h1>User: {user.userId}</h1> */}
      {/* {swrResult.map((a,i)=>{
        return(
          <div>
            {a.userId}
          </div>
        )
      })} */}
      <button onClick={updateUserName}>Change Name</button>
    </div>
  );
}

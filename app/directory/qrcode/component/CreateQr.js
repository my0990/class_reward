'use client'
import { useRouter } from "next/navigation";
export default function CreateQr(){
    const router = useRouter();
    const submitHandler = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/qrcode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
        //   response.json().then((data) => console.log(data));
          if(response.status === 200){
            window.location.reload();
          }
    }
    return(
        <div>
            <form onSubmit={submitHandler}>
                <div>qr코드를 생성하시겠습니까?</div>
                <button className="btn" type="submit">생성하기</button>
            </form>
        </div>
    )
}
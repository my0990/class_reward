'use client'
import {signOut} from "next-auth/react"

export default function Logout(props){
    const onClick = () => {
        signOut()
    }

    if(props.ismobile === 'true'){
        return(
            <div>
                <li {...props} className='btn' onClick={onClick}>로그아웃</li>
            </div>
        )
    }  else {
        return(
            <li {...props} onClick={onClick}><a>로그아웃</a></li>
        ) 
    }

}
'use client';

import { useRecoilState } from 'recoil';
import { userDataState, sessionDataState, thermometerDataState } from '@/store/atoms';
import { useEffect } from 'react';
export default function Layout({ fetchedUserData, fetchedThermometerData, fetchedSessionData, children }) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [sessionData, setSessionData] = useRecoilState(sessionDataState);
    useEffect(()=>{
        console.log('lay out ')
        setUserData((prev) => ({...prev, ...fetchedUserData}));
        setSessionData((prev) => ({...prev, ...fetchedSessionData}));
    },[])




    return (
        <div>
            {children}
        </div>
    );
}
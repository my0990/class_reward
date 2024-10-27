'use client';

import { useRecoilState } from 'recoil';
import { userDataState, sessionDataState, thermometerDataState } from '@/store/atoms';

export default function Layout({ fetchedUserData, fetchedThermometerData, fetchedSessionData, children }) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [sessionData, setSessionData] = useRecoilState(sessionDataState);
    setUserData(fetchedUserData);
    setSessionData(fetchedSessionData);
    
    return (
        <div>
            {children}
        </div>
    );
}
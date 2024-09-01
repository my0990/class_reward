'use client';

import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { userData, sessionData } from '@/store/atoms';

export default function Layout({ data, session, children }) {
    const [stateData, setStateData] = useRecoilState(userData);
    const [stateSession, setStateSession] = useRecoilState(sessionData);
    // useEffect(() => {
    //     setStateData(data);
    // }, [data, setStateData]);
    setStateData(data);
    setStateSession(session);

    return (
        <div>
            {children}
        </div>
    );
}
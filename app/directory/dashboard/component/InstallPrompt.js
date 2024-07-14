'use client'
import { useState, useEffect } from "react";
import IosPrompt from "./IosPrompt";
import AndroidPrompt from "./AndroidPrompt";

const InstallPrompt = () => {
    const [isShown, setIsShown] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isDenied,setIsDenied] = useState(false);
    useEffect(()=>{
        // console.log('isDenied: ', JSON.parse(localStorage.getItem('a2hsDenied')))
        setIsDenied(JSON.parse(localStorage.getItem('a2hsDenied')));
    },[])


    const handleClick = async () => {
        setIsShown(false);
        if (!deferredPrompt) {
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null); 
    };
    const handleCancelClicked = () => {
        const obj = {    value : 'true',    expire : Date.now() + (1000 * 3600 * 24 * 7)  }   
        const objString = JSON.stringify(obj);

        localStorage.setItem('a2hsDenied', objString);
        setIsDenied(true);
        setDeferredPrompt(null);
    }
    const iosCancelClicked = () =>{
        const obj = {    value : 'true' }   
        const objString = JSON.stringify(obj);

        localStorage.setItem('a2hsDenied', objString);
        setIsDenied(true);
        setDeferredPrompt(null);
    }
    useEffect(() => {
        const isDeviceIOS =
            /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
        setIsIOS(isDeviceIOS);
        const handleBeforeInstallPrompt = e => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsShown(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
        };
    }, []);

    // ... 코드 생략 ...

    if (!isIOS && !isShown) {
        return null;
    }
    // console.log(isDenied)
    return (
        /* 설치 프롬프트 컴포넌트 */
        isDenied  ? null : isIOS  ? <IosPrompt iosCancelClicked={iosCancelClicked}/> : <AndroidPrompt handleClick={handleClick} handleCancelClicked={handleCancelClicked}/>

    );
};

export default InstallPrompt;
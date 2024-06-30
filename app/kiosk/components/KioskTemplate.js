'use client'
import { useRef, useState, useEffect } from 'react';
import KioskHomeTemplate from './KioskHomeTemplate';
import ItemUseTemplate from './ItemUseTemplate';
import ItemBuyTemplate from './ItemBuy';
import CharacterPick from './CharacterPickTeplate';

export default function Kiosk({itemData,studentData}) {
    const [step,setStep] = useState('home');
    const elementRef = useRef(null);


    const enterFullscreen = () => {
        if (elementRef.current.requestFullscreen) {
            elementRef.current.requestFullscreen();
        } else if (elementRef.current.mozRequestFullScreen) { /* Firefox */
            elementRef.current.mozRequestFullScreen();
        } else if (elementRef.current.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            elementRef.current.webkitRequestFullscreen();
        } else if (elementRef.current.msRequestFullscreen) { /* IE/Edge */
            elementRef.current.msRequestFullscreen();
        }
    };
    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, '', location.href);
        };

        history.pushState(null, '', location.href);
        window.addEventListener('popstate', preventGoBack);

        return () => window.removeEventListener('popstate', preventGoBack);
    }, []);

    return (
        <div ref={elementRef} className='h-[100%] min-h-[100vh] bg-orange-100'>

            {step === 'home' ? <KioskHomeTemplate setStep={setStep} enterFullscreen={enterFullscreen}/> : step === 'use' ? <ItemUseTemplate setStep={setStep} itemData={itemData.itemList} studentData={studentData}/> : <ItemBuyTemplate setStep={setStep} itemData={itemData.itemList} studentData={studentData}/>}
            
        </div>
    );
};
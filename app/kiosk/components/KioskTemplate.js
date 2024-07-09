'use client'
import { useRef, useState, useEffect } from 'react';
import KioskHomeTemplate from './KioskHomeTemplate';
import ItemUse from './ItemUse';
import ItemBuy from './ItemBuy';


export default function Kiosk() {
    const [step, setStep] = useState('home');
    const [itemData, setItemData] = useState({});
    const [studentData, setStudentData] = useState([]);
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

    useEffect(() => {
        if (step === 'home') {
            const fetchData = async () => {
                console.log('fetch kiosk data')
                const response = await fetch('/api/fetchKioskData', {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                const result = await response.json();
                console.log(result)
                setItemData(result.itemData);
                setStudentData(result.studentData);



            };

            fetchData();
        }

    }, [step, setStep]);
    return (
        <div ref={elementRef} className='h-[100%] min-h-[100vh] overflow-auto bg-orange-100'>

            {step === 'home' ? <KioskHomeTemplate setStep={setStep} enterFullscreen={enterFullscreen} /> : step === 'use' ? <ItemUse setStep={setStep} itemData={itemData.itemList} studentData={studentData} /> : <ItemBuy setStep={setStep} itemData={itemData.itemList} studentData={studentData} />}

        </div>
    );
};
'use client'
import { useRef, useState, useEffect } from 'react';
import KioskHomeTemplate from './KioskHomeTemplate';
import ItemUse from './use/ItemUse';
import ItemBuy from './buy/ItemBuy';
import Thermometer from './thermometer/Thermometer';
import { useRecoilState } from 'recoil';
import { thermometerDataState,  stepDataState, studentDataState } from '@/store/atoms';


//atom({key:, default:})로 새로운 아톰을 만들 수 있다.
// 이때 key는 각 아톰을 구별하는 고유한 식별자이다.
// default는 initial state를 의미한다.


export default function Kiosk({ fetchedThermometerData, fetchedStudentData }) {
    const elementRef = useRef(null);
    const [thermometerData, setThermometerData] = useRecoilState(thermometerDataState);
    const [stepData, setStepData] = useRecoilState(stepDataState);
    const [studentData, setStudentData] = useRecoilState(studentDataState);
    const {menu} = stepData;
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
        setThermometerData(fetchedThermometerData);
        setStudentData(fetchedStudentData);
    }, [])
    return (
        <div ref={elementRef} className='h-[100%] min-h-[100vh] overflow-auto bg-orange-100'>

            {menu=== 'home'
                ? <KioskHomeTemplate enterFullscreen={enterFullscreen} />
                : menu === 'use'
                    ? <ItemUse />
                    : menu === "thermometer"
                        ? <Thermometer/>
                        : <ItemBuy />}
        </div>
    );
};
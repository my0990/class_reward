'use client'
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import {createBrowserHistory} from 'history';
export default function Kiosk() {
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
            // change start
            history.pushState(null, '', location.href);
            // change end
            console.log('prevent go back!');
        };

        history.pushState(null, '', location.href);
        window.addEventListener('popstate', preventGoBack);

        return () => window.removeEventListener('popstate', preventGoBack);
    }, []);

    return (
        <div ref={elementRef} className='bg-white'>
            <button
                onClick={enterFullscreen}
            >
                Enter Fullscreen
            </button>


        </div>
    );
};
'use client'
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import {createBrowserHistory} from 'history';
export default function Kiosk() {
    const elementRef = useRef(null);
    const router = useRouter();

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

    // const history = createBrowserHistory();
    // // 1. history라는 상수에 createBrowerHistory 함수를 할당한다.

    // const preventGoBack = () => {
    //     // 2. custom hook에서 실행될 함수를 생성하고, 함수명을 preventGoBack으로 설정한다.
    //     history.push(null, '', history.location.href);
    //     // 2-1. 현재 상태를 세션 히스토리 스택에 추가(push)한다.
    //     alert('뒤로 갈 수 없닭! 🐓');
    //     // 2-2. 토스트 메세지를 출력한다.
    // };

    // // 브라우저에 렌더링 시 한 번만 실행하는 코드
    // useEffect(() => {
    //     (() => {
    //         history.push(null, '', history.location.href);
    //         // 3. 렌더링 완료 시 현재 상태를 세션 히스토리 스택에 추가(push)한다.
    //         window.addEventListener('popstate', preventGoBack);
    //         // 3-1. addEventListener를 이용해 "popstate"라는 이벤트를 감지하게 한다.
    //         // 3-2. popstate 이벤트를 감지했을 때 preventGoBack 함수가 실행된다.
    //     })();

    //     return () => {
    //         window.removeEventListener('popstate', preventGoBack);
    //         // 3-3. 렌더링이 끝난 이후엔 eventListner을 제거한다.
    //     };
    // }, []);

    // useEffect(() => {
    //     history.push(null, '', history.location.href);
    //     // 4-1. 현재 상태를 세션 히스토리 스택에 추가(push)한다.
    // }, [history.location]);
    // // 4. history.location (pathname)이 변경될때마다,



   



    return (
        <div ref={elementRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <button

                style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}
            >
                Enter Fullscreen
            </button>

            {/* 전체화면 콘텐츠 */}
            <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}>
                <h1>Fullscreen Content</h1>
            </div>
        </div>
    );
};
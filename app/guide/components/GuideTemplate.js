'use client'
import { useEffect } from "react";

export default function GuideTemplate() {
    useEffect(() => {
        const preventExit = () => {
          if (!document.fullscreenElement) {
            enterFullscreen();
          }
        };
    
        // Add event listeners to prevent exiting fullscreen mode
        document.addEventListener('fullscreenchange', preventExit);
        document.addEventListener('webkitfullscreenchange', preventExit);
        document.addEventListener('mozfullscreenchange', preventExit);
        document.addEventListener('MSFullscreenChange', preventExit);
    
        return () => {
          document.removeEventListener('fullscreenchange', preventExit);
          document.removeEventListener('webkitfullscreenchange', preventExit);
          document.removeEventListener('mozfullscreenchange', preventExit);
          document.removeEventListener('MSFullscreenChange', preventExit);
        };
      }, []);
    
      const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
          elem.msRequestFullscreen();
        }
      };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', flexDirection: "column" }}>
        <h1>Welcome to the Kiosk</h1>
        <button onClick={enterFullscreen} classname="">Enter Fullscreen Mode</button>
      </div>
    )
}
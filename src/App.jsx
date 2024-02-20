import { useState } from 'react'
import './App.scss'
import { NavBar } from './modules/Navbar/Navbar'
import { ControlBar } from './modules/ControlBar/ControlBar'
import { MapPackProvider } from './contexts/MapPackContext'
import { BeatmapProvider } from './contexts/BeatmapContext'
import { GlobalFileDropArea } from './modules/GlobalFileDropArea/GlobalFileDropArea'

function App() {

    return (
        <MapPackProvider>
            <BeatmapProvider>
                <GlobalFileDropArea />
                <NavBar />
                <div className="main"/>
                <ControlBar />
            </BeatmapProvider>
        </MapPackProvider>
    )
}

export default App

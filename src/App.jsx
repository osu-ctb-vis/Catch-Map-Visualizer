import { useState } from 'react'
import './App.scss'
import { NavBar } from './modules/Navbar/Navbar'
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
                <div className="control-bar"/>
            </BeatmapProvider>
        </MapPackProvider>
    )
}

export default App

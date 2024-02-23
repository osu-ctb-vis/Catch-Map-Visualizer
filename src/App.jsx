import { useState } from 'react'
import './App.scss'
import { NavBar } from './modules/Navbar/Navbar'
import { Main } from './modules/Main/Main'
import { ControlBar } from './modules/ControlBar/ControlBar'
import { MapPackProvider } from './contexts/MapPackContext'
import { BeatmapsProvider } from './contexts/BeatmapsContext'
import { PlayStateProvider } from './contexts/PlayStateContext'
import { GlobalFileDropArea } from './modules/GlobalFileDropArea/GlobalFileDropArea'

function App() {

    return (
        <MapPackProvider>
            <BeatmapsProvider>
                <PlayStateProvider>
                    <GlobalFileDropArea />
                    <NavBar />
                    <Main />
                    <ControlBar />
                </PlayStateProvider>
            </BeatmapsProvider>
        </MapPackProvider>
    )
}

export default App

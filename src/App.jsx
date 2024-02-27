import { useState } from 'react'
import './App.scss'
import { NavBar } from './modules/Navbar/Navbar'
import { Main } from './modules/Main/Main'
import { ControlBar } from './modules/ControlBar/ControlBar'
import { FPSMonitor } from './modules/FPSMonitor/FPSMonitor'
import { MapPackProvider } from './contexts/MapPackContext'
import { BeatmapsProvider } from './contexts/BeatmapsContext'
import { PlayStateProvider } from './contexts/PlayStateContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { GlobalFileDropArea } from './modules/GlobalFileDropArea/GlobalFileDropArea'

function App() {

    return (
        <MapPackProvider>
            <BeatmapsProvider>
                <PlayStateProvider>
                    <SettingsProvider>
                        <GlobalFileDropArea />
                        <NavBar />
                        <Main />
                        <ControlBar />
                        <FPSMonitor />
                    </SettingsProvider>
                </PlayStateProvider>
            </BeatmapsProvider>
        </MapPackProvider>
    )
}

export default App

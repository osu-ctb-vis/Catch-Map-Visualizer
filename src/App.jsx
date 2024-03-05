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
import { SKinProvider } from './contexts/SkinContext'
import { GlobalFileDropArea } from './modules/GlobalFileDropArea/GlobalFileDropArea'
import { WIPModel } from './modules/Components/WIPModel/WIPModel'

function App() {

    return (
        <MapPackProvider>
            <BeatmapsProvider>
                <PlayStateProvider>
                    <SKinProvider>
                        <SettingsProvider>
                            <GlobalFileDropArea />
                            <NavBar />
                            <Main />
                            <ControlBar />
                            <FPSMonitor />
                            <WIPModel />
                        </SettingsProvider>
                    </SKinProvider>
                </PlayStateProvider>
            </BeatmapsProvider>
        </MapPackProvider>
    )
}

export default App

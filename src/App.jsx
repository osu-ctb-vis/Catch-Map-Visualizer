import { useState } from 'react'
import './App.scss'
import { NavBar } from './modules/Navbar/Navbar'
import { MapPackProvider } from './contexts/MapPackContext'
import { GlobalFileDropArea } from './modules/GlobalFileDropArea/GlobalFileDropArea'

function App() {

    return (
        <MapPackProvider>
            <GlobalFileDropArea />
            <NavBar />
            <div className="main"/>
            <div className="control-bar"/>
        </MapPackProvider>
    )
}

export default App

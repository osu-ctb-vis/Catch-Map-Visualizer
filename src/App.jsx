import { useState } from 'react'
import './App.scss'
import { NavBar } from './modules/Navbar/Navbar'

function App() {

    return (
        <>
            <NavBar />
            <div className="main"/>
            <div className="control-bar"/>
        </>
    )
}

export default App

import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { DifficultiesSelector } from './DifficultiesSelector'
import { LoadFileButton } from './LoadFileButton'
import { SettingsPanel } from './SettingsPanel'
import { LoginPanel } from './LoginPanel'
import Logo from '../../assets/home.svg';
import './Navbar.scss'

export function NavBar() {
	const mapPack = useContext(MapPackContext).mapPack;

    return (
		<nav className="nav">
			<div className="nav-wrapper nav-left">
				<div className="nav-logo">
					<img src={Logo} alt="Logo" className = "nav-logo-img"/>
					<span className="nav-logo-text">Catch Map Visualizer</span>
				</div>
			</div>
			<div className="nav-wrapper nav-center">
				<div className="nav-beatmap-title">
					{mapPack?.fileName}
				</div>
			</div>
			<div className="nav-wrapper nav-right">
				<DifficultiesSelector/>
				<LoadFileButton/>
				<SettingsPanel/>
				<LoginPanel/>
			</div>
		</nav>
    )
}
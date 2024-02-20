import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { DifficultiesSelector } from './DifficultiesSelector'
import { LoadOszFileButton } from './LoadOszFileButton'
import './Navbar.scss'

export function NavBar() {
	const mapPack = useContext(MapPackContext).mapPack;

    return (
		<nav className="nav">
			<div className="nav-wrapper nav-left">
				<div className="nav-logo">
					ctb Preview
				</div>
			</div>
			<div className="nav-wrapper nav-center">
				<div className="nav-beatmap-title">
					{mapPack?.fileName}
				</div>
			</div>
			<div className="nav-wrapper nav-right">
				<DifficultiesSelector/>
				<LoadOszFileButton/>
			</div>
		</nav>
    )
}

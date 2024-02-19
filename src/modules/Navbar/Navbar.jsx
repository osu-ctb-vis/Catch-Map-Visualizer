import { useContext, useRef } from 'react'
import './Navbar.scss'
import { MapPackContext } from '../../contexts/MapPackContext'

export function NavBar() {
    return (
		<nav className="nav">
			<div className="nav-wrapper nav-left">
				<div className="nav-logo">
					ctb Preview
				</div>
			</div>
			<div className="nav-wrapper nav-center">
				<div className="nav-beatmap-title">
					Emotional
				</div>
			</div>
			<div className="nav-wrapper nav-right">
				<div className="nav-difficulty-selector">
					Insane
				</div>
				<LoadOsuFileButton/>
			</div>
		</nav>
    )
}

function LoadOsuFileButton () {
	const loadOsuFile = useContext(MapPackContext).loadOsuFile;

	const fileInputRef = useRef(null);

	return (
		<button
			className="nav-load-file-button"
			onClick={() => {
				fileInputRef.current.click();				
			}}
		>
			Load .osu file
			<input
				ref={fileInputRef}
				type="file"
				accept=".osu,.zip"
				onChange={(e) => loadOsuFile(e.target.files[0])}
				style={{display: 'none'}}
			/>
		</button>
	)
}
import { useState } from 'react'
import './Navbar.scss'

export function NavBar() {
    return (
		<nav className="nav">
			<div className="nav-wrapper">
				<div className="nav-logo">
					ctb Preview
				</div>
				<div className="nav-beatmap-title">
					Emotional
				</div>
				<div className="nav-difficulty-selector">
					Insane
				</div>
			</div>
		</nav>
    )
}
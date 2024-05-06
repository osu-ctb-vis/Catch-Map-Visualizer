import { useContext, useRef, useState, useEffect } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { AccountContext } from '../../contexts/AccountContext'
import { MdCheckCircle, MdError, MdLogin, MdLogout, MdPerson, MdPersonOutline } from "react-icons/md";
import ClickAwayListener from 'react-click-away-listener';
import clsx from 'clsx';
import './LoginPanel.scss'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function LoginPanel() {
	const { loggedIn, userInfo, setLoggedIn, setUserInfo } = useContext(AccountContext);
	const [open, setOpen] = useState(false);

	const [blockInput, setBlockInput] = useState(false);

	const mapPack = useContext(MapPackContext).mapPack;
	const loaded = !!mapPack?.beatmaps?.length;

	const newWindow = useRef(null);

	const receiveMessage = (event) => {
		if (event.origin !== window.location.origin) return;
		if (event.source !== newWindow.current) return;
		if (event.data?.status === "success") {
			setLoggedIn(true);
			setUserInfo(event.data.userInfo);
			setBlockInput(false);
			setOpen(true);
		} else {
			setBlockInput(false);
			console.error("Login failed", event.data);
		}
	}
	useEffect(() => {
		window.addEventListener("message", receiveMessage);
		return () => {
			window.removeEventListener("message", receiveMessage);
		}
	}, []);


    return (
		<ClickAwayListener onClickAway={() => setOpen(false)}>
			<div
				className={clsx("login-panel", {loaded, open})}		
				onClick={() => {
					if (loggedIn) {
						setOpen((prev) => !prev);
						return;
					}
					if (blockInput) {
						if (!newWindow.current || newWindow.current?.closed) {
							setBlockInput(false);
						} else {
							newWindow.current.focus();
							return;
						}
					}
					try {
						const width = 500;
						const height = 700;
						const left = (window.screen.width - width) / 2;
						const top = (window.screen.height - height) * 0.4;
						newWindow.current = window.open("/auth/osu", "_blank", `width=${width},height=${height},left=${left},top=${top}`);
						setBlockInput(true);
					} catch (e) {
						try {
							newWindow.current = window.open("/auth/osu", "_blank");
							setBlockInput(true);
						} catch (e) {
							window.location.href = "/auth/osu";
						}
					}
			}}>
				{ loggedIn ? <MdPerson /> : <MdPersonOutline /> }
				{
					loggedIn &&
					<div className="login-panel-menu" onClick={(e) => e.stopPropagation()}>
						<div className="login-panel-user">
							<div className="login-panel-user-avatar">
								<img src={userInfo.avatarUrl} alt="Avatar" />
							</div>
							<div className="login-panel-user-userinfo">
								<div className="login-panel-user-name">
									{userInfo.username}
								</div>
								<div className="login-panel-user-id">
									UID: {userInfo.id}
								</div>
							</div>
						</div>
						{ userInfo?.eligible &&
							<div className="login-panel-eligibility-status">
								{
									userInfo?.eligible ? <MdCheckCircle /> : <MdError />
								}
								<div className="login-panel-eligibility-status-text">
									{
										userInfo?.eligible ? "You are eligible to use the best banana path calculation" : "You are not eligible to use the best banana path calculation"
									}
								</div>
							</div>
						}
						<div
							className={clsx("login-panel-logout", { disabled: blockInput })}
							onClick={async () => {
								if (blockInput) return;
								setBlockInput(true);
								const res = await fetch("/api/logout");
								try {
									const json = await res.json();
									setBlockInput(false);
									if (json.status === "success") {
										setLoggedIn(false);
										setUserInfo({});
										setOpen(false);
									}
								} catch (e) {
									console.error(e);
									setBlockInput(false);
								}
							}}
						>
							<MdLogout />
							{
								blockInput ? "Logging out" : "Log out"
							}
						</div>


					</div>
				}
				
			</div>
		</ClickAwayListener>
    )
}
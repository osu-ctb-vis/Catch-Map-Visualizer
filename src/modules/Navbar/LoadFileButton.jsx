import { useContext, useRef, useState } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { MdCancel, MdCheck, MdFolderOpen, MdOutlineDownloading, MdPublic } from 'react-icons/md';
import { WidthTransitionText } from '../Components/WidthTransitionText/WidthTransitionText'
import ClickAwayListener from 'react-click-away-listener';
import useZipLoader from '../../hooks/useZipLoader'
import clsx from 'clsx';
import { downloadBeatmap } from '../../utils/DownloadBeatmap'
import { humanFileSize } from '../../utils/HumanFileSize'
import './LoadFileButton.scss'

const getBeatmapIDFromStr = (str) => {
	str = str.trim();
	if (str.match(/^\d+$/)) {
		return str;
	}
	// https://osu.ppy.sh/beatmapsets/292301#osu/719594
	if (str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/)) {
		return str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/)[1];
	}
	if (str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)/)) {
		return str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)/)[1];
	}
	return null;
}


export function LoadFileButton () {
	const [open, setOpen] = useState(false);
	
	const [inputValue, setInputValue] = useState("");
	
	const [downloading, setDownloading] = useState(false);
	const [downloaded, setDownloaded] = useState(0);
	const [total, setTotal] = useState(0);
	const abortRef = useRef(null);


	const loadZip = useZipLoader();

	const { mapPack } = useContext(MapPackContext);


	const fileInputRef = useRef(null);

	const urlInputRef = useRef(null);


	const loaded = !!mapPack?.beatmaps?.length;

	const download = async () => {
		setTimeout(() => {
			setInputValue("");
		}, 200);
		const id = getBeatmapIDFromStr(inputValue);
		// TODO: Also remember difficulty, and load it after downloading
		if (!id) {
			// TODO: Popup error message
			console.error("Invalid URL");
			setOpen(false);
			return;
		}
		console.log(id);
		let download;
		[download, abortRef.current] = downloadBeatmap(id, (received, total) => {
			setDownloaded(received);
			setTotal(total);
			console.log(received, total);
		}, (data) => {
			loadZip(new File([data], `${id}.osz`));
			setOpen(false);
			setDownloading(false);
			setTimeout(() => {
				setDownloaded(0);
				setTotal(0);
			}, 200);
		}, (error) => {
			console.log("Download error");
			console.error(error);
			// TODO: Popup error message
			setDownloading(false);
			setOpen(false);
			setTimeout(() => {
				setDownloaded(0);
				setTotal(0);
			}, 200);
		});
		setDownloading(true);
		download();
	}


	const active = open || downloading;
	
	const shrunk = loaded & !active;


	return (
		<ClickAwayListener onClickAway={() => {
			if (!downloading) {
				setOpen(false);
			}
		}}>
			<div
				className={clsx("nav-load-file-button", {shrunk, active, downloading})}
				title="Load .osz file"
				onClick={() => {
					fileInputRef.current.click();
				}}
			>
				<MdFolderOpen/>
				<WidthTransitionText hidden={shrunk} style={{paddingLeft: "10px"}}>Load .osz from file</WidthTransitionText>
				<input
					ref={fileInputRef}
					type="file"
					accept=".osz,.olz,.zip"
					onChange={(e) => {
						e.target.files[0] && loadZip(e.target.files[0])
						fileInputRef.current.value = null;
					}}
					style={{display: 'none'}}
				/>
				<div
					className={clsx("load-file-menu", {active, downloading})}
					title=""
					onClick={(e) => e.stopPropagation()}
				>
					<div
						className={clsx("load-from-url-button", {"icon-only": (shrunk)})}
						onClick={() => {
							setOpen(true);
							urlInputRef.current.focus();
						}}
					>
						<MdPublic/>
						<WidthTransitionText hidden={shrunk} style={{paddingLeft: "10px"}}>Load from URL</WidthTransitionText>
						<div className="load-from-url-button-downloading-overlay">
							<MdOutlineDownloading/>
							<WidthTransitionText hidden={shrunk} style={{paddingLeft: "10px"}}>Downloading Beatmap</WidthTransitionText>
						</div>
					</div>
					<div className="load-from-url-panel">
						<input
							type="text"
							placeholder="URL / Beatmap ID"
							ref={urlInputRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									download();
								}
							}}
						/>
						<button
							className="load-from-url-confirm"
							onClick={download}
						>
							<MdCheck/>
						</button>
						<div className="load-from-url-progress-overlay">
							<div className="load-from-url-progress-text">
								{
									total === 0 ?
									"Initalizing..." :
									(`${humanFileSize(downloaded)} / ${humanFileSize(total)}`)
								}
							</div>
							<button
								className="load-from-url-abort"
								title="Cancel"
								onClick={() => {
									if (abortRef.current) {
										abortRef.current();
										abortRef.current = null;
									}
									setDownloading(false);
									setOpen(false);
									setTimeout(() => {
										setDownloaded(0);
										setTotal(0);
									}, 200);
								}}
							>
								<MdCancel/>
							</button>
						</div>
					</div>
					{
						downloading &&
						<div
							className={clsx("load-from-url-progress-bar", {"indeterminate": total === 0})}
							style={{width: `${(downloaded / total * 100) || 0}%`}}
						/>
					}
				</div>
			</div>
		</ClickAwayListener>
	)
}
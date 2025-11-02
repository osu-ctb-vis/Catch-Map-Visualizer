import { useContext, useEffect, useRef, useState } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { SettingsContext } from '../../contexts/SettingsContext';
import { MdCancel, MdCheck, MdFolderOpen, MdOutlineDownloading, MdPublic } from 'react-icons/md';
import { WidthTransitionText } from '../Components/WidthTransitionText/WidthTransitionText'
import ClickAwayListener from 'react-click-away-listener';
import useAutoZipLoader, { useMapPackZipLoader } from '../../hooks/useZipLoader'
import clsx from 'clsx';
import { downloadBeatmap } from '../../utils/DownloadBeatmap'
import { humanFileSize } from '../../utils/HumanFileSize'
import './LoadFileButton.scss'

const getBeatmapIDFromStr = (str) => {
	str = str.trim();
	if (str.match(/^\d+$/)) {
		return {
			id: str,
			diff: null
		};
	}
	// https://osu.ppy.sh/beatmapsets/292301#osu/719594
	if (str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/)) {
		const [id, mode, diff] = str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)#(osu|taiko|fruits|mania)\/(\d+)/).slice(1);
		return { id, diff };
	}
	if (str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)/)) {
		return {
			id: str.match(/osu\.ppy\.sh\/beatmapsets\/(\d+)/)[1],
			diff: null
		};

	}
	return {};
}


export function LoadFileButton() {
	const [open, setOpen] = useState(false);

	const [inputValue, setInputValue] = useState(new URL(window.location).searchParams.get('s') ?? "");

	const [downloading, setDownloading] = useState(false);
	const [downloaded, setDownloaded] = useState(0);
	const [initiated, setInitiated] = useState(false);
	const [total, setTotal] = useState(0);
	const abortRef = useRef(null);


	const loadZip = useAutoZipLoader();
	const loadMapPackZip = useMapPackZipLoader();

	const { mapPack } = useContext(MapPackContext);
	const { beatmapMirror } = useContext(SettingsContext);


	const fileInputRef = useRef(null);

	const urlInputRef = useRef(null);


	const loaded = !!mapPack?.beatmaps?.length;

	useEffect(() => {
		if (window.location.search != '' && initiated == false) {
			setInitiated(true);
			download();
		}
	}, []);


	const download = async () => {
		setTimeout(() => {
			setInputValue("");
		}, 200);
		const {id, diff} = getBeatmapIDFromStr(inputValue);
		if (!id) {
			// TODO: Popup error message
			console.error("Invalid URL", id, diff, inputValue, window.location);
			setOpen(false);
			return;
		}
		console.log(`Downloading beatmap ${id} with diff ${diff} from ${beatmapMirror}`);
		let download;
		[download, abortRef.current] = downloadBeatmap(id, beatmapMirror, (received, total) => {
			setDownloaded(received);
			setTotal(total);
			console.log(received, total);
		}, (data) => {
			loadMapPackZip(new File([data], `${id}.osz`), diff);
			setOpen(false);
			setDownloading(false);

			const updatedURL = new URL(window.location);
			updatedURL.searchParams.set('s', `${id}`);
			window.history.pushState({ href: updatedURL.href }, '', updatedURL.href)

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
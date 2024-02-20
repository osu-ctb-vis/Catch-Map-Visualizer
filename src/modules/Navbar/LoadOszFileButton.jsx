import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { MdFolderOpen } from 'react-icons/md';
import clsx from 'clsx';
import './LoadOszFileButton.scss'


export function LoadOszFileButton () {
	const {mapPack, loadOszFile} = useContext(MapPackContext);

	const fileInputRef = useRef(null);

	const loaded = !!mapPack?.beatmaps?.length;

	return (
		<button
			className={clsx("nav-load-file-button", {"loaded": loaded})}
			title="Load .osz file"
			onClick={() => {
				fileInputRef.current.click();
			}}
		>
			<MdFolderOpen/>
			{ !loaded && <div>Load .osz file</div> }
			<input
				ref={fileInputRef}
				type="file"
				accept=".osz,.olz,.zip"
				onChange={(e) => loadOszFile(e.target.files[0])}
				style={{display: 'none'}}
			/>
		</button>
	)
}
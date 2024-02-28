import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { MdFolderOpen } from 'react-icons/md';
import useZipLoader from '../../hooks/useZipLoader'
import clsx from 'clsx';
import './LoadFileButton.scss'


export function LoadFileButton () {
	const loadZip = useZipLoader();

	const { mapPack } = useContext(MapPackContext);


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
				onChange={(e) => {
					e.target.files[0] && loadZip(e.target.files[0])
					fileInputRef.current.value = null;
				}}
				style={{display: 'none'}}
			/>
		</button>
	)
}
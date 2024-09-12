import { useState, useContext, useRef, useEffect } from 'react'
import clsx from 'clsx';
import useAutoZipLoader from '../../hooks/useZipLoader'
import './GlobalFileDropArea.scss'

export function GlobalFileDropArea() {
	const loadZip = useAutoZipLoader();
	const [dragOver, setDragOver] = useState(false);
	const [isOtherElementDragging, setIsOtherElementDragging] = useState(false);

	const onDragStart = () => {
		setIsOtherElementDragging(true);
	}
	const onDragEnd = () => {
		setIsOtherElementDragging(false);
	}

	useEffect(() => {
		window.addEventListener('dragstart', onDragStart);
		window.addEventListener('dragend', onDragEnd);
		return () => {
			window.removeEventListener('dragstart', onDragStart);
			window.removeEventListener('dragend', onDragEnd);
		}
	}, []);

	const onDragOver = (e) => {
		if (isOtherElementDragging) return;
		e.preventDefault();
		setDragOver(true);
	}
	const onDragLeave = (e) => {
		e.preventDefault();
		setDragOver(false);
	}
	const onDrop = (e) => {
		if (isOtherElementDragging) return;
		e.preventDefault();
		setDragOver(false);
		if (e.dataTransfer.files.length > 0) {
			loadZip(e.dataTransfer.files[0]);
		}
	}

	useEffect(() => {
		window.addEventListener('dragover', onDragOver);
		window.addEventListener('dragleave', onDragLeave);
		window.addEventListener('drop', onDrop);
		return () => {
			window.removeEventListener('dragover', onDragOver);
			window.removeEventListener('dragleave', onDragLeave);
			window.removeEventListener('drop', onDrop);
		}
	}, [isOtherElementDragging]);

	return (
		<div className={clsx("global-file-drop-area", {"drag-over": dragOver})}>
			<div className="global-file-drop-area-text">
				Drop .osu file here
			</div>
		</div>
	)
}
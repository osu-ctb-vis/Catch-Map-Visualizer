import { useEffect, useRef, useLayoutEffect, useState, useContext, useMemo, useCallback } from "react";
import { SettingsContext } from "../../../contexts/SettingsContext";
import { SkinContext } from "../../../contexts/SkinContext";
import { calculatePreempt } from "../../../utils/ApproachRate";
import { PlayStateContext } from "../../../contexts/PlayStateContext";
import { CalculateScaleFromCircleSize, CalculateCatchWidthByCircleSize } from "../../../utils/CalculateCSScale";
import * as PIXI from "pixi.js";
import { OutlineFilter, GlowFilter } from "pixi-filters";
import useRefState from "../../../hooks/useRefState";
import "./ObjectsCanvas.scss";

export function ObjectsCanvas({
	beatmap,
	ctbObjects,
	catcherPath,
	bananaSegmentPaths,
}) {
	const ref = useRef(null);

	const { skin, skinAssets } = useContext(SkinContext);
	const skinComboColours = skin?.comboColours ?? [0xffffff];


	const { verticalScale,
		derandomize,
		hardRock, easy,
		showBananaPathShade
	} = useContext(SettingsContext);
	
	const {playing, playerRef, getPreciseTime} = useContext(PlayStateContext);

	const managerRef = useRef();

	useEffect(() => {
		managerRef.current = new PixiManager(ref.current);
		const manager = managerRef.current;
		manager.setApproachRate(beatmap.difficulty.approachRate);
		manager.setCircleSize(beatmap.difficulty.circleSize);
		manager.setPlayer(playerRef);
		manager.setTimeGetter(getPreciseTime);
		return () => managerRef.current.destory();
	}, []);

	useEffect(() => {
		managerRef.current.setSkinAssets(skinAssets);
	}, [skinAssets]);

	useEffect(() => {
		managerRef.current.setComboColours(skinComboColours);
	}, [skinComboColours]);

	useEffect(() => {
		managerRef.current.setObjects(ctbObjects);
	}, [ctbObjects, catcherPath]);

	useEffect(() => {
		managerRef.current.setBananaSegmentPaths(bananaSegmentPaths);
	}, [bananaSegmentPaths]);

	useEffect(() => {
		managerRef.current.setShowBananaPathShade(showBananaPathShade);
	}, [showBananaPathShade]);

	useEffect(() => {
		managerRef.current.setHardRock(hardRock);
		managerRef.current.setEasy(easy);
		managerRef.current.applyToAllFruits(fruit => fruit.updateSize());
		managerRef.current.redrawBananaPathPolylines();
	}, [hardRock, easy]);

	useEffect(() => {
		managerRef.current.setVerticalScale(verticalScale);
		managerRef.current.redrawBananaPathPolylines();
	}, [verticalScale]);

	useEffect(() => {
		managerRef.current.setDerandomize(derandomize);
	}, [derandomize]);

	useEffect(() => {
		managerRef.current.setRendering(true);
	}, []);


	return (
		<div
			className="objects-canvas"
			ref={ref}
		>
		</div>
	)
}



const binarySearch = (arr, t) => { // Find the first index of the object which time >= t
	let l = 0, r = arr.length - 1;
	while (l < r) {
		let m = Math.floor((l + r) / 2);
		if (arr[m].time < t) l = m + 1;
		else r = m;
	}
	if (arr[l].time < t) return l + 1;
	return l;
}



class PixiManager {
	constructor(parent) {
		if (!parent) return;
		this.rendering = false;


		this.fruits = [];
		this.onScreenFruits = {}; // Dictionary of the objects div that are currently on screen
		this.L = 0; // Left and Right pointers of the all objects array, for better performance [L, R)
		this.R = 0;
		this.lastTime = -1000000; // Last time of the song

		this.bananaPathPolylines = [];

		this.init(parent);
	}
	async init(parent) {
		this.parent = parent;
		this.app = new PIXI.Application();
		await this.app.init({
			resizeTo: parent,
			antialias: true,
			backgroundAlpha: 0
		});
		this.app.canvas.classList.add("pixi-canvas");
		parent.appendChild(this.app.canvas);

		
		const parentResizeObserver = new ResizeObserver(() => {
			window.dispatchEvent(new Event("resize"));
		});
		parentResizeObserver.observe(this.parent);


		this.width = this.app.canvas.offsetWidth;
		this.height = this.app.canvas.offsetHeight;
		const canvasResizeObserver = new ResizeObserver(() => {
			this.width = this?.app?.canvas?.offsetWidth ?? this.parent.offsetWidth;
			this.height = this?.app?.canvas?.offsetHeight ?? this.parent.offsetHeight;
			this.applyToAllFruits(fruit => fruit.updatePosition());
			this.applyToAllFruits(fruit => fruit.updateSize());
			this.redrawBananaPathPolylines();
			
			this.render(true);
		});
		canvasResizeObserver.observe(this.app.canvas);


		this.app.ticker.add(() => {
			if (this.rendering) this.render();
		});
	}
	setApproachRate(approachRate) { this.approachRate = approachRate; }
	setCircleSize(circleSize) { this.circleSize = circleSize; }
	setHardRock(hardRock) { this.hardRock = hardRock; }
	setEasy(easy) { this.easy = easy; }
	setVerticalScale(verticalScale) { this.verticalScale = verticalScale; }
	setDerandomize(derandomize) { this.derandomize = derandomize; }	
	getModdedCircleSize() {
		if (this.hardRock) return Math.min(10, this.circleSize * 1.3);
		if (this.easy) return this.circleSize * 0.5;
		return this.circleSize;
	}
	getModdedApproachRate() {
		if (this.hardRock) return Math.min(10, this.approachRate * 1.4);
		if (this.easy) return this.approachRate * 0.5;
		return this.approachRate;
	}
	getFruitSize() {
		const baseSize = 97; // TODO: Verify this value
		const scale = CalculateScaleFromCircleSize(this.getModdedCircleSize());
		const size = baseSize * scale / 512 * this.width;
		return size;
	}
	getARPreempt() {
		return calculatePreempt(this.getModdedApproachRate());
	}
	getPreempt() {
		//return this.getARPreempt() * this.height / (this.width * (3 / this.verticalScale) / 4);
		return this.getARPreempt() * this.height / (this.width * 3 / 4);
	}
	getCatchWidth() {
		return CalculateCatchWidthByCircleSize(this.getModdedCircleSize());
	}
	getShowBananaPathShade() {
		return this.showBananaPathShade;
	}
	setSkinAssets(skin) {
		this.skinAssets = skin;
		this.applyToAllFruits(fruit => fruit.updateTexture());
	}
	setComboColours(comboColours) {
		this.comboColours = comboColours;
		this.applyToAllFruits(fruit => fruit.updateComboColour());
	}
	setPlayer(playerRef) {
		this.playerRef = playerRef.current;
	}
	setTimeGetter(getTime) {
		this.getTime = getTime;
	}
	setObjects(objects) {
		this.objects = objects;
		//if (this.rendering) this.initFruits();
		for (let i = 0; i < this.objects.length; i++) {
			if (this.fruits[i]) this.fruits[i].setObject(this.objects[i]);
		}
		this.applyToAllFruits(fruit => fruit.updateVisualStyle());
	}
	setBananaSegmentPaths(bananaSegmentPaths) {
		this.bananaSegmentPaths = bananaSegmentPaths;
		if (this.rendering) this.initBananaPathPolylines();
	}
	setShowBananaPathShade(showBananaPathShade) {
		this.showBananaPathShade = showBananaPathShade;
		this.applyToAllPolyLines(polyline => polyline.setVisiblity(showBananaPathShade));
	}
	setRendering(rendering) {
		this.rendering = rendering;
	}

	initFruits() {
		for (const fruit of this.fruits) {
			fruit.destory();
		}
		this.fruits = [];
		for (const obj of this.objects) {
			const fruit = new Fruit(this, obj);
			this.fruits.push(fruit);
		}
	}

	applyToAllFruits(func) {
		for (const fruit of this.fruits) {
			func(fruit);
		}
	}

	initBananaPathPolylines() {
		for (const polyline of this.bananaPathPolylines) {
			polyline.destory();
		}
		this.bananaPathPolylines = [];
		for (const path of this.bananaSegmentPaths) {
			const bananaPathPolyline = new BananaPathPolyline(this, path);
			this.bananaPathPolylines.push(bananaPathPolyline);
		}
	}

	applyToAllPolyLines(func) {
		for (const polyline of this.bananaPathPolylines) {
			func(polyline);
		}
	}

	redrawBananaPathPolylines() {
		if (!this.bananaSegmentPaths) return;
		this.initBananaPathPolylines();
	}

	render(force = false) {
		if (!this.fruits.length) this.initFruits();
		if (!this.bananaPathPolylines.length && this.bananaSegmentPaths?.length) this.initBananaPathPolylines();
		
		const currentTime = this.getTime();
		if (currentTime == this.lastTime && !force) { this.lastTime = currentTime; return; }
		
		// update banana path polylines
		this.applyToAllPolyLines(polyline => polyline.updatePosition());

		// update fruits
		const preempt = this.getPreempt();
		const startTime = currentTime - 200, endTime = currentTime + preempt + 200;
		if (Math.abs(currentTime - this.lastTime) > 20000 || force) {
			//console.log("Jumped");
			this.L = binarySearch(this.objects, startTime);
			for (this.R = this.L; this.R < this.objects.length && this.objects[this.R].time <= endTime; this.R++) {
				const i = this.R;
				this.onScreenFruits[i] = this.fruits[i];
				this.fruits[i].setVisiblity(true);
				this.fruits[i].updatePosition();
			}
			const keys = Object.keys(this.onScreenFruits);
			for (const key of keys) {
				if (key < this.L || key >= this.R) {
					this.onScreenFruits[key].setVisiblity(false);
					delete this.onScreenFruits[key];
				}
			}
			this.lastTime = currentTime;
			return;
		}

		this.lastTime = currentTime;
		while (this.L < this.objects.length && this.objects[this.L].time < startTime) {
			this.fruits[this.L].setVisiblity(false);
			this.L++;
		}
		while (this.L - 1 >= 0 && this.objects[this.L - 1].time >= startTime) {
			this.L--;
		}
		for (this.R = this.L; this.R < this.objects.length && this.objects[this.R].time <= endTime; this.R++) {
			const i = this.R;
			this.onScreenFruits[i] = this.fruits[i];
			this.fruits[i].setVisiblity(true);
			this.fruits[i].updatePosition();
		}
		const keys = Object.keys(this.onScreenFruits);
		for (const key of keys) {
			if (key < this.L || key >= this.R) {
				this.onScreenFruits[key].setVisiblity(false);
				delete this.onScreenFruits[key];
			}
		}
	}

	destory() {
		for (const fruit of this.fruits) {
			fruit.destory();
		}
		if (this?.app?.canvas) this.parent.removeChild(this.app.canvas);
		this.app.destroy();
	}
}


const desaturateFilter = new PIXI.ColorMatrixFilter();
desaturateFilter.saturate(-0.5);

class Fruit {
	constructor(
		manager,
		obj
	){
		this.manager = manager;
		this.time = obj.time;
		this.obj = obj;

		const textureBaseKey = this.getTextureBaseKey();
		this.sprite = new PIXI.Sprite(manager.skinAssets[textureBaseKey]);
		this.sprite.anchor.set(0.5, 0.5);
		if (this.obj.type === "banana") this.sprite.tint = 0xffff00;
		this.overlay = new PIXI.Sprite(manager.skinAssets[textureBaseKey + "-overlay"]);
		this.overlay.anchor.set(0.5, 0.5);
		//this.sprite.addChild(this.overlay);

		this.setVisiblity(false);
		
		this.updateSize();
		this.updateComboColour();
		this.updateVisualStyle();
		
		manager.app.stage.addChild(this.sprite);
		manager.app.stage.addChild(this.overlay);
	}

	setObject(obj) {
		this.obj = obj;
	}

	getTextureBaseKey() {
		if (this.obj.type === "banana") {
			return skinMap["banana"];
		}
		if (this.obj.type === "droplet") {
			return skinMap["droplet"];
		}
		return skinMap[this.obj.visualType];
	}

	updatePosition() {
		let x = this.obj.x / 512 * this.manager.width;
		if (!this.manager.derandomize) x += (this.manager.hardRock ? (this.obj?.xOffsetHR ?? 0) : (this.obj?.xOffset ?? 0)) / 512 * this.manager.width;
		const y = (1 - (this.time - this.manager.getTime()) / this.manager.getPreempt()) * this.manager.height;
		this.sprite.x = this.overlay.x = x;
		this.sprite.y = this.overlay.y = y;

		if (this.obj.type === "banana") {
			const scale = 0.3 + Math.min((this.time - this.manager.getTime()) / this.manager.getARPreempt() * 0.7, 0.7);
			this.bananaScale = scale;
			this.updateSize();
		}
	}
	updateTexture() {
		const textureBaseKey = this.getTextureBaseKey();
		this.sprite.texture = this.manager.skinAssets[textureBaseKey];
		this.overlay.texture = this.manager.skinAssets[textureBaseKey + "-overlay"];
		this.updateSize();
	}
	updateSize() {
		this.sprite.width = this.sprite.height = this.overlay.width = this.overlay.height
		= this.manager.getFruitSize() *
		 (this.obj.type === 'droplet' ? 0.5 : 1) *
		 (this.bananaScale ?? 1);
	}
	updateComboColour() {
		if (this.obj.type === "banana") return;
		this.sprite.tint = this.manager.comboColours[this.obj.combo % this.manager.comboColours.length];
	}
	updateVisualStyle() {
		const spriteFilters = [], overlayFilters = [];
		// Hyperfruit: red outline
		if (this.obj.hyperDashTarget) {
			// TODO: Some skins (default-simple) only have overlay, so we need to add the filters to overlay as well
			spriteFilters.push(...[
				new OutlineFilter(1.75 / 512 * this.manager.width, 0xff0000),
				new GlowFilter({
					innerStrength: 0,
					outerStrength: (1 / 512 * this.manager.width),
					color: 0xff0000
				})
			]);
		}
		// Missed banana: opacity & desaturate
		if (this.obj.bananaMissed) {
			this.sprite.alpha = 0.5;
			spriteFilters.push(desaturateFilter);
			this.overlay.alpha = 0.5;
			overlayFilters.push(desaturateFilter);
		} else {
			this.sprite.alpha = 1;
			this.overlay.alpha = 1;
		}
		this.sprite.filters = spriteFilters;
		this.overlay.filters = overlayFilters;
	}
	setVisiblity(visible) {
		this.sprite.visible = this.overlay.visible = visible;
	}

	destory() {
		this.manager.app.stage.removeChild(this.sprite);
		this.manager.app.stage.removeChild(this.overlay);

		this.sprite.destroy();
		this.overlay.destroy();
	}

}

const skinMap = {
	"pineapple": "fruit-apple",
	"grape": "fruit-grapes",
	"pear": "fruit-pear",
	"raspberry": "fruit-orange",
	"droplet": "fruit-drop",
	"banana": "fruit-bananas"
};

class BananaPathPolyline {
	constructor(
		manager,
		path
	){
		this.manager = manager;
		this.path = path;
		console.log(path);
		this.time = path[0].fromTime;
		this.fromTime = path[0].fromTime;
		this.toTime = path[path.length - 1].toTime;

		const baseTime = this.fromTime;
		const baseX = path[0].fromX;


		this.shade = new PIXI.Graphics();
		this.shade.alpha = 0.25;
		this.shade.zIndex = -1;
		this.outline = new PIXI.Graphics();
		this.outline.alpha = 0.8;
		this.outline.zIndex = 1;

		
		const halfCatcherWidth = this.manager.getCatchWidth() / 2;
		const transformX = x => (x - baseX) / 512 * this.manager.width;
		const transformY = y => - (y - baseTime) / this.manager.getPreempt() * this.manager.height;
		const drawCatcherTrace = (fromX, fromTime, toX, toTime) => {
			// background shade
			this.shade.moveTo(transformX(fromX - halfCatcherWidth), transformY(fromTime));
			this.shade.lineTo(transformX(fromX + halfCatcherWidth), transformY(fromTime));
			this.shade.lineTo(transformX(toX + halfCatcherWidth), transformY(toTime));
			this.shade.lineTo(transformX(toX - halfCatcherWidth), transformY(toTime));
			this.shade.closePath();
			this.shade.fill(0xffff00);
		}
		const drawCatcherOutline = (fromX, fromTime, toX, toTime) => {
			// outline
			this.outline.lineTo(transformX(fromX), transformY(fromTime));
			this.outline.lineTo(transformX(toX), transformY(toTime));
		}

		let i = 0;

		this.outline.moveTo(0, 0);
		
		for (const seg of this.path) {
			i += 1;
			drawCatcherTrace(seg.fromX, seg.fromTime, seg.toX, seg.toTime);
			drawCatcherOutline(seg.fromX, seg.fromTime, seg.toX, seg.toTime);
			if (seg.holdToTime - seg.toTime > 0) {
				drawCatcherTrace(seg.toX, seg.toTime, seg.toX, seg.holdToTime);
				drawCatcherOutline(seg.toX, seg.toTime, seg.toX, seg.holdToTime);
			}
		}
		this.outline.stroke({ color: 0xffffff, width: 2 });

		
		manager.app.stage.addChild(this.shade);
		manager.app.stage.addChild(this.outline);


		this.setVisiblity(manager.getShowBananaPathShade());
		
		this.updatePosition();
		
		manager.app.stage.addChild(this.shade);
	}

	setPath(path) {
		this.path = path;
	}


	updatePosition() {
		let x = this.path[0].fromX / 512 * this.manager.width;
		const y = (1 - (this.time - this.manager.getTime()) / this.manager.getPreempt()) * this.manager.height;
		if (!this.shade) return;
		this.shade.x = this.outline.x = x;
		this.shade.y = this.outline.y = y;
	}

	setVisiblity(visible) {
		this.shade.visible = this.outline.visible = visible;
	}

	destory() {
		this.manager.app.stage.removeChild(this.shade);
		this.manager.app.stage.removeChild(this.outline);
		this.shade.destroy();
		this.outline.destroy();
	}

}
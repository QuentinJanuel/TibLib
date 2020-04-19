interface Vector {
	x: number;
	y: number;
}

export default class TibLib {
	private static isSetup: boolean = false;
	private static hasLoop: boolean = false;
	private static _canvas: HTMLCanvasElement | undefined;
	private static _ctx: CanvasRenderingContext2D | undefined;
	private static _color: string = "black";
	private static _mode: "fill" | "stroke" = "fill";
	private static _FPS: number = 60;
	public static backgroundColor: string = "white";
	private static readonly _mouse: Vector = { x: 0, y: 0 };
	private static left: number = 0;
	private static top: number = 0;
	private static cssDimensions = { x: 0, y: 0 };
	private static keys: {
		[key: string]: {
			pressed: boolean;
			justPressed: boolean;
		};
	} = {};
	public static init (width: number, height: number, title: string) {
		if (TibLib.isSetup)
			throw new Error("You cannot init TibLib multiple times");
		TibLib.isSetup = true;
		TibLib._canvas = document.createElement("canvas");
		const ctx = TibLib.canvas.getContext("2d");
		if (ctx === null)
			throw new Error("Unexpected error when getting the context2D");
		TibLib._ctx = ctx;
		TibLib.ctx.textAlign = "center";
		TibLib.canvas.width = width;
		TibLib.canvas.height = height;
		TibLib.canvas.style.position = "fixed";
		document.body.appendChild(TibLib.canvas);
		document.title = title;
		TibLib.fillBackground();
		window.addEventListener("resize", TibLib.setCanvasSize.bind(this));
		window.addEventListener("mousemove", event => {
			TibLib._mouse.x = (event.x - TibLib.left) * TibLib.width / TibLib.cssDimensions.x;
			TibLib._mouse.y = (event.y - TibLib.top) * TibLib.height / TibLib.cssDimensions.y;
		});
		window.addEventListener("keydown", event => {
			TibLib.keys[event.code] = {
				pressed: true,
				justPressed: true,
			};
		});
		window.addEventListener("keyup", event => {
			TibLib.keys[event.code] = {
				pressed: false,
				justPressed: false,
			};
		});
		TibLib.setCanvasSize();
	}
	private static get canvas (): HTMLCanvasElement {
		if (TibLib._canvas === undefined)
			throw new Error("You need to init TibLib first");
		return TibLib._canvas;
	}
	private static get ctx (): CanvasRenderingContext2D {
		if (TibLib._ctx === undefined)
			throw new Error("You need to init TibLib before drawing anything");
		return TibLib._ctx;
	}
	public static vector (x: number, y: number): Vector {
		return { x, y };
	}
	private static setCanvasSize (): void {
		const ratio = TibLib.width / TibLib.height;
		TibLib.cssDimensions.x = window.innerWidth;
		TibLib.cssDimensions.y = window.innerHeight;
		if (window.innerWidth / window.innerHeight > ratio)
			TibLib.cssDimensions.x = window.innerHeight * ratio;
		else
			TibLib.cssDimensions.y = window.innerWidth / ratio;
		TibLib.canvas.style.width = `${ TibLib.cssDimensions.x }px`;
		TibLib.canvas.style.height = `${ TibLib.cssDimensions.y }px`;
		TibLib.left = (window.innerWidth - TibLib.cssDimensions.x) / 2;
		TibLib.top = (window.innerHeight - TibLib.cssDimensions.y) / 2;
		TibLib.canvas.style.left = `${ TibLib.left }px`;
		TibLib.canvas.style.top = `${ TibLib.top }px`;
	}
	private static fillBackground (): void {
		const backupColor = TibLib.color;
		TibLib.color = TibLib.backgroundColor;
		TibLib.ctx.clearRect(0, 0, TibLib.width, TibLib.height);
		TibLib.drawRectangle(TibLib.vector(0, 0), TibLib.dimensions);
		TibLib.color = backupColor;
	}
	public static get width (): number {
		return TibLib.canvas.width;
	}
	public static get height (): number {
		return TibLib.canvas.height;
	}
	public static get dimensions (): Vector {
		return TibLib.vector(TibLib.width, TibLib.height);
	}
	public static set color (color: string) {
		TibLib.ctx.fillStyle = color;
		TibLib.ctx.strokeStyle = color;
		TibLib._color = color;
	}
	public static get color (): string {
		return TibLib._color;
	}
	public static set mode (mode: "fill" | "stroke") {
		TibLib._mode = mode;
	}
	public static get mode (): "fill" | "stroke" {
		return TibLib._mode;
	}
	public static set lineWidth (lineWidth: number) {
		TibLib.ctx.lineWidth = lineWidth;
	}
	public static get lineWidth (): number {
		return TibLib.ctx.lineWidth;
	}
	public static get center (): Vector {
		return TibLib.vector(TibLib.width / 2, TibLib.height / 2);
	}
	public static set FPS (FPS: number) {
		if (TibLib.hasLoop)
			throw new Error("You need to change the FPS before configuring the loop");
		if (FPS <= 0)
			throw new Error("The FPS has to be a number bigger than 0");
		TibLib._FPS = FPS;
	}
	public static get FPS (): number {
		return TibLib._FPS;
	}
	public static set loop (loop: () => void) {
		if (TibLib.hasLoop)
			throw new Error("TibLib already has a loop");
		TibLib.hasLoop = true;
		setInterval(() => {
			TibLib.fillBackground();
			loop();
			for (const key of Object.keys(TibLib.keys))
				TibLib.keys[key].justPressed = false;
		}, 1000 / TibLib.FPS);
	}
	public static get mouse (): Vector {
		return TibLib._mouse;
	}
	public static isKeyPressed (keyCode: string): boolean {
		const key = TibLib.keys[keyCode];
		if (key === undefined)
			return false;
		return key.pressed;
	}
	public static isKeyJustPressed (keyCode: string): boolean {
		const key = TibLib.keys[keyCode];
		if (key === undefined)
			return false;
		return key.justPressed;
	}
	public static drawRectangle (x: number, y: number, width: number, height: number): void;
	public static drawRectangle (position: Vector, dimensions: Vector): void;
	public static drawRectangle (...args: any): void {
		const drawMethod: "fillRect" | "strokeRect" = TibLib.mode + "Rect" as any;
		if (typeof args[0] === "number")
			TibLib.ctx[drawMethod](args[0], args[1], args[2], args[3]);
		else
			TibLib.ctx[drawMethod](args[0].x, args[0].y, args[1].x, args[1].y);
	}
	public static drawCircle (x: number, y: number, radius: number): void;
	public static drawCircle (center: Vector, radius: number): void;
	public static drawCircle (...args: any): void {
		TibLib.ctx.beginPath();
		if (typeof args[0] === "number")
			TibLib.ctx.arc(args[0], args[1], args[2], 0, 2 * Math.PI);
		else
			TibLib.ctx.arc(args[0].x, args[0].y, args[1], 0, 2 * Math.PI);
		TibLib.ctx.stroke();
		if (TibLib.mode === "fill")
			TibLib.ctx.fill();
	}
	public static drawLine (x1: number, y1: number, x2: number, y2: number): void;
	public static drawLine (from: Vector, to: Vector): void;
	public static drawLine (...args: any): void {
		TibLib.ctx.beginPath();
		if (typeof args[0] === "number") {
			TibLib.ctx.moveTo(args[0], args[1]);
			TibLib.ctx.lineTo(args[2], args[3]);
		} else {
			TibLib.ctx.moveTo(args[0].x, args[0].y);
			TibLib.ctx.lineTo(args[1].x, args[1].y);
		}
		TibLib.ctx.stroke();
	}
	public static drawTriangle (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
	public static drawTriangle (point1: Vector, point2: Vector, point3: Vector): void;
	public static drawTriangle (...args: any): void {
		TibLib.ctx.beginPath();
		if (typeof args[0] === "number") {
			TibLib.ctx.moveTo(args[0], args[1]);
			TibLib.ctx.lineTo(args[2], args[3]);
			TibLib.ctx.lineTo(args[4], args[5]);
		} else {
			TibLib.ctx.moveTo(args[0].x, args[0].y);
			TibLib.ctx.lineTo(args[1].x, args[1].y);
			TibLib.ctx.lineTo(args[2].x, args[2].y);
		}
		TibLib.ctx.closePath();
		TibLib.ctx.stroke();
		if (TibLib.mode === "fill")
			TibLib.ctx.fill();
	}
	public static drawText (x: number, y: number, text: string, size: number): void;
	public static drawText (position: Vector, text: string, size: number): void;
	public static drawText (...args: any): void {
		if (typeof args[0] === "number") {
			TibLib.ctx.font = `${ Math.round(args[3]) }px Arial`;
			TibLib.ctx.fillText(args[2], args[0], args[1]);
		} else {
			TibLib.ctx.font = `${ Math.round(args[2]) }px Arial`;
			TibLib.ctx.fillText(args[1], args[0].x, args[0].y);
		}
	}
}

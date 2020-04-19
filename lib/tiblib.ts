class Vector {
	public x: number;
	public y: number;
	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

export default class TibLib {
	private static exists: boolean = false;
	private hasLoop: boolean = false;
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private _color: string = "black";
	private _mode: "fill" | "stroke" = "fill";
	private _FPS: number = 60;
	private readonly backgroundColor: string = "white";
	private readonly _mouse = new Vector(0, 0);
	private left: number = 0;
	private top: number = 0;
	private cssDimensions = new Vector(0, 0);
	private keys: {
		[key: string]: {
			pressed: boolean;
			justPressed: boolean;
		};
	} = {};
	public constructor (width: number, height: number) {
		if (TibLib.exists)
			throw new Error("You cannot create multiple TibLib");
		TibLib.exists = true;
		this.canvas = document.createElement("canvas");
		const ctx = this.canvas.getContext("2d");
		if (ctx === null)
			throw new Error("Unexpected error when getting the context2D");
		this.ctx = ctx;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.position = "fixed";
		document.body.style.backgroundColor = "black";
		document.body.appendChild(this.canvas);
		this.fillBackground();
		window.addEventListener("resize", this.setCanvasSize.bind(this));
		window.addEventListener("mousemove", event => {
			this._mouse.x = (event.x - this.left) * this.width / this.cssDimensions.x;
			this._mouse.y = (event.y - this.top) * this.height / this.cssDimensions.y;
		});
		window.addEventListener("keydown", event => {
			this.keys[event.code] = {
				pressed: true,
				justPressed: true,
			};
		});
		window.addEventListener("keyup", event => {
			this.keys[event.code] = {
				pressed: false,
				justPressed: false,
			};
		});
		this.setCanvasSize();
	}
	public vector (x: number, y: number): Vector {
		return new Vector(x, y);
	}
	private setCanvasSize (): void {
		const ratio = this.width / this.height;
		this.cssDimensions.x = window.innerWidth;
		this.cssDimensions.y = window.innerHeight;
		if (window.innerWidth / window.innerHeight > ratio)
			this.cssDimensions.x = window.innerHeight * ratio;
		else
			this.cssDimensions.y = window.innerWidth / ratio;
		this.canvas.style.width = `${ this.cssDimensions.x }px`;
		this.canvas.style.height = `${ this.cssDimensions.y }px`;
		this.left = (window.innerWidth - this.cssDimensions.x) / 2;
		this.top = (window.innerHeight - this.cssDimensions.y) / 2;
		this.canvas.style.left = `${ this.left }px`;
		this.canvas.style.top = `${ this.top }px`;
	}
	private fillBackground (): void {
		const backupColor = this.color;
		this.color = this.backgroundColor;
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawRectangle(this.vector(0, 0), this.dimensions);
		this.color = backupColor;
	}
	public get width (): number {
		return this.canvas.width;
	}
	public get height (): number {
		return this.canvas.height;
	}
	public get dimensions (): Vector {
		return this.vector(this.width, this.height);
	}
	public set color (color: string) {
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
		this._color = color;
	}
	public get color (): string {
		return this._color;
	}
	public set mode (mode: "fill" | "stroke") {
		this._mode = mode;
	}
	public get mode (): "fill" | "stroke" {
		return this._mode;
	}
	public set lineWidth (lineWidth: number) {
		this.ctx.lineWidth = lineWidth;
	}
	public get lineWidth (): number {
		return this.ctx.lineWidth;
	}
	public get center (): Vector {
		return this.vector(this.width / 2, this.height / 2);
	}
	public set FPS (FPS: number) {
		if (this.hasLoop)
			throw new Error("You need to change the FPS before configuring the loop");
		if (FPS <= 0)
			throw new Error("The FPS has to be a number bigger than 0");
		this._FPS = FPS;
	}
	public get FPS (): number {
		return this._FPS;
	}
	public set loop (loop: () => void) {
		if (this.hasLoop)
			throw new Error("TibLib already has a loop");
		this.hasLoop = true;
		setInterval(() => {
			this.fillBackground();
			loop();
			for (const key of Object.keys(this.keys))
				this.keys[key].justPressed = false;
		}, 1000 / this.FPS);
	}
	public get mouse (): Vector {
		return this._mouse;
	}
	public isKeyPressed (keyCode: string): boolean {
		const key = this.keys[keyCode];
		if (key === undefined)
			return false;
		return key.pressed;
	}
	public isKeyJustPressed (keyCode: string): boolean {
		const key = this.keys[keyCode];
		if (key === undefined)
			return false;
		return key.justPressed;
	}
	public drawRectangle (position: Vector, dimensions: Vector): void {
		const drawFunction = this.mode === "fill" ? "fillRect" : "strokeRect";
		this.ctx[drawFunction](position.x, position.y, dimensions.x, dimensions.y);
	}
	public drawCircle (center: Vector, radius: number): void {
		this.ctx.beginPath();
		this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
		this.ctx.stroke();
		if (this.mode === "fill")
			this.ctx.fill();
	}
	public drawLine (from: Vector, to: Vector): void {
		this.ctx.beginPath();
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.stroke();
	}
	public drawTriangle (point1: Vector, point2: Vector, point3: Vector): void {
		this.ctx.beginPath();
		this.ctx.moveTo(point1.x, point1.y);
		this.ctx.lineTo(point2.x, point2.y);
		this.ctx.lineTo(point3.x, point3.y);
		this.ctx.closePath();
		this.ctx.stroke();
		if (this.mode === "fill")
			this.ctx.fill();
	}
	public drawText (position: Vector, text: string, size: number): void {
		this.ctx.font = `${ Math.round(size) }px Arial`;
		this.ctx.fillText(text, position.x, position.y);
	}
}

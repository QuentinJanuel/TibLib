import TibLib from "./lib/tiblib";

TibLib.init(800, 600);

TibLib.color = "green";
TibLib.drawRectangle(0, 0, TibLib.width / 3, TibLib.height);

TibLib.color = "red";
TibLib.drawRectangle(TibLib.width * 2 / 3, 0, TibLib.width / 3, TibLib.height);

import TibLib from "./lib/tiblib";

const tb = new TibLib(800, 600);

tb.color = "blue";
tb.drawRectangle(tb.vector(0, 0), tb.vector(tb.width / 3, tb.height));

tb.color = "red";
tb.drawRectangle(tb.vector(tb.width * 2 / 3, 0), tb.vector(tb.width / 3, tb.height));

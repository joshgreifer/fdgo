///
/// <reference types="emscripten" />.



// @ts-ignore
import {Module as em} from "./gnugo.js";
import IO from "./IO";
import Gtp from "./gtp";

//export{};



let m: EmscriptenModule = <EmscriptenModule>{};

m.arguments = [ '--mode', 'gtp'];

export const io = new IO;

export const gtp = new Gtp(io);

// io.on('out-eol', () => {
//     console.log("eol:", io.getOutputLine());
// });
//
// io.on('err-eol', () => {
//     console.warn("err:", io.getErrorLine());
// });

m.preRun = [ IO.prototype.initStreams.bind(io) ];
m.postRun = [];

m.onRuntimeInitialized = (async () => {
    const outputElement: HTMLDivElement = document.querySelector(".console-output") as HTMLDivElement;
    let response: string;
    // response = await gtp.command("help");
    // outputElement.innerHTML = response;
    response = await gtp.command("showboard");
    outputElement.innerHTML = response;
});

export const Module = em(m);






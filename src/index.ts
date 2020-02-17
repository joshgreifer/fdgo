///
/// <reference types="emscripten" />.


import IO from "./IO";

export{};
const statusElement = document.getElementById('status') as HTMLDivElement;
const progressElement = document.getElementById('progress') as HTMLProgressElement;
const spinnerElement = document.getElementById('spinner') as HTMLDivElement;


(<any>window).Module = {};

Module.arguments = [ '--mode', 'gtp'];

const io = new IO;

io.on('out-eol', () => {
    console.log("eol:", io.getOutputLine());
});

io.on('err-eol', () => {
    console.warn("err:", io.getErrorLine());
});

Module.preRun = [ IO.prototype.initStreams.bind(io) ];
Module.postRun = [];




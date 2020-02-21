///
/// <reference types="emscripten" />.


// @ts-ignore
import {Module as em} from "./gnugo.js";
//const em = require(  "./gnugo.js");
import IO from "./IO";
import Gtp, {ParserResult, ResponseType} from "./gtp";
import GameScene from "./scene";

//export{};



let m: EmscriptenModule = <EmscriptenModule>{};

m.arguments = [ '--mode', 'gtp'];
m.noExitRuntime = true;
export const io = new IO;

export const gtp = new Gtp(io);

function initStreams()
{
    io.initStreams();
}

m.preRun = [ initStreams ];
m.postRun = [];

m.onRuntimeInitialized = (async () => { await onRuntimeInitialized() } );


async function doGTPCommand(command: string): Promise<boolean> {
    const outputElement: HTMLDivElement = document.querySelector(".console-output") as HTMLDivElement;
    const response: ParserResult = await gtp.command(command);

        if (response.response_type == ResponseType.BAD)
            outputElement.classList.add('error');
        else
            outputElement.classList.remove('error');

        outputElement.innerHTML = response.html;
        return response.response_type == ResponseType.GOOD;

 }

function setupDOM() {
    const inputElement: HTMLInputElement = document.querySelector("#console-input") as HTMLInputElement;
    inputElement.addEventListener('keyup', async (evt: KeyboardEvent) => {
        if (evt.key === 'Enter')
            if (await doGTPCommand(inputElement.value))
                inputElement.value = '';
    });

    const sceneCanvasElement: HTMLCanvasElement = document.querySelector("#scene-canvas") as HTMLCanvasElement;

    const gameScene = new GameScene(sceneCanvasElement);
    gameScene.startAnimation();

}

const onRuntimeInitialized = async () => {

    io.on('err-eol', () => console.warn(io.getErrorLine()));
    setupDOM();
    await doGTPCommand("name");
};

export const myModule = em(m);




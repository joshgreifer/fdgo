///
/// <reference types="emscripten" />.


// @ts-ignore
import {Module as em} from "./gnugo.js";
//const em = require(  "./gnugo.js");
import IO from "./IO";
import Gtp, {ParserResult, ResponseType} from "./gtp";
import {GoScene} from "./goscene";

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


export async function doGTPCommand(command: string): Promise<boolean> {
    const outputElement: HTMLDivElement = document.querySelector(".console-output") as HTMLDivElement;
    const response: ParserResult = await gtp.command(command);

        if (response.response_type == ResponseType.BAD)
            outputElement.classList.add('error');
        else
            outputElement.classList.remove('error');

        outputElement.innerHTML = response.html;
        return response.response_type == ResponseType.GOOD;

 }





async function setupDOM() {

    const sceneCanvasElement: HTMLCanvasElement = document.querySelector("#scene-canvas") as HTMLCanvasElement;

//     const gameScene = new TestScene(sceneCanvasElement);
//     const gameScene = new SolarSystemScene(sceneCanvasElement);
    const gameScene = new GoScene(sceneCanvasElement);
    await gameScene.load_objects();
    // const positions = [
    //     'A1 A19 K10', // black
    //     'T1 T19 K11'  // white
    // ];
    // gameScene.update_board_from_gtp_list_stones(positions);

    // gameScene.update_board_from_gtp_coord(0, 'A1');
    // gameScene.update_board_from_gtp_coord(1, 'T1');
    // gameScene.update_board_from_gtp_coord(0, 'A19');
    // gameScene.update_board_from_gtp_coord(1, 'T19');
    // gameScene.update_board_from_gtp_coord(0, 'K10');
    gameScene.startAnimation();

    const inputElement: HTMLInputElement = document.querySelector("#console-input") as HTMLInputElement;

    inputElement.addEventListener('keyup', async (evt: KeyboardEvent) => {
        if (evt.key === 'Enter')
            if (await doGTPCommand(inputElement.value)) {
                inputElement.value = '';
                await gameScene.update_board_from_gtp();
            }
    });

    const undoButton: HTMLDivElement = document.querySelector(".undo-icon") as HTMLDivElement;
    undoButton.addEventListener('click', async (evt: MouseEvent) => {
            const resp = await gtp.command('last_move');
            if (resp.text.match(/^white/) ) {
                inputElement.value = 'undo';
                if (await doGTPCommand("undo") && await doGTPCommand("undo")) {
                    gameScene.update_board_from_gtp();
                }
            }

    });


}

const onRuntimeInitialized = async () => {

    io.on('err-eol', () => console.warn(io.getErrorLine()));
    await setupDOM();
    await doGTPCommand("name");
    await doGTPCommand("boardsize 9");
    await doGTPCommand("level 1");

};

export const myModule = em(m);




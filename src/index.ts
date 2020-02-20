///
/// <reference types="emscripten" />.


// @ts-ignore
import {Module as em} from "./gnugo.js";
//const em = require(  "./gnugo.js");
import IO from "./IO";
import Gtp, {ParserResult, ResponseType} from "./gtp";

//export{};



let m: EmscriptenModule = <EmscriptenModule>{};

m.arguments = [ '--mode', 'gtp'];
m.noExitRuntime = true;
export const io = new IO;

export const gtp = new Gtp(io);

// io.on('out-eol', () => {
//     console.log("eol:", io.getOutputLine());
// });
//
// io.on('err-eol', () => {
//     console.warn("err:", io.getErrorLine());
// });
function initStreams()
{
    io.initStreams();
}

m.preRun = [ initStreams ];
m.postRun = [];

m.onRuntimeInitialized = (async () => { await onRuntimeInitialized() } );


function doGTPCommand(command: string): Promise<ParserResult> {
    const outputElement: HTMLDivElement = document.querySelector(".console-output") as HTMLDivElement;
    let response: ParserResult;
    // response = await gtp.command("help");
    // outputElement.innerHTML = response;
    const promise = gtp.command(command);
   promise.then((response: ParserResult) => {
        if (response.response_type == ResponseType.BAD)
            outputElement.classList.add('error');
        else
            outputElement.classList.remove('error');

        outputElement.innerHTML = response.html;

    });
   return promise;
 }

function setUpDomListeners() {
    const inputElement: HTMLInputElement = document.querySelector("#console-input") as HTMLInputElement;
    inputElement.addEventListener('keyup', (evt: KeyboardEvent) => {
        if (evt.key === 'Enter')
//            doEcho(inputElement.value);
            doGTPCommand(inputElement.value);

    });

}

async function onRuntimeInitialized() {
//    await doGTPCommand("\n\nname\nversion\nshowboard") ;
 //   await doGTPCommand("version") ;
    io.on('err-eol', () => console.warn(io.getErrorLine()));
    await doGTPCommand("name") ;

//    await doEcho("hello");
    setUpDomListeners();
}

// function doEcho(command: string): Promise<string> {
//     const outputElement: HTMLDivElement = document.querySelector(".console-output") as HTMLDivElement;
//     let response: ParserResult;
//     const promise = echo(command);
//     promise.then((response: string) => {
//
//         outputElement.innerHTML = response;
//
//     });
//     return promise;
// }
//
// function echo(s: string) : Promise<string> {
//     const outputElement: HTMLDivElement = document.querySelector(".console-output") as HTMLDivElement;
//     io.removeAllListeners('out-c');
//     io.putInputString(s + '\n');
//     return new Promise<string>((resolve, reject) => {
//         io.on('out-c', (c: string) => {
//             if (c === '\n') {
//                 const s = io.getOutputLine() as string;
//                 console.log(s);
//                 resolve(s);
//             }
//
//         });
//     });
// }




export const myModule = em(m);


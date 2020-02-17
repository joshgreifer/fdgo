///
/// <reference types="emscripten" />.
export{};
const statusElement = document.getElementById('status') as HTMLDivElement;
const progressElement = document.getElementById('progress') as HTMLProgressElement;
const spinnerElement = document.getElementById('spinner') as HTMLDivElement;



(<any>window).Module = {};


Module.print = (...args:string[]) => {
    const text = args.join(' ');
    console.log(text);
};

Module.printErr = (...args:string[]) => {
    const text = args.join(' ');
    console.log(text);
};

Module.arguments = [ '--mode', 'gtp'];

function initStreams() {
    const inputBuf = intArrayFromString("help\n", true);
    let inputBufIdx = 0;

    FS.init(
        () => {
            const iCharCode = inputBufIdx > inputBuf.length ? null : inputBuf[inputBufIdx++];
            console.log("I_CHAR:",iCharCode ? String.fromCharCode(iCharCode) : '(null)');
            return  iCharCode;
         },
        (charCode: number) => {
            console.log("O_CHAR:",String.fromCharCode(charCode));
        },
        (charCode: number) => {console.warn("E_CHAR:",String.fromCharCode(charCode)); }
    );
}

Module.preRun = [ initStreams ];
Module.postRun = [];




///
/// <reference types="emscripten" />.
import EventEmitter from 'eventemitter3';
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

const io = new class IO extends EventEmitter {

    readonly inputBuf_: number[] = [];
    readonly outputBuf_: number[] = [];

    i_idx_ = 0;
    o_idx_ = 0;


        putInputString(s: string) {
            Array.prototype.push.apply(this.inputBuf_, intArrayFromString(s, true));
        }

        getInput(): number | null {
            return this.inputBuf_.length ? this.inputBuf_.shift() as number : null;
        }

        putOutput( c: number) {
            this.outputBuf_.push(c);
            this.emit('input', c);
            if (c === '\n'.charCodeAt(0)) {
                this.emit('eol');
            }
        }

        getOutputString() : string | null {
            const s =  intArrayToString(this.outputBuf_);
            this.outputBuf_.splice(0);
            return s;

        }

        getOutputLine() : string | null {
            const s = intArrayToString(this.outputBuf_);
            if (s) {
                const cr_pos = s.indexOf('\n');
                if (cr_pos >= 0) {
                    this.outputBuf_.splice(0, cr_pos+1);
                    return s.substring(0, cr_pos);
                }
            }
            return s;
        }

};

//const io = new IO();

function initStreams() {

    io.putInputString("help\n");
    FS.init(
        () => {
            // const iCharCode = inputBufIdx > inputBuf.length ? null : inputBuf[inputBufIdx++];
            // console.log("I_CHAR:",iCharCode ? String.fromCharCode(iCharCode) : '(null)');
            return  io.getInput();
         },
        (charCode: number) => {
           io.putOutput(charCode);
        },
        (charCode: number) => {console.warn("E_CHAR:",String.fromCharCode(charCode)); }
    );
}

io.on('eol', () => {
    console.log("eol:", io.getOutputLine());
});

Module.preRun = [ initStreams ];
Module.postRun = [];




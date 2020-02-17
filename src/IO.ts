// Low level IO from emscripten
import EventEmitter from "eventemitter3";

export default class IO extends EventEmitter {

    private readonly inBuf_: number[] = [];
    private readonly outBuf_: number[] = [];
    private readonly errBuf_: number[] = [];

    putInputString(s: string) {
        Array.prototype.push.apply(this.inBuf_, intArrayFromString(s, true));
    }

    getInput(): number | null {
        return this.inBuf_.length ? this.inBuf_.shift() as number : null;
    }

    private putOutput_( c: number, buf : number[]) {
        const evt_prefix = buf === this.outBuf_ ? 'out-' : 'err-'
        buf.push(c);
        this.emit(evt_prefix + 'c', c);
        if (c === '\n'.charCodeAt(0)) {
            this.emit(evt_prefix +  'eol');
        }
    }
    putOutput( c: number) {
        this.putOutput_(c, this.outBuf_);
    }
    putError( c: number) {
        this.putOutput_(c, this.errBuf_);
    }



    private getOutputString_(buf: number[]) : string | null {
        const s =  intArrayToString(buf);
        buf.splice(0);
        return s;
    }

   private getOutputLine_(buf: number[]) : string | null {
        const s = intArrayToString(buf);
        if (s) {
            const cr_pos = s.indexOf('\n');
            if (cr_pos >= 0) {
                buf.splice(0, cr_pos+1);
                return s.substring(0, cr_pos);
            }
        }
        return s;
    }
    getOutputLine() :  string | null {
        return this.getOutputLine_(this.outBuf_);
    }
    getErrorLine() :  string | null {
        return this.getOutputLine_(this.errBuf_);
    }

    initStreams() {

        this.putInputString("help\n");
        this.putInputString("showboard\n");

        FS.init(
            () => {
                return this.getInput();
            },
            (charCode: number) => {
                this.putOutput(charCode);
            },
            (charCode: number) => {this.putError(charCode);}
        );
    }

};
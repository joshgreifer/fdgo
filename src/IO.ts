// Low level IO from emscripten
/// <reference types="emscripten" />
import {EventEmitter} from "eventemitter3";
import {Module} from "./index.js";
export default class IO extends EventEmitter {

    private readonly inBuf_: number[] = [];
    private readonly outBuf_: number[] = [];
    private readonly errBuf_: number[] = [];

    putInputString(s: string) {
        Array.prototype.push.apply(this.inBuf_, Module.intArrayFromString(s, true));
    }

    getInput(): number | null {
        return this.inBuf_.length ? this.inBuf_.shift() as number : null;
    }

    private putOutput_( c: number, buf : number[]) {
        const evt_prefix = buf === this.outBuf_ ? 'out-' : 'err-'
        buf.push(c);
        this.emit(evt_prefix + 'c', String.fromCharCode(c));
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
        const s =  Module.intArrayToString(buf);
        buf.splice(0);
        return s == '' ? null : s;
    }

   private getOutputLine_(buf: number[]) : string | null{
        const s = Module.intArrayToString(buf);
        if (s !== '') {
            const cr_pos = s.indexOf('\n');
            if (cr_pos >= 0) {
                buf.splice(0, cr_pos+1);
                return s.substring(0, cr_pos);
            }
        }
        return null;
    }
    getOutputLine() :  string | null {
        return this.getOutputLine_(this.outBuf_);
    }
    getErrorLine() :  string | null {
        return this.getOutputLine_(this.errBuf_);
    }
    getOutputString() :  string | null {
        return this.getOutputString_(this.outBuf_);
    }
    getErrorString() :  string | null {
        return this.getOutputString_(this.errBuf_);
    }
    initStreams() {

        // this.putInputString("help\n");
        // this.putInputString("showboard\n");

        Module.FS.init(
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
// GTP interface
// See http://www.lysator.liu.se/~gunnar/gtp/gtp2-spec-draft2/gtp2-spec.htm

import IO from "./IO";

enum ParserState {
    NOTHING_RECEIVED,
    WAITING_FOR_RESPONSE_CHAR,
    WAITING_FOR_ID,
    WAITING_FOR_FIRST_NEWLINE,
    WAITING_FOR_SECOND_NEWLINE,
    PARSER_ERROR,
    RESPONSE_COMPLETE


};

export enum ResponseType {
    UNKNOWN,
    GOOD,
    BAD
}

export interface ParserResult
{
    command: string;
    response_type: ResponseType;
    id? : number; // command id associated with this response
    text : string;
    html : string;
}

export default class Gtp {


    constructor(private io: IO) {
    }

    private async parse(command: string): Promise<ParserResult>
    {
        let parser_state: ParserState = ParserState.WAITING_FOR_RESPONSE_CHAR;
        const response: ParserResult = {
            command,
            response_type: ResponseType.UNKNOWN,
            text: '',
            html: '',
        };

        const io = this.io;
        let id = 0;
        io.removeAllListeners('out-c');
        io.putInputString(command +"\n");

         return new Promise<ParserResult>((resolve, reject) => {
            io.on('out-c', (c: string) => {
                switch (parser_state) {
                    case ParserState.WAITING_FOR_RESPONSE_CHAR: {
                        if (c === '=') {
                            parser_state = ParserState.WAITING_FOR_ID;
                            response.response_type = ResponseType.GOOD;
                        } else if (c === '?') {
                            parser_state = ParserState.WAITING_FOR_ID;
                            response.response_type = ResponseType.BAD;
                        } else {
                            parser_state = ParserState.PARSER_ERROR;
                            throw new Error("Expected response char, got '" + c + "' (" + c.charCodeAt(0) + ")");
                        }
                        break;
                    }
                    case ParserState.WAITING_FOR_ID: {
                        if (c === ' ') {
                            response.id = id;
                            parser_state = ParserState.WAITING_FOR_FIRST_NEWLINE;
                            io.getOutputString(); // gobble output buffer
                        } else  if (c === '\n') {
                            response.id = id;
                            parser_state = ParserState.WAITING_FOR_SECOND_NEWLINE;
                        } else {
                            const digit = "0123456789".indexOf(c);
                            if (digit >= 0) {
                                id *= 10;
                                id += digit;
                            } else {
                                throw new Error("Expected digit, space or newline, got '" + c + "' (" + c.charCodeAt(0) + ")");

                            }
                        }
                        break;
                    }
                    case ParserState.WAITING_FOR_FIRST_NEWLINE: {
                        if (c === '\n') {
                            parser_state = ParserState.WAITING_FOR_SECOND_NEWLINE;
                        }
                        break;
                    }
                    case ParserState.WAITING_FOR_SECOND_NEWLINE: {
                        if (c === '\n') {
                            parser_state = ParserState.RESPONSE_COMPLETE;
                            // fetch the response
                            let s;
                            while (true) {
                                s = io.getOutputLine();
                                if (s === null)
                                    break;
                                response.text += s + '\n';
                                response.html += s + '<br>';
                            }
                            // strip trailing newlines
                            response.text = response.text.replace(/\n+$/, '');
                            console.log(command);
                            if (response.response_type == ResponseType.GOOD)
                                console.log(response.text);
                            else
                                console.warn(response.text);

                            resolve(response);
                        } else {
                            parser_state = ParserState.WAITING_FOR_FIRST_NEWLINE;  // Didn't receive two consecutive newlines

                        }

                    }

                }
            });
        });

    }

    public static colorToGtpColor(color: number) {  return color == 0 ? 'black' : 'white';}
    public static gtpColorToColor(colorStr: string) {  return colorStr  == 'black' ? 0 : 1; }

    public async command( s: string) : Promise<ParserResult>
    {
        return this.parse(s);

    }
}
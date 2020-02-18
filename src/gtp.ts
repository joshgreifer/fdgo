// GTP interface
import IO from "./IO";

enum ParserState {
    NOTHING_RECEIVED,
    WAITING_FOR_RESPONSE_CHAR,
    WAITING_FOR_FIRST_NEWLINE,
    WAITING_FOR_SECOND_NEWLINE,
    PARSER_ERROR,
    RESPONSE_COMPLETE


};

enum ResponseType {
    UNKNOWN,
    GOOD,
    BAD
}

export default class Gtp {

    private parser_error: Error | null = null;
    private parser_state: ParserState = ParserState.NOTHING_RECEIVED;
    private response_type: ResponseType = ResponseType.UNKNOWN;

    private response_text: string = '';
    private parser_promise?: Promise<boolean>;

    constructor(private io: IO) {
    }

    private async parse(): Promise<boolean>
    {
        const this_ = this;
        return new Promise<boolean>((resolve, reject) => {
            this_.io.on('out-c', (c: string) => {
                switch (this_.parser_state) {
                    case ParserState.WAITING_FOR_RESPONSE_CHAR: {
                        this_.response_text = '';
                        if (c === '=') {
                            this_.parser_state = ParserState.WAITING_FOR_FIRST_NEWLINE;
                            this_.response_type = ResponseType.GOOD;
                        } else if (c === '?') {
                            this_.parser_state = ParserState.WAITING_FOR_FIRST_NEWLINE;
                            this_.response_type = ResponseType.BAD;
                        } else {
                            this_.parser_state = ParserState.PARSER_ERROR;
                            this_.parser_error = new Error("Expected response char, got '" + c + "' (" + c.charCodeAt(0) + ")");
                            reject(this_.parser_error);
                        }
                        break;
                    }
                    case ParserState.WAITING_FOR_FIRST_NEWLINE: {
                        if (c === '\n') {
                            this_.parser_state = ParserState.WAITING_FOR_SECOND_NEWLINE;
                        }
                        break;
                    }
                    case ParserState.WAITING_FOR_SECOND_NEWLINE: {
                        if (c === '\n') {
                            this_.parser_state = ParserState.RESPONSE_COMPLETE;
                            // fetch the response
                            let s;
                            while (s = this_.io.getOutputLine())
                                this_.response_text += s + '<br>';
                            resolve(this_.response_type == ResponseType.GOOD);
                        } else {
                            this_.parser_state = ParserState.WAITING_FOR_FIRST_NEWLINE;  // Didn't receive two consecutive newlines

                        }

                    }

                }
            });
        });

    }
    public async command( s: string) : Promise<string>
    {
        this.parser_state = ParserState.WAITING_FOR_RESPONSE_CHAR;
        this.io.putInputString(s +"\n");
        const response: boolean = await this.parse();
        return this.response_text;

    }
}
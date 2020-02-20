/*
 * Copyright 2011 The Emscripten Authors.  All rights reserved.
 * Emscripten is available under two separate licenses, the MIT license and the
 * University of Illinois/NCSA Open Source License.  Both these licenses can be
 * found in the LICENSE file.
 */

#include <stdio.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

#define BUFSIZE 1000
int main() {
    char line[BUFSIZE];
    FILE* gtp_input = stdin;
    while (1) {
        /* Read a line  */
       if (fgets(line, BUFSIZE, gtp_input)) {
            puts(line);
        } else {
 //           fprintf(stderr, "fgets failed (errno = %d)...\n", errno);
            clearerr(gtp_input);
        }
 //       fprintf(stderr, "sleeping...\n");
        emscripten_sleep(100);

    }
       fprintf(stderr, "main() ended\n");

}
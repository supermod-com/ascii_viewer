/* The MIT License (MIT)
 *
 * Copyright (c) 2015 Oliver Bachmann, Karlsruhe, Germany
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var backgroundRenderedImage;
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function Interpreter(url) {
        var http, buffer, pos, escaped, escapeCode;

		

        

        http = new XMLHttpRequest();
        http.open("GET", url, true);

        http.onreadystatechange = function () {
            
            if (http.readyState === 4) {
                if (http.status === 200) {
					globalPos = 0;
					escapeCode = "";
					globalEscaped = false;
                    globalString = ab2str(http.response);
                    //alert(globalString.length);
					escapesCursor.parse(globalString, {
                    onEscape    : escapesCursor.escape,
                    onLiteral   : modified_write2,
                    onComplete  : function() { 
						// Make sure globalBuffer does not get too long. You have read correctly, globalBuffer must get reset. It's not sure this works.
						
						globalBuffer = new Uint8Array(); 
						globalPos = 0; 
						counter=0; 
						updateScrollbarY(true); // Show a part of the scrollbar again

						// Now we need to copy the rendered image to a buffer or canvas context. We will use this rendered image copy as a starting point to render
						// the remaining image as a canvas while the browser is idle.
						
						canvas = document.getElementById('ansi');
						var width = canvas.width;
						var height = canvas.height;
						

						backgroundRenderedImage=canvas.getContext("2d").getImageData(0,0,width,height);
						renderMoreWhenIdle();


						}
                	});

                   
                } else {
                    throw ("Could not retrieve: " + url);
                }
            }
        };

        http.setRequestHeader("Content-Type", "application/octet-stream");
        http.responseType = "arraybuffer";
        http.send();

		
    }
    
function modified_write2(text) {

    var CR = 0x0d,
                LF = 0x0a,
                cursor = this,
                image_data,
                background,
                foreground,
                charcode,
                x,
                y,
                i,
                length;

            foreground = this.foreground;
			if (this.flags & escapesCursor.BRIGHT) {
					 foreground=foreground+8;
			}

            background = this.background;

            for (i = 0, length = text.length; i < length; i++) {
                charcode = text.charCodeAt(i); // & 0xff;  // truncate to 8 bits
                switch (charcode) {
                case CR:
                    cursor.column = 1;
                    break;

                case LF:
                    cursor.row++;
                    break;

                default:
                   // x = (cursor.column - 1) * 8;
                    // y = (cursor.row + cursor.scrollback - 1) * 16;
                     x = (cursor.column - 1);
					 y = (cursor.row + cursor.scrollback - 1);

					// modified
					// image_data = this.renderChar(charcode, foreground, background);
                    // this.context.putImageData(image_data, x, y);

					// 1 = blue
					// 2 = green
					// 3 = cyan
					// 4 = red
					// 5 = purple
					// 6 = brown
					// 7 = green
					// 8 = light blue
					// 9 = light green
					// 10 = light cyan
					// 11 = light red
					// 12 = light purple
					// 13 = yellow
					// 14 = white
					
					//if (prevy!=y) alert(y);

					//prevy = y;
					// globalContext is = document.getElementById("ansi").getContext("2d");
					codepage.drawChar(globalContext, charcode, foreground, background, x, y); // , transparent, storeCharacter, storeCharacterX) 
					if (cursor.column === 80) {
                        cursor.column = 1;
                        cursor.row++;
                    } else {
                        cursor.column++;
                    }
                    break;
                }
				

// The value of 'row' represents current position relative to the top of the
// screen and therefore cannot exceed 25. Vertical scroll past the 25th line
// increments the scrollback buffer instead.

                if (cursor.row === 26) {
                    cursor.scrollback++;
                    cursor.row--;
                }
            }
        


}

function renderMoreWhenIdle() {

    if (debug==false) return;
	alert("renderMoreWhenIdle interpreter.js "+maxRenderedLine+"/"+screenCharacterArray.length);
	// This is already happening and must get removed. 
	// However, this should get used in combination with screenCharacterArray
	for (var i = maxRenderedLine; i < screenCharacterArray.lenght; i++)
	{
     
	}

	var originalWidth = document.getElementById('ansi').width;

	newCanvas = document.createElement("canvas");
    
    newCanvas.setAttribute("width", originalWidth);
    newCanvas.setAttribute("height", screenCharacterArray.length*16);
            
    var newCanvasContext = newCanvas.getContext("2d");
    newCanvasContext.putImageData(backgroundRenderedImage,0,0);
	// reenable this if you need the copy of the canvas to be actively visible in the browser  
 	// document.body.appendChild(newCanvas);

	// Remove this to show default behaviour
	document.getElementsByTagName("body")[0].style.overflow="auto";

}
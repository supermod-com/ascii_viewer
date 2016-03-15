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

function Interpreter(url, display) {
        var http, buffer, pos, escaped, escapeCode;

		

        

        http = new XMLHttpRequest();
        http.open("GET", url, true);

        http.onreadystatechange = function () {
            
            if (http.readyState === 4) {
                if (http.status === 200) {
					globalPos = 0;
					escapeCode = "";
					globalEscaped = false;
					globalDisplay = display;
                    globalString = ab2str(http.response);
                    //alert(globalString.length);
					escapesCursor.parse(globalString, {
                    onEscape    : escapesCursor.escape,
                    onLiteral   : escapesCursor.modified_write2,
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

function renderMoreWhenIdle() {

	alert(maxRenderedLine+"/"+screenCharacterArray.length);
	for (var i = maxRenderedLine; i < screenCharacterArray.lenght; i++)
	{
     
	}

	var originalWidth = document.getElementById('ansi').width;

	newCanvas = document.createElement("canvas");
    
    newCanvas.setAttribute("width", originalWidth);
    newCanvas.setAttribute("height", screenCharacterArray.length*16);
            
    var newCanvasContext = newCanvas.getContext("2d");
    newCanvasContext.putImageData(backgroundRenderedImage,0,0);
            
    document.body.appendChild(newCanvas);


	document.getElementsByTagName("body")[0].style.overflow="auto";

}
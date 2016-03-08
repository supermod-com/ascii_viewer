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
var animOffsetX = 0;
var animOffsetY = 0;
var scrollDown = 0;
var scrollUp = 0;
var scrollLeft = 0;
var scrollRight = 0;

var bps = 57600;

/** This is just some fancy speed stuff for timeout. Check if this can get made workable again by changing the value to something real and enabling charsAtOnce below **/
var charsAtOnce = 99999;
if (bps == 300)
    charsAtOnce = 20;
else if (bps == 1200)
    charsAtOnce = 80;
else if (bps == 2400)
    charsAtOnce = 160;
else if (bps == 16800)
    charsAtOnce = 6 * 160;
else if (bps == 19200)
    charsAtOnce = 7 * 160;
else if (bps == 57600)
    charsAtOnce = 20 * 160;

var globalBuffer = new Uint8Array();
var escapeCode = "";
var globalEscaped = false;
var globalPos = 0;
// usage:
// instead of setInterval(render, 16) ....

// shim layer with setTimeout fallback
// This makes requestanimframe.js get called all the time
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


(function animloop() {
    requestAnimFrame(animloop);
    render();
})();


/** This function gets always called **/
function render() {

	/** This are global variables. When they get set somewhere, i.e. when scrolling occurs, this gets called. This behaves very much like a setTimeout, so the other functions hopefully are not lacking timeouts **/
    if (scrollDown) { // Scrolling down means the scrollbar scrolls down. The canvas moves up.
        while (scrollDown>0) {
			// Hide the current cursor
            showCharacter(false);
        firstLine++;
        var startX = 0;
        var startY = canvasCharacterHeight;
        var window_innerWidth = ((visibleWidth) * (canvasCharacterWidth));
        var window_innerHeight = ((visibleHeight - scrollBarYShown) * (canvasCharacterHeight));

        var screenWidth = canvasCharacterHeight;

		// Scroll down by copying a whole region
        var imgData = ctx.getImageData(startX, startY, window_innerWidth - canvasCharacterWidth, window_innerHeight - canvasCharacterHeight - 1);
        ctx.putImageData(imgData, 0, 0);

        drawLine(visibleHeight - scrollBarYShown + firstLine - 1, (visibleHeight - scrollBarYShown) - 1);
		// Since the canvas moves 
        updateScrollbarY(1); // parameter: drawTopBlackside
        scrollDown--;
        }
    } else
    if (scrollUp) { // Scrolling up means the scrollbar scrolls up. The canvas moves down.
        while (scrollUp>0) {
			// Hide the current cursor
            showCharacter(false);
        firstLine--;
        var startX = 0;
        var startY = 0;
        var window_innerWidth = ((visibleWidth) * (canvasCharacterWidth)); // Screen width without subtracting any character width, which is not needed
        var window_innerHeight = (visibleHeight - scrollBarYShown) * (canvasCharacterHeight); // We're scrolling up. So this is 

		// Scroll up by copying a whole region
        var imgData = ctx.getImageData(startX, startY, window_innerWidth - canvasCharacterWidth, window_innerHeight - canvasCharacterHeight);
        ctx.putImageData(imgData, 0, canvasCharacterHeight);

		// Now that we have moved everything, we need to redraw the first line. Redrawing the first line means that the first line is not correct.
        drawLine(firstLine, 0);
        updateScrollbarY(0); // parameter: drawTopBlackside
        scrollUp--;
        }
    } else
    if (scrollLeft) {
        while (scrollLeft>0) {
			 // Hide the current cursor
             showCharacter(false);
        leftLine--;
        var startX = 0;

        var window_innerWidth = ((visibleWidth) * (canvasCharacterWidth));
        var window_innerHeight = (visibleHeight * (canvasCharacterHeight));
        console.log("startX:" + startX + " window_innerWidth:" + window_innerWidth);
		// Move a whole region
        var imgData = ctx.getImageData(0, 0, window_innerWidth - canvasCharacterWidth - canvasCharacterWidth, window_innerHeight);
        ctx.putImageData(imgData, canvasCharacterWidth, 0);
        drawVerticalLine(leftLine, 0);

        updateScrollbarX(0); // parameter: drawLeftBlackside
        scrollLeft--;
        }
    } else
    if (scrollRight) { // Scrolling right means the scrollbar moves the the right. The canvas moves to the left side.
    
        while (scrollRight>0) {
			     // Hide the current cursor
                 showCharacter(false);
        leftLine++;
        var startX = canvasCharacterWidth; // maybe 8 pixel

        var window_innerWidth = ((visibleWidth) * (canvasCharacterWidth));
        var window_innerHeight = (visibleHeight * (canvasCharacterHeight));
        console.log("startX:" + startX + " window_innerWidth:" + window_innerWidth);
		// Move a whole region
        var imgData = ctx.getImageData(startX, 0, window_innerWidth - startX - startX, window_innerHeight);
        ctx.putImageData(imgData, 0, 0);

        console.log("visibleWidth+leftLine:" + (visibleWidth + leftLine));
        console.log("visibleWidth:" + visibleWidth);
        drawVerticalLine(visibleWidth + leftLine - 2, visibleWidth - 2);

        updateScrollbarX(1); // parameter: drawLeftBlackside
        scrollRight--;
        }
    } else
	// If doRedraw gets set somewhere, i.e. inside the parser, the whole canvas gets redrawn by drawing characters.
    if (doRedraw) {
        var redrawY = 0;
        while (redrawY < visibleHeight - 1)
        {

            redrawX = 0;
            while (redrawX < visibleWidth - 1) {

                codepage.copyChar(ctx, redrawX + visibleXStart, redrawY + visibleYStart, redrawX, redrawY); // do not store
                redrawX++;
            }
            redrawY++;
        }
        doRedraw = false;


        return;
    }


    var counter = 0;

	// This gets regularly checked
	// If there's inside the queue for us, it gets worked on
	// This might start only from time to time. Then hen esapesCursor.parse has finished parsing. Should the escape.js get implemented differently so more often parsing takes place? I think it's okay this way.
   /* if (globalPos < globalBuffer.length)
    {
		var string = "";
        if ((globalPos < globalBuffer.length) ) { // && (counter < charsAtOnce)) {

            counter++;

			code = globalBuffer[globalPos++];
			escapeCode = String.fromCharCode(code);
			globalString+=escapeCode; // globalString also must get reset!!!
		}

		//alert(globalString.length);
		
	}*/


}

		
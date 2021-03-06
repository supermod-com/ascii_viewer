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
 var xStart = 0;
 var yStart = 0;
 var codepageImg;
 var renderedMaxX=0;
 var renderedMaxY=0;

/** This is functionality for drawing characters on the canvas using the image map **/
function Codepage(codepageUrl, callback) {
        var COLORS, img;
        
        function createCanvas(width, height) {
            
            var newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("width", width);
            newCanvas.setAttribute("height", height);
            
            return newCanvas;
        }
      
		/** Let's load the image map. See interpreter.js **/
        img = new Image();
        img.onload = function () {
            //var i, background;
            characterWidth = 256/32; //img.width / 32;
            characterHeight = 128/8; // img.height / 8;
            codepageImg=img;
            
            callback();
        };
        img.src = codepageUrl;
       

		/** This gets called from modified_write2 from inside escape.js **/
        function drawChar(ctx, asciiCode, foreground, background, x, y, transparent, storeCharacter, storeCharacterX) {
            
           var realY = y;
           if (typeof(storeCharacter)=="number") {
               realY = storeCharacter;
               storeCharacter=true;
           }
           var realX = x;
           if (typeof(storeCharacterX)=="number") {
               realX = storeCharacterX;
               storeCharacter=true;
           }
           
            if (x>=xStart-1) { // xStart is the x value of the scrollbar. For example if we show all characters starting at x = 3.
                if (y>=yStart-1) { // yStart is the y value of the scrollbar. For example if we show all characters starting at y > 5.
                 
						// transparent is only used in conjunction to redraw the cursor. So this is nearly always true - but anyway it might not get called.
                        if ( (typeof(transparent)=="undefined") || (transparent==false) ) {
                         var charArray = new Array();
                         
                         charArray[0]=asciiCode;
                         charArray[1]=foreground;
                         charArray[2]=background;
						 
                        
							// This are checks, otherwise the browser hangs. If it's more efficient to do a try catch then that's okay too.
                            if (typeof(screenCharacterArray[realY])=="undefined") {
                                screenCharacterArray[realY]=new Array();
                               
                                totalVisibleHeight=realY;
                                height=realY;
                                screenCharacterArray[realY][realX]=charArray;
                                drawCharacters.push(new Array(realX, realY));
                                //console.log("Array "+realY);
                                
                                if (renderedMaxX<realX) renderedMaxX=realX;
 							    if (renderedMaxY<realY) renderedMaxY=realY;
                            } else
							// only if storeCharacter is set and storeCharacter==true
                            if ( (typeof(storeCharacter)=="undefined") || (storeCharacter==true) ) {
                                screenCharacterArray[realY][realX]=charArray; // Store the triple array inside the variable screenCharacterArray
                                //console.log("Array 2 "+realY+" "+realX);
									drawCharacters.push(new Array(realX, realY));
									if (renderedMaxX<realX) renderedMaxX=realX;
 							    	if (renderedMaxY<realY) renderedMaxY=realY;
                            } 
                        }
                       
// Drawing then happens in requestanimrame.js, but only if  finishedRendering  is set to true, inside interpreter.js

                        //}
            } // if x >= xStart-1
            } // if y >= yStart-1
			
        }

		 
        /** Creates an own instance of a canvas object with its own context **/
        /*function generateDisplay(width, height) {
            return createCanvas(fullCanvasWidth, fullCanvasHeight);
        }*/

        return { "drawChar": drawChar };
    };
    

function makeCanvasBlack() {

			var bgstring = "#000000";
		   ctx = document.getElementById("ansi").getContext("2d");
		   ctx.fillStyle = bgstring;
		  
		   // clears everything
		   ctx.fillRect(0, 0, document.getElementById('ansi').width, document.getElementById('ansi').height);
		}
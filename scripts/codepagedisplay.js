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
 var maxRenderedLine = 0;
 var codepageImg;

/** This is functionality for drawing characters on the canvas using the image map **/
function Codepage(codepageUrl, callback) {
        var COLORS, img;
        
        function createCanvas(width, height) {
            
            var newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("width", width);
            newCanvas.setAttribute("height", height);
            //canvasCharacterWidth=Math.floor(width/getDisplayWidth());
            //canvasCharacterHeight=Math.floor(height/getDisplayHeight());
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
                                
                            } else
							// only if storeCharacter is set and storeCharacter==true
                            if ( (typeof(storeCharacter)=="undefined") || (storeCharacter==true) ) {
                                screenCharacterArray[realY][realX]=charArray; // Store the triple array inside the variable screenCharacterArray
                                //console.log("Array 2 "+realY+" "+realX);
									drawCharacters.push(new Array(realX, realY));
                            } 
                        }
                       
                        // Working on this:
                        // alert(myx+"/"+x);
						// As you can see, the calculated character from the image gets copied/drawn to the canvas
						// ***********************************************************************************************
						// !!! Possible solution: Move this into requestanimframe.js for working with screenCharacterArray
						// This way, escapesjs.js does not need to get modified and what needs so long for painting is
						// called in a reularly updated interval. So, parsing of ANSI escape codes takes place in 
						// interpreter.js->escapesjs
						// codepagedisplay.js->drawChar
						// but drawing inside requestanimframe.js !!!
						// ***********************************************************************************************
                        

                        //}
            } // if x >= xStart-1
            } // if y >= yStart-1
			
        }
        
        
		 // This gets called inside doRedraw inside requestanimframe.js, don't ask me where doRedraw=true is set.
         function copyChar(ctx, originX, originY, x, y) {
       
           // This is just some information used when scrolling is implemented
            if (x>=xStart-1) {
                if (y>=yStart-1) {
                 
						// Get the character from the array
						if (typeof(screenCharacterArray[originY])=="undefined") return;
						if (typeof(screenCharacterArray[originY][originX])=="undefined") return;
                        var charArray = screenCharacterArray[originY][originX];
						// This is how we read the properties of the specified character at x and y position
						
                        asciiCode=charArray[0];
                        foreground=charArray[1];
                        background=charArray[2];
                        
						/** This again gets converted to real canvas coordinates **/
                        x = (x  ) * parseInt(canvasCharacterWidth);
                        y = (y ) * parseInt( canvasCharacterHeight );
                        
							// First we set the background color
                            var xpos=background;
                           
                            while (xpos >= 16) xpos=xpos-16;
                            // This calculates the position of the block of the image, which has the same characters over and over again with different backgrounds, regarding the y position
                            //console.log(Math.random()+"background:"+background);
                            var ypos = Math.floor(background/16);
                            ///console.log(Math.random()+"ypos:"+ypos);
                          
                            var myasciiCode=219;
                            
                            var myx = (myasciiCode % 32) * characterWidth+(xpos*256);
                            var myy = Math.floor(myasciiCode / 32) * characterHeight + (ypos*128);
                           
						
                            //alert("1:myx="+myx+" myy="+myy+" x="+x+" y="+y+"CW1:"+characterHeight+" canvasCharacterHeight:"+canvasCharacterHeight);
                            ctx.drawImage(codepageImg, myx, myy, characterWidth, characterHeight, x, y, canvasCharacterWidth, canvasCharacterHeight);
                        
                        // Then we do everything that has to do with the foreground color
                        var xpos=foreground;
                        while (xpos >= 16) xpos=xpos-16;
                        var ypos = Math.floor(foreground/16);
                        
                        var myx = (asciiCode % 32) * characterWidth+(xpos*256);
                        var myy = Math.floor(asciiCode / 32) * characterHeight + (ypos*128);
                        //alert(myx+"/"+x);
						
                        ctx.drawImage(codepageImg, myx, myy, characterWidth, characterHeight, x, y, canvasCharacterWidth, canvasCharacterHeight);
            }
            }
        };
        
        

        /** Creates an own instance of a canvas object with its own context **/
        function generateDisplay(width, height) {
            return createCanvas(fullCanvasWidth, fullCanvasHeight);
        }

        return { "drawChar": drawChar, "generateDisplay": generateDisplay, "copyChar" : copyChar };
    };
    


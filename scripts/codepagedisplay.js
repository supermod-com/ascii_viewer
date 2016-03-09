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
 

/** This is functionality for drawing characters on the canvas using the image map **/
function Codepage(codepageUrl, callback) {
        var COLORS, img, codepageImg;
        var overlay=null;

        function createCanvas(width, height) {
            
            var newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("width", width);
            newCanvas.setAttribute("height", height);
            //canvasCharacterWidth=Math.floor(width/getDisplayWidth());
            //canvasCharacterHeight=Math.floor(height/getDisplayHeight());
            return newCanvas;
        }

        /*function copyCanvas(source, color, preserveAlpha) {
            var canvas, ctx, imageData, i;
            canvas = createCanvas(source.width, source.height);
            ctx = canvas.getContext("2d");
            ctx.drawImage(source, 0, 0);
            
            imageData = ctx.getImageData(0, 0, source.width, source.height);
            for (i = 0; i < imageData.data.length; ++i) {
                imageData.data[i++] = COLORS[color][0];
                imageData.data[i++] = COLORS[color][1];
                imageData.data[i++] = COLORS[color][2];
                if (!preserveAlpha) { imageData.data[i] = 255; }
            }
            ctx.putImageData(imageData, 0, 0);
            return canvas;
        }*/
        
        
		/** Let's load the image map. See interpreter.js **/
        img = new Image();
        img.onload = function () {
            //var i, background;
            characterWidth = 256/32; //img.width / 32;
            characterHeight = 128/8; // img.height / 8;
            
            /*codepageImgs = [];
            backgroundImgs = [];
            background = createCanvas(characterWidth, characterHeight);
            for (i = 0; i < COLORS.length; i++) {
                codepageImg = copyCanvas(img, i, true);
                backgroundImg = colorCanvas(background, i, false);
            }*/
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
                         var charArray = Array();
                         
                         charArray[0]=asciiCode;
                         charArray[1]=foreground;
                         charArray[2]=background;
                        
							// This are checks, otherwise the browser hangs. If it's more efficient to do a try catch then that's okay too.
                            if (typeof(screenCharacterArray[realY])=="undefined") {
                                screenCharacterArray[realY]=new Array();
                                totalVisibleHeight=realY;
                                height=realY;
                                screenCharacterArray[realY][realX]=charArray;
                                
                                //console.log("Array "+realY);
                                
                            } else
                            if ( (typeof(storeCharacter)=="undefined") || (storeCharacter==true) ) {
                                screenCharacterArray[realY][realX]=charArray;
                                //console.log("Array 2 "+realY+" "+realX);
                            } 
                        }

						 // I don't remember what this is good for. Maybe search for it?
                         if (this.overlay!=null) {
                                    asciiCode=this.overlay[0];
                                    foreground=this.overlay[1];
                                    background=this.overlay[2];
                                }
                     
						// This calculates the real X coordinates on the canvas
                        x = (x  ) * parseInt(canvasCharacterWidth);

						// This calculates the real Y coordinates on the canvas
                        y = (y ) * parseInt( canvasCharacterHeight );

						// Again a check, used in conjunction with redrawing the cursor. Or maybe something else. Especially when it's about NOT drawing the background color.
                        if ( (typeof(transparent)=="undefined") || (transparent==false) ) {

							// This now calculates the position of the character on the image.
                            var xpos=background;
                           
                            while (xpos >= 16) xpos=xpos-16;
                            // This calculates the position of the block of the image, which has the same characters over and over again with different backgrounds, regarding the y position
                            //console.log(Math.random()+"background:"+background);
                            var ypos = Math.floor(background/16);
                            ///console.log(Math.random()+"ypos:"+ypos);
                          
                            var myasciiCode=219;
                            
                            var myx = (myasciiCode % 32) * characterWidth+(xpos*256);
                            var myy = Math.floor(myasciiCode / 32) * characterHeight + (ypos*128);

                           if (realY < visibleHeight-1) {

						    	// Then the character from the image gets copied to the canvas
                            	//alert("1:myx="+myx+" myy="+myy+" x="+x+" y="+y+"CW1:"+characterHeight+" canvasCharacterHeight:"+canvasCharacterHeight);
                            	ctx.drawImage(codepageImg, myx, myy, characterWidth, characterHeight, x, y, canvasCharacterWidth, canvasCharacterHeight);
                            }
                        }
                        
						// Now this gets always called!
                        var xpos=foreground;
                        while (xpos >= 16) xpos=xpos-16;
                        var ypos = Math.floor(foreground/16);
                        
                        if (realY < visibleHeight-1) {
                        var myx = (asciiCode % 32) * characterWidth+(xpos*256);
                        var myy = Math.floor(asciiCode / 32) * characterHeight + (ypos*128);
                        //alert(myx+"/"+x);
						// As you can see, the calculated character from the image gets copied/drawn to the canvas
                        ctx.drawImage(codepageImg, myx, myy, characterWidth, characterHeight, x, y, canvasCharacterWidth, canvasCharacterHeight);
                        }
            } // if x >= xStart-1
            } // if y >= yStart-1
			// Now here you should place code which stores characters in the screenCharacterArray in case characters get rendered that are above or before the start of the scrollbar. Is this ever the case?
			// I'm not sure. Mabye this is never the case :)
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

		/** Currently this is not getting called, but it could get used from codepagedisplay.js 309 if needed. Maybe this needs to get implemented differently to make scrolling more smoothly or at different occasions **/
        function scrollDisplay(ctx, canvas) {
            ctx.drawImage(canvas, 0, characterHeight, canvas.width, canvas.height - characterHeight * 2, 0, 0, canvas.width, canvas.height - characterHeight * 2);
            ctx.fillStyle = "black";
            ctx.fillRect(0, canvas.height - characterHeight * 2, canvas.width, characterHeight);
        }

        return { "drawChar": drawChar, "generateDisplay": generateDisplay, "scrollDisplay": scrollDisplay, "copyChar" : copyChar };
    };
    
    /** This class Display. Still needed? This should get checked. If it gets called at a all.
	    It was mostly used by another parser. Or it is still getting used by other projects. However, since escape.js is implemented we don't need most of this. Anyhow,
	    somehow this has own instances of x and y coordinates - still needed? There's for example also a cursorPosX and cursorPosY variable. If you can easily remove this, do this **/
    function Display() {
        var canvas, ctx, x, y, savedX, savedY, foreground, background, bold, inverse;
        
        canvas = codepage.generateDisplay(width, height);

		// Maybe you can get the context also using display.ctx
        ctx = canvas.getContext("2d");

		// Call this to set the current cursor position to x = 0 and y = 0
        function homeCursor() {
            x = 0;
            y = 0;
        }

		// Simple getter
		function getPosX() {
			return x; 
		}

		// Simple getter
		function getPosY() {
				return y;
		}

        function resetAttributes() {
            foreground = 7;
            background = 0;
            bold = false;
            inverse = false;
        }

        function setBold(value) {
            bold = value;
        }

        function setInverse(value) {
            inverse = value;
        }

        function setPos(newX, newY) {
            x = Math.min(width, Math.max(0, newX));
            y = Math.min(height, Math.max(0, newY));
        }

        function setForeground(value) {
            foreground = value;
        }

        function setBackground(value) {
            background = value;
        }

        function clearToEndOfLine() {
            var i;
            for (i = x; i < width; ++i) {
                codepage.drawChar(ctx, 0, 0, 0, i, y);
            }
        }

       function clearScreen(fillStyle) {
            if (typeof(fillStyle)=="undefined") fillStyle="black";
            homeCursor();
            ctx.fillStyle = fillStyle;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function up(num) {
            y = Math.max(1, y - num);
        }

        function down(num) {
            y = Math.min(height - 1, y + num);
        }

        function newLine() {
            x = 0;
            if (y === height - 1) {
				// This is commented out. Does it need to get activated again? Maybe do something different, like updating the scrollbars also?
                //codepage.scrollDisplay(ctx, canvas);
                return true;
            }
            ++y;
            return false;
        }

        function back(num) {
            x = Math.max(1, x - num);
        }

        function forward(num) {
            if (x === width) { newLine(); }
            x = Math.min(width, x + num);
        }

		// Big question is this needed, now that we already have a drawChar function in here.
        function drawChar(asciiCode) {
          
            switch (asciiCode) {
            case 26:
                break;
            default:
                if (!inverse) {
                    //alert("calling drawChar with ascii:"+asciiCode+"fg:"+foreground+" background:"+background+"x:"+x+"y:"+y);;
                    codepage.drawChar(ctx, asciiCode, bold ? foreground  : foreground, background, x++, y);
                    
                } else {
                    //alert("inv ascii:"+asciiCode+"fg:"+foreground+" background:"+background);
                    //alert("calling drawChar with ascii:"+asciiCode+"fg:"+foreground+" background:"+background+"x:"+x+"y:"+y);;
                  
                  
                    codepage.drawChar(ctx, asciiCode, bold ? background + 8 : background, foreground, x++, y);
                }
                if (x === width + 1) { return newLine(); }
            }
            return false;
        }

        function savePosition() {
            savedX = x;
            savedY = y;
        }

        function restorePosition() {
            x = savedX;
            y = savedY;
        }

        homeCursor();
        resetAttributes();
       
        return {
            "resetAttributes": resetAttributes,
            "setBold": setBold,
            "setInverse": setInverse,
            "setPos": setPos,
            "up": up,
            "down": down,
            "newLine": newLine,
            "back": back,
            "forward": forward,
            "setForeground": setForeground,
            "setBackground": setBackground,
            "clearToEndOfLine": clearToEndOfLine,
            "clearScreen": clearScreen,
            "canvas": canvas,
            "drawChar": drawChar,
            "savePosition": savePosition,
            "restorePosition": restorePosition,
            "getPosX": getPosX,
            "getPosY": getPosY
        };
    }

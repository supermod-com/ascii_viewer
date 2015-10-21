
       doRedraw=false;
        var currentDraw=0;
        /** used in connection with mouse click **/
        var waitingforDoubleclick = false;
        /** timer used for mouseclick **/
        var doubleclickInterval;
        /** Canvas context obect **/
        var globalContext;
        /** When we are drawing by using mouse clicks, this is set to true **/
        var drawingMode = false;
        /** Set on mouse click, and evaluated in mousemove **/
        var mouseDown =false;
        /** This is the general width and height, used globally to show the right coordinate system inside the canvas **/
        var width=320;
        var height=90;
        
        var movingX = false;
        var movingY = false;
        var movingXStartPos = 0;
        var movingYStartPos = 0;
        
        // Check/uncheck if the scrollbar is being shown
        var scrollBarXShown = 1;
        var scrollBarYShown = 1;
        
        var visibleWidth = 160;
        var visibleHeight = 45;
        var totalVisibleWidth = 320;
        var totalVisibleHeight=90;
        var firstLine=0;
        var leftLine=0;
        
        var resizeToScreen=false;
        /** This contains all characters. This is an array with three int values **/
        /*
        asciiCode = screenCharacterArray[cursorPosY][currentPos-1][0];
        fgcolor = screenCharacterArray[cursorPosY][currentPos-1][1];
        bgcolor = screenCharacterArray[cursorPosY][currentPos-1][2];
        */
       var hideTimer; // Gets used when toggling the color using CTRL-Cursor for clearing the currently shown color
 
        var screenCharacterArray = new Array();
                
        /** When changing the charset. Number one indicates characters from 1-9, other characters are ascii codes **/
        var currentCharset=7;
        /** This is the character used when drawing **/
        var currentChar=216;
        
        /** This is an image object, containing the image used when initializing the Codepage object, which has the parameter "images/CO_437_8x16.png" for setting this image **/
        var codepageImg;
        /** Actual color. Can get changed by changing the foreground inside the panel with the colors **/
        var currentColor=15;
        /** This is ctx = document.getElementById("ansi").getContext("2d"); and gets set at different positions. Should be all at one position **/
        var ctx;
        
        /** This is not used at the moment (shape.js) and should be used for dragging a small overview image (rectangular box) showing the complete ANSI image when it's too large **/
        var ansimation;
        /** Cursor X and Y positions start at 0, when the cursor is at 1,1 **/
        var cursorPosX=0;
        var cursorPosY=0;
        /** Used for toggling the cursor **/
        var cursorShown=true;
        /** Timer used or displaying displaying the cursor in a certain time span, toggling from shown to not shown */
        var cursorInterval;
        /** Depending on the screen size, this has a certain value of pixels **/
        var characterWidth, characterHeight;
        /** Depending on what cursor mode is on: Insert or overwrite, whereby in this case different ascii charsets get used **/
        var insert=true;
        /** Stores the current fore and background color **/
        var currentBackground=0;
        var currentForeground=15;
        
        var copyMode=false;
        var copyStartX=0;
        var copyStartY=0;
        var copyEndX=0;
        var copyEndY=0;
        
        
        var copyArray=new Array();
        var copyWidth=0;
        var copyHeight=0;
        
        var undo = new Array();
        var redo = new Array();
        
        
        var ctrlKey=false;
        
        /** This gets called when pressing on the blue window, and sets the character set as well as the ascii code for drawing **/
        function setD(asciiCode, drawingBox) {
        
            currentCharset=drawingBox;
            currentChar=asciiCode;
        }
        
      
    
      /** Ansi interpreter, display and charactersatonce **/
      var interpreter, display, charactersatonce;
         
      
        function redrawScreen() {
            
             
            
             var window_innerWidth = (visibleWidth*(canvasCharacterWidth));
             var window_innerHeight = (visibleHeight*(canvasCharacterHeight));
            
             visibleXStart = Math.floor((scrollPosX/window_innerWidth)*width);
             visibleXStop = visibleXStart + visibleWidth;
             
             visibleYStart = Math.floor((scrollPosY/window_innerHeight)*height);
             var visibleYStop = visibleYStart + visibleHeight;
             animOffsetX=visibleXStart;
             animOffsetY=visibleYStart;
             
             doRedraw=true;
             
             
        }
          
        function showMenu() {
            
            
            
        }
        
        
    function clearWholeScreen() 
    {
        console.log("clearScreen");
       if (confirm('Are you sure?')) {
          doClearScreen(true);
        }
    }
    
	/** This clears the screen by putting spaces with the current foreground and background color on the screen **/
    function doClearScreen(resetCharacters, all) {
        
      if (typeof(all)=="undefined") all=false;
        
      var charArray = new Array();
      charArray[0]=32;
      charArray[1]=currentForeground;
      charArray[2]=currentBackground;
      var startY = 0;
      
       var bgstring = "#000000";
       
       if (resetCharacters) {
          
                while (startY<totalVisibleHeight) 
                {
                 var startX=0;
                 while (startX<totalVisibleWidth) 
                 {
                         screenCharacterArray[startY][startX++]=charArray;


                 }
                 startY++;
                }
                globalDisplay.clearScreen(bgstring);
       }
      
       ctx = document.getElementById("ansi").getContext("2d");
       ctx.fillStyle = bgstring;
       var window_innerWidth = (visibleWidth*(canvasCharacterWidth));
       var window_innerHeight = (visibleHeight*(canvasCharacterHeight));
       if (all==false) {
           ctx.fillRect(0, 0, window_innerWidth-canvasCharacterWidth, window_innerHeight-(canvasCharacterHeight*1));
       } else {
           ctx.fillRect(0, 0, document.getElementById('ansi').width, document.getElementById('ansi').height);
       }
      
    }
        
        function updateCanvasSize() {
            
        }
        
       
        function getDisplayWidth() {
            return visibleWidth; // return parseInt(document.getElementById('displaywidth').value);
        }
        function getDisplayHeight() {
            return visibleHeight; // return parseInt(document.getElementById('displayheight').value);
        }
        function getTotalDisplayWidth() {
            return totalVisibleWidth; // return parseInt(document.getElementById('displaywidth').value);
        }
        function getTotalDisplayHeight() {
            return totalVisibleHeight; // return parseInt(document.getElementById('displayheight').value);
        }
        
        function setCursorPosX(x) {
             
            cursorPosX=x;
        }
        
        function setCursorPosY(y) {
            
            cursorPosY=y;
        }
        
        function setCursorPosXNoDebug(x) {
            cursorPosX=x;
        }
        
        function setCursorPosYNoDebug(y) {
            cursorPosY=y;
        }
        
           function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
        
        function initansicanvas() {
           
             
                ansicanvas = document.getElementById('ansi');
                
                ansicanvas.addEventListener('mousedown', function(e) {
                    
                  
                    
                        var window_innerWidth = (visibleWidth*(canvasCharacterWidth));
                        var window_innerHeight = (visibleHeight*(canvasCharacterHeight));

                        var mouse = getMousePos(ansicanvas, e);
                        var my = mouse.y;                
                        var mx = mouse.x;

                        var myScrollbarY = window_innerHeight-canvasCharacterHeight;

                        if (my>(myScrollbarY)) {
                            movingXStartPos = mx;
                            console.log("Setting movingX to true");
                            movingX=true;
                            movingY=false;
                        }

                        var myScrollbarX = window_innerWidth-canvasCharacterWidth;

                        if (mx>myScrollbarX) {
                            movingYStartPos = my;
                            console.log("Setting movingY to true");
                            movingY=true;
                            movingX=false;
                        }
                    
                      if ( (copyMode) ) {
                        resetHighlighted();
                        copyMode=false;
                    }
                    
                    if (waitingforDoubleclick==false) {
                        waitingforDoubleclick = true;
                        clearTimeout(doubleclickInterval);
                        doubleclickInterval = setTimeout(function() { waitingforDoubleclick=false; }, 300);
                        
                    } else {
                        
                        showPanel();
                    }
                    
                    mouseDown=true;
                    mouseMove(ansicanvas, e);
                   
                   /* asciiCode = screenCharacterArray[cursorPosY][cursorPosX][0];
                    fgcolor = screenCharacterArray[cursorPosY][cursorPosX][1];
                    bgcolor = screenCharacterArray[cursorPosY][cursorPosX][2];
                    console.log("asciiCode:"+asciiCode+" fgcolor:"+fgcolor+" bgcolor:"+bgcolor);
                    */
                  
                   
                    if (drawingMode) {
                       
                        codepage.drawChar(ctx, currentChar, currentForeground, currentBackground, cursorPosX, cursorPosY, false); // false == update coordinate system
                    }
                    
                }, true);
                
                
              
                
                ansicanvas.addEventListener('mouseleave', function(e) {
                    mouseDown=false;
                });
                
                ansicanvas.addEventListener('mouseup', function(e) {
                   mouseDown=false;
                   if ( (movingX) || (movingY) ) {
                   firstLine=animOffsetY; 
                   leftLine=animOffsetX;
                   movingX=false;
                   movingY=false;
                   }
                });
            
                ansicanvas.addEventListener('mousemove', function(e) {
                  
                   console.log("mouseMove scrollbar:"+mouseMove);
                   if (movingY==true)
                   {
                       var mouse = getMousePos(ansicanvas, e);
                       var mx = mouse.x;
                       var my = mouse.y;
                       updateScrollbarY(2, my-movingYStartPos);
                       redrawScreen();
                   
                   } else
                   if (movingX==true) 
                   {
                       var mouse = getMousePos(ansicanvas, e);
                       var mx = mouse.x;
                       var my = mouse.y;
                       updateScrollbarX(2, mx-movingXStartPos);
                       redrawScreen();
                   
                   } else
                   
                   if (mouseDown==true) {
                    
                   mouseMove(ansicanvas,e);
                    
                 
                   }
                   
                });

               
        }
        
        /** This gets called whenever the mouse moves and the left mouse button is getting keeped pressed  **/
        
        function mouseMove(ansicanvas, e) {
            console.log(e);
            
            var mouse = getMousePos(ansicanvas, e);
                    var mx = mouse.x;
                    var my = mouse.y;                
            
            if (movingY==true) {
                
            } else if (movingX==true) {
                
            }
            
            

					if (resizeToScreen==false)
					{					
                    
						myCursorPosX = Math.floor(mx / canvasCharacterWidth);
						myCursorPosY = Math.floor(my / canvasCharacterHeight);

					} else 
					{
						var window_innerWidth = (visibleWidth*(canvasCharacterWidth));
						var window_innerHeight = (visibleHeight*(canvasCharacterHeight));

						myCursorPosX = Math.floor((mx / window_innerWidth) * visibleWidth);
						myCursorPosY = Math.floor((my / window_innerHeight) * visibleHeight);

					}
                                                var maxWidth = getDisplayWidth()-1;
                                                
                                                if (myCursorPosX<=maxWidth-scrollBarXShown) {
                                                    
                                                
						if (myCursorPosY>=getDisplayHeight()-1-scrollBarYShown) { console.log(myCursorPosY+" too high"); setCursorPosX(myCursorPosX); setCursorPosY(getDisplayHeight()-1-scrollBarYShown); return; }
						
                                               
                                                    setCursorPosX(myCursorPosX);
                                                    setCursorPosY(myCursorPosY);
                                                } else {
                                                    // Calculate scrollbar
                                                    
                                                }
						
                                                
                   
            
        }
        
		
        
	
		/* This creates a new screenCharacterArray in which the colors and codes get stored, by default color white and space (32) **/
        function setANSICanvasSize() {
            var totalDisplayWidth=getTotalDisplayWidth();
            var totalDisplayHeight=getTotalDisplayHeight();
            
            for (var y = 0; y <= totalDisplayHeight; y++) // TODO if really 
            {                    
                    var xArray = new Array();
                    for (var x = 0; x <= totalDisplayWidth; x++)  // TODO if really
                    {
                     var data = new Array();
                     data[0]=32; // ascii code
                     data[1]=15; // foreground color
                     data[2]=0; // background color
                     xArray[x]=data;
                    }
                    screenCharacterArray[y]=xArray;
                    
                    //console.log("y:"+y+" length:"+screenCharacterArray[y].length);
            }

           window.onresize = function() { 
               resize_canvas();
           }
           
        }
		/** This is getting called whenever the user resizes the canvas, to show always the same amount of characters, just with a different width and height **/
        function resize_canvas(){
            
            canvas = document.getElementById("ansi");
            ctx = document.getElementById("ansi").getContext("2d");
            setCanvasSize(canvas);
            //doClearScreen(false);
           
            for (var y = firstLine; y < screenCharacterArray.length-1; y++) {
           
                for (var x = 0; x < screenCharacterArray[y].length-1; x++) {
                
                     
                     var charArray = screenCharacterArray[y][x];
                     asciiCode=charArray[0];
                     foreground=charArray[1];
                     background=charArray[2];
                    
                    
                     codepage.drawChar(ctx, asciiCode, foreground, background, x, y, false);
                     
                }
            }
            updateScrollbarX(2);
            updateScrollbarY(2);
        }
        
       function setCanvasSize(canvas) {
            
            var window_innerWidth = window.innerWidth;
            var window_innerHeight = window.innerHeight;
            var characterWidthPct= window_innerWidth/(visibleWidth*8); // How often does the character fit into the width
            var characterHeightPct = window_innerHeight/(visibleHeight*16);  // How often does the character fit into the height
            
            if (resizeToScreen==false) {
            
                fullCanvasWidth=Math.floor(visibleWidth*8*characterWidthPct);
                fullCanvasHeight=Math.floor(visibleWidth*8*characterHeightPct);

                canvas.width=fullCanvasWidth;
                canvas.height=fullCanvasHeight;
                canvasCharacterWidth=Math.floor(8*characterWidthPct);
                canvasCharacterHeight=Math.floor(16*characterHeightPct);
        
            } else {
            
                fullCanvasWidth=window_innerWidth; // Math.floor(width*8*characterWidthPct);
                fullCanvasHeight=window_innerHeight; // Math.floor(width*8*characterHeightPct);

                canvas.width=fullCanvasWidth;
                canvas.height=fullCanvasHeight;

                canvasCharacterWidth=Math.floor(window_innerWidth/visibleWidth); // Math.floor(8*characterWidthPct);
                canvasCharacterHeight=Math.floor(window_innerHeight / visibleHeight); // Math.floor(16*characterHeightPct);
           
            
            }
           
            
        } 
      
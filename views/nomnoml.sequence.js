var nomnoml = nomnoml || {}

$(function (){

	var storage = null
	var jqCanvas = $('#canvas')
	var viewport = $(window)
	var jqBody = $('body')
	var lineNumbers = $('#linenumbers')
	var lineMarker = $('#linemarker')
	var storageStatusElement = $('#storage-status')
	var textarea = document.getElementById('textarea')
	var imgLink = document.getElementById('savebutton')
	var linkLink = document.getElementById('linkbutton')
	var canvasElement = document.getElementById('canvas')
	var diagramElement = document.getElementById('diagram')
	var canvasPanner = document.getElementById('canvas-panner')
	var canvasTools = document.getElementById('canvas-tools')
	//var defaultSource = document.getElementById('defaultGraph').innerHTML
	var emptySource = document.getElementById('empty').innerHTML
	var zoomLevel = 0
	var offset = {x:0, y:0}
	var mouseDownPoint = false
	var vm = skanaar.vector

	var editor = CodeMirror.fromTextArea(textarea, {
		lineNumbers: true,
		mode: 'nomnoml',
		matchBrackets: true,
		theme: 'solarized light',
		keyMap: 'sublime'
	});
	var editorElement = editor.getWrapperElement()
	window.addEventListener('hashchange', reloadStorage);
	window.addEventListener('resize', _.throttle(sourceChanged, 750, {leading: true}))
	editor.on('changes', _.debounce(sourceChanged, 300))
	canvasPanner.addEventListener('mouseenter', classToggler(jqBody, 'canvas-mode', true))
	canvasPanner.addEventListener('mouseleave', classToggler(jqBody, 'canvas-mode', false))
	canvasTools.addEventListener('mouseenter', classToggler(jqBody, 'canvas-mode', true))
	canvasTools.addEventListener('mouseleave', classToggler(jqBody, 'canvas-mode', false))
	canvasPanner.addEventListener('mousedown', mouseDown)
 	window.addEventListener('mousemove', _.throttle(mouseMove,50))
	canvasPanner.addEventListener('mouseup', mouseUp)
	canvasPanner.addEventListener('mouseleave', mouseUp)
	canvasPanner.addEventListener('wheel', _.throttle(magnify, 50))
	initImageDownloadLink(imgLink, diagramElement)
	initToolbarTooltips()
	
	reloadStorage()
//sset()
editor.setValue("");
	function classToggler(element, className, state){
		var jqElement = $(element)
		return _.bind(jqElement.toggleClass, jqElement, className, state)
	}

	function mouseDown(e){
		$(canvasPanner).css({width: '100%'})
		mouseDownPoint = vm.diff({ x: e.pageX, y: e.pageY }, offset)
	}

	function mouseMove(e){
		if (mouseDownPoint){
			offset = vm.diff({ x: e.pageX, y: e.pageY }, mouseDownPoint)
			sourceChanged()
		}
	}

	function mouseUp(){
		mouseDownPoint = false
		$(canvasPanner).css({width: '33%'})
	}

	function magnify(e){
		console.log("magnfy");
		zoomLevel = Math.min(10, zoomLevel - (e.deltaY < 0 ? -1 : 1))
		sourceChanged()
	}

	nomnoml.magnifyViewport = function (diff){
	zoomLevel = Math.min(10, zoomLevel + diff)
		sourceChanged()
	}

	nomnoml.resetViewport = function (){
		zoomLevel = 1
		offset = {x: 0, y: 0}
		sourceChanged()
	}

	nomnoml.toggleSidebar = function (id){
		var sidebars = ['reference', 'about','list']
		_.each(sidebars, function (key){
			if (id !== key) $(document.getElementById(key)).toggleClass('visible', false)
		})
		$(document.getElementById(id)).toggleClass('visible');
		if(id='list'){
			$.get("/all",function(response,status){
		for (var r in response) {
			(function(r){
					if(response[r].type=='sequence diagram'){
					/* var obj=document.getElementById("");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ showEditor(response[r]); });
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = response[r].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem); */
				}
		}(r));
		}
	});
	}
	}
	
	nomnoml.discardCurrentGraph = function (){
		if (confirm('Do you want to discard current diagram and load the default example?')){
			setCurrentText(emptySource)
			sourceChanged()
			localStorage.d_id="";
		}
	}
	
	nomnoml.saveEditor = function (){
		var d_id=localStorage.d_id;
		console.log(d_id);
		if(!localStorage.d_id){
			var name=prompt("Enter Name For Diagram",'Diagram Name');
			if(name!=null){
				//var type=prompt("Enter Type For Diagram",'1-Class Diagram/2-use case Diagram/3-object Diagram/4-sequence Diagram');
				//if(type=='1' ||type=='2'||type=='3'||type=='4'){
		var text=editor.getValue();
		$.post("/",{data:'"'+text+'"',name:name,type:4});
			}
			else{
				alert("invalid type");
			}
			
		}
			else if(localStorage.d_id){
				var text=editor.getValue();
				$.post("/update",{data:'"'+text+'"',id:d_id});
			}
	}

	nomnoml.saveViewModeToStorage = function (){
		var question = 
			'Do you want to overwrite the diagram in ' +
			'localStorage with the currently viewed diagram?'
		if (confirm(question)){
			storage.moveToLocalStorage()
			window.location = './'
		}
	}

	nomnoml.exitViewMode = function (){
		window.location = './'
	}
	
		nomnoml.newSequence=function(){
			 document.getElementById("diagram").innerHTML="";
		set();
			var data="Operator->ATM: startATM()\n"+
				"Customer->ATM: initiateSession()\n"+
				"ATM-> Customer: login()\n"+
				"Customer-> ATM: checkLogin()\n"+
				"ATM->Customer: showOperations()\n"+
				"Customer->ATM: selectOperation()\n"+
				"ATM->Customer: enterAmount()\n"+
				"Customer->ATM: cashWidra()\n"+
				"ATM->Customer: logout()\n"+
				"ATM->Operator: stopATM()\n";
				setCurrentText(data)
				editor.setValue(data);
				storage.moveToLocalStorage();
		};
		
	 nomnoml.seqextract=function(){
		 $.get("extractSeq/6",function(resp){
			  var data=resp;
		editor.setValue(data);
		setCurrentText(data)
		storage.moveToLocalStorage();
		makediagram(data);
		 });
		
		
	};
	nomnoml.newObject=function(){
			var data="[Object Diagram of ATM |[<instance> Operator | employee_id | name ]\n "+
			"[<instance> Customer | customer_id | name | pin_code| account_number | credit]\n"+
			" [<instance> ATM | atm_id | bank_id | cash]]";
			setCurrentText(data)
			editor.setValue(data);
			
		};

		nomnoml.newed=function(){
			var data="";
			//document.getElementById("diagram").visibility="hidden";
			
			editor.setValue(data);
		setCurrentText(data)
		storage.moveToLocalStorage();
		
				makediagram(data);
		}
		nomnoml.newUse=function(){
			var data="[Usecase of ATM|[<actor> Operator] ->[<usecase> System Startup]\n"+
			"[<actor> Operator] ->[<usecase> System Shutdown]\n"+" [<actor> Customer] ->[<usecase> Session] \n"+
			" [<usecase> Session]<<include>> -> [<usecase> Transaction]\n"+
			"[<usecase> Invalid pin]<<extend>> -> [<usecase> Transaction]]";
			editor.setValue(data);
		setCurrentText(data)
		storage.moveToLocalStorage();
			//localStorage.d_id="";
		};
		
	 nomnoml.objextract=function(){
		 $.get("/extract/3",function(resp){
			 console.log(resp);
		 var data=resp;
		/*var data="[Object Diagram of ATM | [<instance> Operator |  ]\n"+
		"  [<instance> Customer | ]\n"+"[<instance> ATM | ]]";*/
		editor.setValue(data);
		setCurrentText(data)
		storage.moveToLocalStorage();
		 });
	};
	nomnoml.clsextract=function(){
		var data="[Class Diagram of ATM |"+
  "[ Operator | employee_id  || startATM() | stopATM()]\n"+ 
  "[Customer | customer_id  | pin_code| account_number"+
  "| credit || login()  | showOperations() | enterAmount() | logout()]\n" +
  "[ATM | atm_id | bank_id | cash ||  initiateSession() |checkLogin() |"+
   "selectOperation() |  cashWidraw() ]\n"+
 "]";editor.setValue(data);
		setCurrentText(data)
		storage.moveToLocalStorage();
	}
	 nomnoml.newClass=function(){
		var data="[Class Diagram of ATM |"+
  "[person | name] <:- [Operator]\n"+
  "[person | name] <:- [Customer]\n"+
  "[ Operator | employee_id  || startATM() | stopATM()]\n "+
  "[Customer | customer_id  | pin_code| account_number"+
  "| credit || login()  | showOperations() | enterAmount() | logout()]\n "+
  "[ATM | atm_id | bank_id | cash ||  initiateSession() |checkLogin() |"+
   "selectOperation() |  cashWidraw() ]"+
 "]";
			editor.setValue(data);
		setCurrentText(data)
		storage.moveToLocalStorage();
	}  
	
	// Adapted from http://meyerweb.com/eric/tools/dencoder/
	function urlEncode(unencoded) {
		return encodeURIComponent(unencoded).replace(/'/g,'%27').replace(/"/g,'%22')
	}

	function urlDecode(encoded) {
		return decodeURIComponent(encoded.replace(/\+/g, ' '))
	}

	/* function setShareableLink(str){
		var base = '#view/'
		linkLink.href = base + urlEncode(str)
	} */

	function buildStorage(locationHash){
		var key = 'nomnoml.lastSource'
		if (locationHash.substring(0,6) === '#view/')
			return {
				read: function (){ return urlDecode(locationHash.substring(6)) },
				save: function (){ setShareableLink(currentText()) },
				moveToLocalStorage: function (){ localStorage[key] = currentText() },
				isReadonly: true
			}
		return {
			read: function (){ return localStorage[key] || emptySource },
			save: function (source){
				//setShareableLink(currentText())
				localStorage[key] = source
			},
			moveToLocalStorage: function (){},
			isReadonly: false
		}
	}

	function initImageDownloadLink(link, diagramElement){
		link.addEventListener('click', downloadImage, false);
		function downloadImage(){
			var url = diagramElement.toDataURL('image/png')
			link.href = url;
		}
	}

	function initToolbarTooltips(){
		var tooltip = $('#tooltip')[0]
		$('.tools a').each(function (i, link){
			link.onmouseover = function (){ tooltip.textContent  = $(link).attr('title') }
			link.onmouseout = function (){ tooltip.textContent  = '' }
		})
	}

	function positionCanvas(rect, superSampling, offset){
		var w = rect.width / superSampling
		var h = rect.height / superSampling
		jqCanvas.css({
			top: 300 * (1 - h/viewport.height()) + offset.y,
			left: 150 + (viewport.width() - w)/2 + offset.x,
			width: w,
			height: h
		})
	}

	function setFilename(filename){
		imgLink.download = filename + '.png'
	}

	function reloadStorage(){
		storage = buildStorage(location.hash)
		editor.setValue(storage.read())
		if (storage.isReadonly) storageStatusElement.show()
		else storageStatusElement.hide()
	}
	function showEditor(id){
		var str=id.diagram.replace (/"/g,'');
		 editor.setValue(str);
		  localStorage.setItem("d_id", id.id);
	}
	function currentText(){
		return editor.getValue()
	}

	function setCurrentText(value){
		return editor.setValue(value)
	}
	function set(){
		var data="Operator->ATM: startATM()\n"+
				"Customer->ATM: initiateSession()\n"+
				"ATM-> Customer: login()\n"+
				"Customer-> ATM: checkLogin()\n"+
				"ATM->Customer: showOperations()\n"+
				"Customer->ATM: selectOperation()\n"+
				"ATM->Customer: enterAmount()\n"+
				"Customer->ATM: cashWidra()\n"+
				"ATM->Customer: logout()\n"+
				"ATM->Operator: stopATM()\n";
				setCurrentText(data)
				editor.setValue(data);
				storage.moveToLocalStorage();
		/* return editor.setValue("Operator->ATM: startATM()\n"+
				"Customer->ATM: initiateSession()\n"+
				"ATM-> Customer: login()\n"+
				"Customer-> ATM: checkLogin()\n"+
				"ATM->Customer: showOperations()\n"+
				"Customer->ATM: selectOperation()\n"+
				"ATM->Customer: enterAmount()\n"+
				"Customer->ATM: cashWidra()\n"+
				"ATM->Customer: logout()\n"+
				"ATM->Operator: stopATM()\n"; 
)*/	}
	function diagrams(){
	var diagram = Diagram.parse(currentText());
				diagram.drawSVG('diagram',{theme: 'simple'});
	}
	function makediagram(data){
	document.getElementById("diagram").innerHTML="";
	}
	 function sourceChanged(){
		try {
			lineMarker.css('top', -30)
			lineNumbers.toggleClass('error', false)
			var superSampling = window.devicePixelRatio || 1
			var scale = superSampling * Math.exp(zoomLevel/10)
			
			document.getElementById("diagram").innerHTML="";
			Diagram.parse(currentText()).drawSVG('diagram',{theme: 'simple'});
			storage.save(currentText())
		} catch (e){
			var matches = e.message.match('line ([0-9]*)')
			lineNumbers.toggleClass('error', true)
			if (matches){
				var lineHeight = parseFloat($(editorElement).css('line-height'))
				lineMarker.css('top', 3 + lineHeight*matches[1])
			} else {
				throw e
			}
		}
	} 
})

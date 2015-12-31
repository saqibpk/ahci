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
	var canvasPanner = document.getElementById('canvas-panner')
	var canvasTools = document.getElementById('canvas-tools')
	var defaultSource = document.getElementById('defaultGraph').innerHTML
	var emptySource = document.getElementById('empty').innerHTML
	var zoomLevel = 0
	var offset = {x:0, y:0}
	var mouseDownPoint = false
	var vm = skanaar.vector

	var editor = CodeMirror.fromTextArea(textarea, {
		lineNumbers: true,
		mode: 'raadd',
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
	initImageDownloadLink(imgLink, canvasElement)
	initToolbarTooltips()
	//reloadStorage()
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
				if(response[r].type=='usecase diagram'){
					var use=document.getElementById("usecase");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ showEditor(response[r]); });
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = response[r].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  use.appendChild(elem);
				}else if(response[r].type=='class diagram'){
					var cls=document.getElementById("clas");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ showEditor(response[r]); });
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = response[r].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  cls.appendChild(elem);
				} else
					if(response[r].type=='object diagram'){
					var obj=document.getElementById("object");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ showEditor(response[r]); });
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = response[r].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem);
				}
				else
					if(response[r].type=='sequence diagram'){
					var obj=document.getElementById("sequence");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ showEditor(response[r]); });
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = response[r].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem);
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
		
			if(!localStorage.d_id){
			var name=prompt("Enter Name For Diagram",'Diagram Name');
			if(name!=null){
				var text=editor.getValue();
			$.post("/",{data:'"'+text+'"',name:name,type:localStorage.type},function(stat){
				
				var str=stat.diagram.diagram.replace (/"/g,'');
		    editor.setValue(str);
		 	setCurrentText(str)
			storage.moveToLocalStorage();
			 localStorage.setItem("d_id", stat.diagram.id);
			 console.log(stat);
			 alert(stat.message);
			});
			}
		}
			else if(localStorage.d_id){
				var text=editor.getValue();
				$.post("/update",{data:'"'+text+'"',id:d_id},function(stat){
				var str=stat.diagram.diagram.replace (/"/g,'');
		    editor.setValue(str);
		 	setCurrentText(str)
			//storage.moveToLocalStorage();
			 localStorage.setItem("d_id", stat.diagram.id);
			 alert(stat.message);
			});
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
	
	nomnoml.newObject=function(){
		$("#canvas").show();
		 $("#diagram").hide();
		localStorage.type="object diagram";
		localStorage.d_id="";
		var data="";
			editor.setValue(data);
			setCurrentText(data)
			//storage.moveToLocalStorage();
			};
	nomnoml.newSequence=function(){
		$("#canvas").hide();
		 $("#diagram").show();
			 document.getElementById("diagram").innerHTML="";			 
			var data="";
				localStorage.type="sequence diagram";
				localStorage.d_id="";
		
				setCurrentText(data)
				editor.setValue(data);
				storage.moveToLocalStorage();
		};
	/* nomnoml.newed=function(){
		document.getElementById("canvas").visibility="visible";
		document.getElementById("diagram").visibility="hidden";
		
			var data="[default page]";
			//document.getElementById("canvas").visibility="hidden";
			editor.setValue(data);
			setCurrentText(data)
			storage.moveToLocalStorage();
		} */
	nomnoml.newUse=function(){
		$("#canvas").show();
		 $("#diagram").hide();
			localStorage.type="usecase diagram";
			localStorage.d_id="";
			var data="";
			editor.setValue(data);
			setCurrentText(data)
			storage.moveToLocalStorage();
		};
	nomnoml.newClass=function(){
		$("#canvas").show();
		 $("#diagram").hide();
		localStorage.type="class diagram";
		localStorage.d_id="";
			var data="";
			editor.setValue(data);
			setCurrentText(data)
			//storage.moveToLocalStorage();
	}  
	nomnoml.objextract=function(){
		$("#canvas").show();
		 $("#diagram").hide();
		 $.get("/usecase_diagrams",function(usecases){
			// console.log(usecases);
			$('#myModal').modal('toggle');
			 document.getElementById("use").innerHTML="";
			
			document.getElementsByClassName("modal-title")[0].innerHTML="Use Case Diagrams";
			for(var a in usecases){
					(function(a){
				var obj=document.getElementById("use");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ 
			$.get("/extract/"+usecases[a].id,function(res){
				console.log(res)
				$('#myModal').modal('hide');
			});

		  });		  
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = usecases[a].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem);
				}(a));
			}
		 });
	};
	nomnoml.clsextract=function(){
		$("#canvas").show();
		 $("#diagram").hide();
		var idz={};
		$.get("/object_diagrams",function(objects){
		$.get("/sequence_diagrams",function(seqs){
			 $('#ModalTwo').modal('toggle');
			 var bdy=document.getElementsByClassName("modal-bodytwo")
			document.getElementById("use").innerHTML="";
			document.getElementsByClassName("modal-titletwo")[0].innerHTML="Object Diagrams && Sequence Diagrams";
				var ul1=document.createElement("ul");
				ul1.id="objd";
				bdy[0].appendChild(ul1);
				var li=document.createElement("li");
				li.innerHTML="Object Diagrams";
				 ul1.appendChild(li);
				for(var o in objects){
					(function(o){
				var obj=document.getElementById("objd");
				
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ 
		  idz.obj_id=objects[o].id;
		  bdy[0].removeChild(ul1);
		if(!document.getElementsByClassName("modal-bodytwo")[0].innerText){
			$.get("/extractClass/"+idz.obj_id+"/"+idz.seq_id,function(resp){
				editor.setValue(resp);
			setCurrentText(resp)
				$('#ModalTwo').modal('hide');
			
			})
		}
		});		  
		  anchor.id='anchr';
		  anchor.href='#';
		   anchor.innerText = objects[o].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem);
			}(o));
				}
				var ul2=document.createElement("ul");
				ul2.id="seqd";
				bdy[0].appendChild(ul2);
				var li=document.createElement("li");
				li.innerHTML="Sequence Diagrams";
				 ul2.appendChild(li);
				for(var o in seqs){
					(function(o){
				var obj=document.getElementById("seqd");
				
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ 
		  idz.seq_id=seqs[o].id;
		  bdy[0].removeChild(ul2);
		  if(!document.getElementsByClassName("modal-bodytwo")[0].innerText){
			$.get("/extractClass/"+idz.obj_id+"/"+idz.seq_id,function(resp){
				editor.setValue(resp);
			setCurrentText(resp)
				$('#ModalTwo').modal('hide');
			})
		}
		});		  
		  anchor.id='anchr';
		  anchor.href='#';
		   anchor.innerText = seqs[o].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem);
			}(o));
				}
		});
		 });
	}
	nomnoml.seqextract=function(){
		 $("#canvas").hide();
		 $("#diagram").show();
		 
		$.get("/object_diagrams",function(objects){
			 $('#myModal').modal('toggle');
			 document.getElementById("use").innerHTML="";
			document.getElementsByClassName("modal-title")[0].innerHTML="Object Diagrams";
				for(var u in objects){
					(function(u){
				var obj=document.getElementById("use");
		  var anchor = document.createElement("a");
		  anchor.addEventListener("click", function(){ 
		 // console.log(objects[u].id);
			$.get("/extractSeq/"+objects[u].id,function(res){
				
				$('#myModal').modal('hide');
				editor.setValue(res);
				setCurrentText(res);
				sourceChanged();
			});
		  });		  
		  anchor.id='anchr';
		  anchor.href='#';
		  anchor.innerText = objects[u].name;
		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  obj.appendChild(elem);
				}(u));
				}
		 });
	};
	function getID(diagram){
		console.log(diagram);
		$('#myModal').modal('hide');
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
			read: function (){ return localStorage[key] || defaultSource },
			save: function (source){
				//setShareableLink(currentText())
				localStorage[key] = source
			},
			moveToLocalStorage: function (){},
			isReadonly: false
		}
	}

	function initImageDownloadLink(link, canvasElement){
		link.addEventListener('click', downloadImage, false);
		function downloadImage(){
			var url = canvasElement.toDataURL('image/png')
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
		sourceChanged()
		if (storage.isReadonly) storageStatusElement.show()
		else storageStatusElement.hide()
	}
	function showEditor(id){
		
		if(id.type!="sequence diagram"){
		 $("#canvas").show();
		 $("#diagram").hide();
		var str=id.diagram.replace (/"/g,'');
		 editor.setValue(str);
		 localStorage.setItem("d_id", id.id);
			
		}	
else{
	$("#canvas").hide();
		 $("#diagram").show();
		
	var str=id.diagram.replace (/"/g,'');
		 editor.setValue(str);
		 localStorage.setItem("d_id", id.id);	
		
}		
	}
	function currentText(){
		return editor.getValue()
		
	}
	
	function setCurrentText(value){
		return editor.setValue(value)
	}

	function sourceChanged(){
		try {
			document.getElementById("diagram").innerHTML="";			
			lineMarker.css('top', -30)
			lineNumbers.toggleClass('error', false)
			var superSampling = window.devicePixelRatio || 1
			var scale = superSampling * Math.exp(zoomLevel/10)
			var model = nomnoml.draw(canvasElement, currentText(), scale)
			positionCanvas(canvasElement, superSampling, offset)
			Diagram.parse(currentText()).drawSVG('diagram',{theme: 'simple'});
			setFilename(model.config.title);
			storage.save(currentText());
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

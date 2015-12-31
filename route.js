
var express = require('express');
var router = express.Router();
var _=require("underscore");
router.get('/',function(req,res){
	 res.sendfile('./views/index.html');
});
function objString(strob){
	var strobj;
	strobj=strob.replace (/"/g,'');
	//console.log(strobj);
	var str;
	var count = strobj.split('|').length-1;
	//console.log(count);
	if(count < 1){
		var str1 = strobj.split(']');
		//console.log(str1[0]);
		var str2 = str1[0].split('[');
		str = str2[1];
		
	}else{
		var str1 = strobj.split('|');
		var str2 = str1[0].split('[');
		str = str2[1];
	}
	return str;
}
router.get("/all",function(req,res){
	db("class_diagram").find().exec(function(err,models){
		if(err){
			console.log(err);
		}
		else{
			res.json(models);
		}
	});
});
router.post('/',function(req,res){
	//console.log(req.body);
	db('class_diagram').create({diagram:req.body.data,name:req.body.name,type:req.body.type},function(err,model){
		if(err){
			console.log(err);
		}
		else{
			res.json({message:"diagram saved",diagram:model});
		/* 	if (req.body.type==1){
				model.type="class diagram";
				model.save(function(err){
					if(!err){
						res.json("class diagram saved");
					}
				});
			}
			else if(req.body.type==2){
				model.type="use case diagram";
				model.save(function(err){
					if(!err){
						res.json("use case diagram saved");
					}
				});
			}else if(req.body.type==3){
				model.type="object diagram";
				model.save(function(err){
					if(!err){
						res.json("object diagram saved");
					}
				});
			}else if(req.body.type==4){
				model.type="sequence diagram";
				model.save(function(err){
					if(!err){
						res.json("sequence diagram saved");
					}
				});
			}
		 */	
		}
	});
});	
router.get('/getData/:id',function(req,res){
	db('class_diagram').findOne({id:req.params.id}).exec(function(err,model){
		if(err){
			res.json(err);
		}
		else{
			res.json(model);
		}
	});
});	
router.post('/update',function(req,res){
	db("class_diagram").findOne({id:req.body.id}).exec(function(err,model){
		if(err){
			console.log(err);
		}
		else{
			model.diagram=req.body.data;
			model.save(function(err,mod){
				if(err){
					console.log(err);
				}
				else{
					res.json({message:"Updated",diagram:mod});
				}
			});
					
				}
	});
});
router.get('/extract/:id', function(req, res){
	//var obj=[];
	var objectString=[];
	  db('class_diagram').findOne({id: req.params.id}).exec(function(err, model){
		if(model){
			console.log(model);
			var b = [];
			var obj= '';
				var abc = model.diagram;
				var st=abc.replace (/"/g,'');
				var xyz = [];
				xyz = st.split('\n');
				for(var n=0;n<xyz.length;n++){
				var str = xyz[n].split('<actor>');
				var str2 = str[1].split(']');
				b.push(str2[0]);
				if(n==xyz.length-1){
					for(var i = 0; i < b.length; i++){
				obj += "["+b[i]+"]\n";
				if(i==b.length-1){
					//console.log(obj);
					res.json(obj);
				}
			}
				}
				
			}
				}
	});  
	
});
router.get('/extractSeq/:id', function(req, res){
	
	var objectString=[];
	  db('class_diagram').findOne({id: req.params.id}).exec(function(err, model){
		if(model){
			//console.log(model);
			var str3="";
				var abc = model.diagram;
				var st=abc.replace (/"/g,'');
				var xyz = [];
				xyz = st.split('\n');
				console.log(xyz);
				for(var a=0;a<xyz.length;a++){
					 var num = xyz[a].split("->").length - 1;
                var num2 = xyz[a].split("-->").length - 1;
                var num3 = xyz[a].split("|").length - 1;
			    if(num > 0 || num2 > 0){
					//console.log(xyz[a]);
                    var str = xyz[a].split("[");
					console.log(str);
                    if(num3 < 1){
                        str3 +=xyz[a].replace(/[\[\]']/g,'' );
                        str3 += ':\n';
						//console.log(1);
                    }else{
                        var str = xyz[a].split(']');
						//console.log(str);
                        var count = str[0].split('|').length - 1;
                        var count2 = str[1].split('|').length - 1;
                        if((count == 1 && count2 == 0) || (count == 0 && count2 == 1)){
                            var stream = xyz[a].split('|');
							 var stream2 = stream[1].split(']');
							 str3 +=xyz[a].replace('|'+stream2[0], '');
                            str3 = str3.replace(/[\[\]']/g,'' );
                          str3 += ':\n';
						  //console.log(2)
                        }else if(count == 1 && count2 == 1){
                            var str = xyz[a].split('|');
                            var str2 = str[1].split(']');
                            var stream = xyz[a].replace('|'+str2[0], '');
                            var str3 = str[2].split(']');
                            var stream2 = stream.replace('|'+str3[0], '');
                            str3 += stream2.replace(/[\[\]']/g,'' );
                            str3 += ':\n';
							//console.log(3)
                        }
                    }
					if(a==xyz.length-1){
						console.log(str3);
						res.json(str3);
					}
                }
				
				}
					
			}
				});
});
router.get("/extractClass/:obj/:seq",function(req,res){
	 db("class_diagram").findOne({id:req.params.obj}).exec(function(err,obj){
	 db("class_diagram").findOne({id:req.params.seq}).exec(function(err,seq){
		 var str1seq="";
		 var strseq2="";
		 var str1obj="";
		 var clas="";
		 var lastobj="";
		 		var strseq=seq.diagram.split("\n");
		 		var strobj=obj.diagram.split("\n");
				for(var a=0;a<strseq.length;a++){
				for(var b=0;b<strobj.length;b++){
					lastobj=strobj[b].split("-");
					for(var c=0;c<lastobj.length;c++){
					str1seq=strseq[a].split("-");
					str1obj=objString(lastobj[c]);
					//console.log("obj"+str1obj);
					strse=str1seq[0].replace (/"/g,'');
					//console.log("seq"+strse);
					strseq2=strseq[a].replace (/"/g,'').split(":");
					if(str1obj==strse){
					strobj2=strobj[b].split("]");
					var count = lastobj[c].split('|').length-1;
					//console.log(count);
					if(count < 1){
						clas+=strobj2[0]+"||"+strseq2[1]+"\n]"+strobj2[1]+"]";
						//console.log(clas);
						if(a==strseq.length-1 && b==strobj.length-1){
							res.json(clas.replace (/"/g,''));
						}
					}else{
						clas+=strobj2[0]+"|"+strseq2[1]+"\n]"+strobj2[1]+"]";
						//console.log(clas);
						if(a==strseq.length-1 && b==strobj.length-1){
							res.json(clas.replace (/"/g,''));
						}
					}
						
					}															
				}
				}
				}			
	 });	 
	 });	 
 });
router.get("/getSome/:id",function(req,res){
	// console.log(req.params.id);
	if(req.params.id==2){
		db("class_diagram").find().where({type:"use case diagram"})
		.exec(function(err,models){
			if(err){
				console.log(err);
			}
			else{
				res.json(models);
			}
		});
	}
});
router.get("/object_diagrams",function(req,res){
	db("class_diagram").find().where({type:'object diagram'}).exec(function(err,models){
		if(err){
			console.log(err);
		}
		else{
			res.json(models);
		}
	});
});
router.get("/usecase_diagrams",function(req,res){
	db("class_diagram").find().where({type:'usecase diagram'}).exec(function(err,models){
		if(err){
			console.log(err);
		}
		else{
			res.json(models);
		}
	});
});
router.get("/sequence_diagrams",function(req,res){
	db("class_diagram").find().where({type:'sequence diagram'}).exec(function(err,models){
		if(err){
			console.log(err);
		}
		else{
			res.json(models);
		}
	});
});

module.exports = router;
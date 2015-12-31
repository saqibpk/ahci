
var express = require('express');
var router = express.Router();

router.get('/',function(req,res){
	 res.sendfile('./views/index.html');
});

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
	console.log(req.body);
	db('class_diagram').create({diagram:req.body.data,name:req.body.name},function(err,model){
		if(err){
			console.log(err);
		}
		else{
			if (req.body.type==1){
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
	db("class_diagram").findOne({id:req.body.id})
	.exec(function(err,model){
		if(err){
			console.log(err);
		}
		else{
			model.diagram=req.body.data;
			model.save(function(err){
				if(err){
					console.log(err);
				}
				else{
					res.json({message:"Updated"});
				}
			});
		}
	});
});
router.get('/extract/:id', function(req, res){
	/*  db('class_diagram').findOne({id: req.params.id}).exec(function(err, model){
		if(model){
			var b = [];
			for(var i = 0; i < model.length; i++){
				var st=model[i].diagram.replace (/"/g,'');
				var str = st.split('<actor>');
				//console.log(str);
				//for(var a=0;a<str.length;a++){
			var str2 = str[1].split(']');
				console.log(str2);
				if(b.indexof(str2)[0] == -1){
					b.push(str2[0]);
				}
			//}
			}
			for(var i = 0; i < b.length; i++){
				var objectString = "["+b[i]+"]\n";
				if(i==b.length-1){
					res.json(objectString);
				}
			}
		}
	});  */
	db('class_diagram').findOne({id: req.params.id}).exec(function(err, usecase){
		if(usecase){
			var string = usecase.diagram;//replace (/"/g,'');
			var model = [];
			console.log(string);
			model = string.split('\n');
			var b = [];
			for(var i = 0; i < model.length; i++){
				var count = model[i].split("<actor>").length - 1;
				if(count > 0){
					var str = model[i].split('<actor>');
					var str2 = str[1].split(']');
					console.log("str1:"+str);
					console.log("str2:"+str2);
					//if(b.indexof(str2[0]) == -1){
						b.push(str2[0]);
					//}
				}
			}
			for(var i = 0; i < b.length; i++){
				var objectString = "["+b[i]+"]\n";
			}
		}
	});

});
 router.get("/getSome/:id",function(req,res){
	 
	 console.log(req.params.id);
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
module.exports = router;
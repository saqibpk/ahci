 var mysql = require('sails-mysql');
module.exports = {

 identity: 'class_diagram',
  adapters: {
		mysqlAdapt: mysql
	},
connection: 'mysqlDB',
  schema:true,
  migrate: 'safe',
 attributes: {
	  diagram:'text',
	  name:'string',
	  type:{
		  type:'string'
	  }
  }
};
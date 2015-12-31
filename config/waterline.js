var mysqlAdapter = require('sails-mysql');

//var mongoAdapter = require('sails-mongo');
module.exports = {

  // Setup Adapters
  // Creates named adapters that have have been required
  adapters: {
   // mongoAdapt: mongoAdapter
    mysqlAdapt: mysqlAdapter
  },

  // Build Connections Config
  // Setup connections using the named adapter configs
  connections: {

    mysqlDB: {
      adapter: 'mysqlAdapt',
      
	 user : process.env.OPENSHIFT_MYSQL_DB_USERNAME || "root",
		password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD || "",
		database : process.env.OPENSHIFT_GEAR_NAME || 'classDiagram',
		host:process.env.OPENSHIFT_MYSQL_DB_HOST || "localhost",
		port:process.env.OPENSHIFT_MYSQL_DB_PORT,
		
      supportBigNumbers:true, //true/false
      debug:false,  //['ComQueryPacket'], //false or array of node-mysql debug options
      trace:true //true/false
    } 
   }

};

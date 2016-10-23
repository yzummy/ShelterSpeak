// Http stuff
var express = require('express')();
// Server
var app = require('http').Server(express);
// Websockets
var io = require('socket.io').listen(app);
// Sql queries
var sql = require('mysql');


// Database info
var db = {
	   host: "127.0.0.1",
           user: "admins17v2PQ",
	   password: "41_FmDGUA8ha",
           database: "homeless"
	 };

var connections = [];

// Connect to database
var dbCon = sql.createConnection(db);

dbCon.connect(function(err)
	      {
	        if(err)
		{
		  console.log("Error connecting to db: " + err);
		  return;
		}

		console.log("Connected to db!");
	      });

// HTTP request handling
// JS file requests
express.get("/prefixfree.min.js",
	    function(req, res)
	    {
              res.sendFile(__dirname + "/prefixfree.min.js");
	    });

// HTML file requests
// Index - test page for now
express.get('/index',
	function(req, res)
	{
	  res.sendFile(__dirname + "/index.html");
	});
// Register.html
express.get('/register.html',
	    function(req, res)
	    {
              res.sendFile(__dirname + "/register.html");
	    });
// Directions
express.get('/CoordinateBasedDirections.html',
	    function(req, res)
	    {
	      res.sendFile(__dirname + "/CoordinateBasedDirections.html");
	    });
// viewShelter - shelter main page
express.get('/shelterView.html',
            function(req, res)
	    {
               res.sendFile(__dirname + "/shelterView.html");
	    });

// CSS file request
express.get('/style.css',
	    function(req, res)
	    {
              res.sendFile(__dirname + "/style.css");
	    });
// CSS file for registration
express.get('/register.css',
	    function(req, res)
	    {
	      res.sendFile(__dirname + "/register.css");
	    });

// Css for shelter main page
express.get('/shelterView.css',
	    function(req, res)
	    {
              res.sendFile(__dirname + "/shelterView.css");
	    });

// Socket callbacks
io.on("connection",
      function(socket)
      {
	console.log("Socket connection!");
	// Database query for all buy SELECT
	socket.on("run",
		  function(queryStr)
		  {
		    console.log("Running: " + queryStr);
	            dbCon.query(queryStr,
				function(err, rows)
				{
				  if(err)
			          {
			            console.log("Error: " + err);
				    return;
				  }
				});
		  });
        // Database query for SELECT
	socket.on("query",
	          function(queryStr)
		  {
		    console.log("Querying: " + queryStr);
	            dbCon.query(/*sql.escape*/(queryStr),
				function(err, rows)
				{
				  if(err)
			          {
			            console.log("Error: " + err);
				    return;
				  }
				  // Log data (for debuggin)
				  console.log("First entry in results: " + JSON.stringify(rows[0]));
				  // Send data, client will parse it
				  socket.emit("queryResult", rows);
				});
		  });
	
	socket.on("login",
		  function(id)
		  {
	            // Store socket ID and hostname
		    connections.push({'id': id,
		                      'host': socket.handshake.address});

		    console.log("Adding host: " + socket.handshake.address);
		    // Index of what we just pushed
		    var index = connections.length - 1;

		    // When socket disconnects, give 5 minutes to reconnect
		    socket.on("disconnect",
			      function()
			      {
		                // Set timeout to expire
		                setTimeout(function()
			                   {
				             console.log("Deleting " + index);
				             // Delete in 5 minutes
			                     connections.splice(index, 1);
			                   }, 1000 * 60 * 10);
			      });
		  });
	socket.on("findme",
		  function(host)
		  {
	            console.log("Looking for " + host + " in " + connections.length + " entries...");
	            // Flip through connections, look for that hostname
		    for(var i = 0; i < connections.length; i ++)
		    {
	              console.log(connections[i].host + " == " + host);
                      if(connections[i].host == host)
		      {
			console.log("Found user: " + connections[i].id);
			// User found
		        socket.emit("foundYou", connections[i].id);
			return;
		      }
		    }
                    // User not found - user has to log in
		    socket.emit("notFoundYou");
		  });
      });

// Port and IP address
var server_port =  8081;
var server_ip_address = 'localhost';

// Begin listening for requests
app.listen(server_port, server_ip_address,
	      function()
	      {
	        console.log("Listening on " + server_ip_address + ":" + server_port);
	      });

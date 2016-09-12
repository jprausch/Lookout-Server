var http = require("http");
var express = require('express');         // Express Lib for easy RESTful API
var fs = require("fs");
var p = require("node-protobuf");         // Protocol Buf Serializer/Parser
var concat = require('unique-concat');    // Lib for combing 2 arrays and removing duplicates

var eventHandle = express();
// Create the protcol parser
var pb = new p(fs.readFileSync("ip_event.desc"));

const assert = require('assert');
const PORT = 8080;

var appArray = new Array();

// Sorting Function for ints
function sortNumber(a,b) {
    return a - b;
}

// This function sorts and turns the ints to strings for final result
// Numerical sorting is faster thus IPs were saved as ints
//
// Input: array of ints representing IPs
// Return: array of strings

function sortAndStringIps(ips) {
    ips.sort(sortNumber);
    var ipStr = [];
    for (ii = 0; ii < ips.length; ii++) {
        ipStr.push(numToIp(ips[ii]));
    }
    return ipStr;
}

// Function Builds and return 3 return values
//
//Input Key - app_sha256
//Output - Object with count, good IP List and bad IP List
function createGetResponse(key) {
    var count = 0;
    var goodCount = 0;
    var goodIp = 0;
    var badIp = [];
    // Loop through all base array keys
    if (typeof appArray[key] !== 'undefined') {
        count  = appArray[key].badCount;
        badIp = appArray[key].badArray.slice();
        for (var ipBase in appArray[key].ipArray) {
            // Keep Track of Total Count
            count += appArray[key].ipArray[ipBase].count;
            // If new key count is greater than this is the good count for now
            if (goodCount < appArray[key].ipArray[ipBase].count) {
                // move good to bad
                if (goodIp) {
                    badIp = concat(badIp, appArray[key].ipArray[goodIp].ip);
                }
                // Update Count and ipBase Key
                goodCount = appArray[key].ipArray[ipBase].count;
                goodIp = ipBase;
            } else {
                // Add to Bad IPs
                badIp = concat(badIp, appArray[key].ipArray[ipBase].ip);
            }
        }
        return {
            count: count,
            goodIp: sortAndStringIps(appArray[key].ipArray[goodIp].ip),
            badIp: sortAndStringIps(badIp)
        };
    } else {
        // Should not get here but be safe
        // having a seperate return in error case prevents having to copy good IP array
        return {
        count: 0,
        goodIp: [],
        badIp: []
        };
    }
    return count;
}

// Functions to initialize associative arrays
function eventConstructor() {
    this.ipArray = new Array();
    this.badArray = new Array();
    this.badCount = 0;
}
function ipConstructor() {
    this.count = 1;
    this.ip = new Array();
}

// Function Adds IP to appropriate app_sha256 and base IP Array
//
// Input key - app_sha256
//       ip - ip of event
// Output: None
function addEvent(key, ip) {
    // If the key is not there create new object
    if (!(key in appArray)) {
        appArray[key] = new eventConstructor();
    }
    // Netmask and save in appropiate block
    var base = ip & 0xfffffff0;
    var bcast = base | 0xf;
    if (ip == base || ip == bcast) {                        
        // Base Addrs and B-Cast addrs are automatically bad
        if ( appArray[key].badArray.indexOf(ip) == -1) {
            appArray[key].badArray.push(ip);
            appArray[key].badCount += 1;
        }
    } else {
        if (typeof appArray[key].ipArray[base] !== 'undefined') {
            appArray[key].ipArray[base].count += 1;
        } else {
            appArray[key].ipArray[base] = new ipConstructor();
        }
        if (appArray[key].ipArray[base].ip.indexOf(ip) == -1) {
            // Save unique address as int for faster sorting
            appArray[key].ipArray[base].ip.push(ip);
        }
    }
}

// Function to convert integer to ip addr
function numToIp(number) {
    // Convert the int 
    var ip = number%256;
    for (var ii=1; ii<=3; ii++)
    {
        number = Math.floor(number/256);
        ip = number%256 + '.' + ip;
    }
    return ip; // Return the string
}

function clearStorage() {
    appArray = new Array();
}

// Function is necessary to fill in the ID field in the re params
eventHandle.param('id', function (req, res, next, id) {
  next();
});

// Respond to get of /events/:app_sha256
eventHandle.get('/events/:id', function (req,res) {
    // If the id is in the array go build the JSON Msg
    if (req.params.id in appArray) { 
       var getValues = createGetResponse(req.params.id);
       res.json({ count: getValues.count, good_ips: getValues.goodIp, bad_ips: getValues.badIp});
       return;
    } else {
        res.status(404).send('App Information Not Found!');
        return;
    }
});

//Handle Posts to /events
eventHandle.post('/events', function (req, res) {
    // Check the content type
    if (!req.is('application/octet-stream')) {
        res.status(400).send('Invalid Content Type!');
        return;
    }
    // get the Protobuf
    var body = [];
    // Get the data buf and parse
    req.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body); // Make one large Buffer of it
        try {
            // Parse the protobuf into an object
            var eventObj = pb.parse(body, "lookout.backend_coding_questions.q1.IpEvent");
        } catch (err) {
            // Bad Protobuf 
            res.status(400).send('Invalid Protobuf!');
            return;
        }
        // IP Address is out of range
        if (4294967295 < eventObj.ip) {
            res.status(400).send('Invalid IP in Protobuf!');
            return;
        }
        addEvent(eventObj.app_sha256, eventObj.ip);
        res.send('OK');
    });
});

// Handle Delete Event
eventHandle.delete('/events', function(req, res) {
    clearStorage();
    res.send('OK');
});

// Now Start the Service
var server = eventHandle.listen(PORT, () => {
    var port = server.address().port;
    console.log('App listening on port %s', port);
});

// Export Functions for Unit Testing
module.exports = {
  numToIp: numToIp,
  clearStorage: clearStorage,
  addEvent: addEvent,
  createGetResponse: createGetResponse,
  server
}

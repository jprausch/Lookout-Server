# Lookout-Server
Web App project for Lookout

The following project is added to solve question 2 of Lookout's coding questions.  The coding questions can be found at the following URL:
https://github.com/lookout/backend-coding-questions

As the project required a webserver with a limited amount of time to complete I chose to forego my prefered language of C++ and chose Javascript instead.  Though my Javascript has been limited to scripts that do minor editing of html documents, I felt more comfortable with it than any other choice.  I went with Javascript because the ease of setup of the webserver and the supporting libraries make it easy to create a RESTful API efficiently and cleanly.

In order to run my web app in your own environment you need to install the webserver Node JS:
https://nodejs.org/en/download/

After installation you need to install the following packages:
- npm install node-protobuf		- Package to serialize and parse Google Proto Bufs
- npm install express					- Fast Web Framework for Node JS
- npm install unique-concat		- Package that combines two arrays into one and deletes duplicate entries

For Running the test script you need to install the additional packages:
- npm install mocha						- Test Framework
- npm install chai						- Chai is a BDD / TDD assertion library
- npm install chai-http				- Chai Extension for HTTP

Files:
- main.js - This is the web app that solves the problem presented
- test.js - This is the automated tes
- ip_event.proto - Google Protocol Buffer Description provided by Lookout
- ip_event.desc - Machine readable output of protoc for node-protobuf library

To run the server:
%node [path]/main.js

To run the test suite:
%[path]/node_modules/mocha/bin/mocha [path]/test.js

Note: test.js and main.js should be in the same directory when running test.js.

Output of test suite:

  Unit Tests for Good/Bad IP Lists
  
    Number to IP Converter
      ✓ converts numbers to ip
    Test Data Store
      Test Data Store Valid
        ✓ takes ip and hash and returns good Ip, bad Ip, and and count
      Test Data Store Empty
        ✓ clear data Store and return good Ip, bad Ip, and count
  
  Integration Tests
  
    Post Tests
      Post To Invalid URL
        ✓ should return 404
      Post To Valid URL with Bad data
        ✓ should return 400
      Post with bad data (IP Address > 255.255.255.255)
        ✓ should return 400
      Post with conent-type
        ✓ should return 400
      Post with valid-data
        ✓ should return 200
        ✓ should return 200
        ✓ should return 200
        ✓ should return 200
        ✓ add base ip, should return 200
        ✓ add broadcast ip, should return 200
        ✓ should return 200
    Get and Delete Tests
      Get Valid URL
        ✓ should return 200 and valid data with base and broadcast IPs on bad list
      Delete Valid URL
        ✓ should return 200
      Get InValid URL
        ✓ should return 404
      Get InValid URL
        ✓ should return 404
      Delete InValid URL
        ✓ should return 404




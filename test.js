var expect    = require("chai").expect;
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var main = require("./main");
var p = require("node-protobuf");
var fs = require("fs");

var pb = new p(fs.readFileSync("ip_event.desc"));

chai.use(chaiHttp);

describe("Unit Tests for Good/Bad IP Lists", function() {
    describe("Number to IP Converter", function() {
        it("converts numbers to ip", function() {
            var zeroIp = main.numToIp(0);
            var normalIp = main.numToIp(287454020);
            var bCastIp = main.numToIp(4294967295);
    
            expect(zeroIp).to.equal("0.0.0.0");
            expect(normalIp).to.equal("17.34.51.68");
            expect(bCastIp).to.equal("255.255.255.255");
        });
    });
    describe("Test Data Store", function() {
        describe("Test Data Store Valid", function() {
            it("takes ip and hash and returns good Ip, bad Ip, and and count", function() {
                main.clearStorage();
                main.addEvent("testhash1",0);
                main.addEvent("testhash1",4294967295);
                main.addEvent("testhash1",287454020);
                main.addEvent("testhash1",287454021);
                main.addEvent("testhash1",287454022);
                main.addEvent("testhash1",287454023);
                main.addEvent("testhash1",287454024);
                main.addEvent("testhash1",287454025);
                main.addEvent("testhash1",287454026);
                main.addEvent("testhash1",287454027);
                main.addEvent("testhash1",287454028);
                main.addEvent("testhash1",287454029);
                main.addEvent("testhash1",287454030);
                main.addEvent("testhash1",287454021);
                main.addEvent("testhash1",287454022);
                main.addEvent("testhash1",287454023);
                main.addEvent("testhash1",345566665);

                var getObject = main.createGetResponse("testhash1");
        
                expect(getObject.count).to.equal(17);
                expect(getObject.goodIp).to.eql([ '17.34.51.68', '17.34.51.69', '17.34.51.70', '17.34.51.71', '17.34.51.72', '17.34.51.73', '17.34.51.74', '17.34.51.75', '17.34.51.76', '17.34.51.77', '17.34.51.78' ]);
                expect(getObject.badIp).to.eql([ '0.0.0.0', '20.152.237.201', '255.255.255.255' ]);
            });
        });
        describe("Test Data Store Empty", function() {
            it("clear data Store and return good Ip, bad Ip, and count", function() {
                main.clearStorage();
                var getObject = main.createGetResponse("testhash1");
                expect(getObject.count).to.equal(0);
                expect(getObject.goodIp).to.eql([]);
                expect(getObject.badIp).to.eql([]);
            });
        });
    });
});

describe("Integration Tests", function() {
    describe("Post Tests", function() {
        describe("Post To Invalid URL", function() {
            it('should return 404', function (done) {
                chai.request(main.server).post('/blobs')
                .set('content-type', 'application/octet-stream')
                .send()
                .end(function(err, res){
                    res.should.have.status(404);
                    done();
                });
            });
        });
        describe("Post To Valid URL with non-Json data", function() {
            it('should return 400', function (done) {
                chai.request(main.server).post('/events')
                .set('content-type', 'application/octet-stream')
                .send("Bogus:Data")
                .end(function(err, res){
                    res.should.have.status(400);
                    done();
                });
            });
        });
        describe("Post with bad Json data (IP Address > 255.255.255.255)", function() {
             it('should return 400', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "4294967296"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server).post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(400);
                    done();
                });
            });
        });
        describe("Post with invalid content-type", function() {
             it('should return 400', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "4294967294"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/json')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(400);
                    done();
                });
            });
        });
        describe("Post with valid-data", function() {
             it('should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "4294967295"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
             });
             it('should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "287454021"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
             });
             it('should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "287454022"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
             });
             it('should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "287454023"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
             });
             it('add base ip, should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "287454016"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
             });
             it('add broadcast ip, should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "287454031"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
             });
             it('should return 200', function (done) {
                var obj = {
                    "app_sha256": "testhash1",
                    "ip": "345566665"
                }
                var buf = pb.Serialize(obj, "lookout.backend_coding_questions.q1.IpEvent");
                chai.request(main.server)
                .post('/events')
                .set('content-type', 'application/octet-stream')
                .send(buf)
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
            });
        });
    });
    describe("Get and Delete Tests", function() {
        describe("Get Valid URL", function() {
            it('should return 200 and valid data with base and broadcast IPs on bad list', function (done) {
                chai.request(main.server).get('/events/testhash1')
                .send()
                .end(function(err, res){
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('count');
                    res.body.should.have.property('good_ips');
                    res.body.should.have.property('bad_ips');
                    res.body.count.should.equal(7);
                    res.body.good_ips.should.be.a('array');
                    res.body.bad_ips.should.be.a('array');
                    res.body.good_ips.should.eql([ '17.34.51.69', '17.34.51.70', '17.34.51.71' ]);
                    res.body.bad_ips.should.eql([ '17.34.51.64', '17.34.51.79', '20.152.237.201', '255.255.255.255' ]);
                    done();
                });
            });
        });
        describe("Delete Valid URL", function() {
            it('should return 200', function (done) {
                chai.request(main.server).delete('/events')
                .send()
                .end(function(err, res){
                    res.should.have.status(200);
                    done();
                });
            });
        });
        describe("Get InValid URL", function() {
            it('should return 404', function (done) {
                chai.request(main.server).get('/events')
                .send()
                .end(function(err, res){
                    res.should.have.status(404);
                    done();
                });
            });
        });
        describe("Get InValid URL", function() {
            it('should return 404', function (done) {
                chai.request(main.server).get('/events/testhash1')
                .send()
                .end(function(err, res){
                    res.should.have.status(404);
                    done();
                });
            });
        });
        describe("Delete InValid URL", function() {
            it('should return 404', function (done) {
                chai.request(main.server).delete('/events/testhash1')
                .send()
                .end(function(err, res){
                    res.should.have.status(404);
                    done();
                });
            });
        });
    });
});

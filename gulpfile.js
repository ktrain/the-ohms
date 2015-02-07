"use strict";

var gulp = require("gulp"),
    nodemon = require("nodemon");

gulp.task("watch", function(){
	nodemon({ script: "./server.js", watch: ["./server.js"] });
});

gulp.task("default", ["watch"]);


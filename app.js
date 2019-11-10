//jshint esversion : 6

const express = require('express');
const readLine = require('readline');
const fs = require('fs');
const mergeJSON = require('merge-json');
const jsonConcat = require('json-concat');

const files=[];

let inputs= [];
let jsonArray=[];


let rl = readLine.createInterface(process.stdin, process.stdout);
console.log("jsonArray type 'exit' and press enter when inputs are given and enter file size in bytes and add '\\' at end of path");
console.log("Enter : Folder Path, Input File Base Name, Output File Base Name, Max File Size ");

// rl.setPrompt("Enter : Folder Path, Input File Base Name, Output File Base Name, Max File Size ");
// rl.prompt();
// using prompt() won't allow us to use backspace while giving inputs

rl.on('line', function(line){
  if(line==="exit"){
    init();
    rl.close();
  }
  else
    inputs.push(line.toString().trim());
});


function init()
{
  const directory= inputs[0];
  //console.log(directory);
  fs.readdirSync(directory).forEach(function(file){
    if(file.includes(inputs[1])){    // check if file name has the input file base name user entered
      files.push(file);
      //console.log(files);
    }
  });

//merge and concat operations

  var merge = function(...dat) {
  var destination = {},
      sources = [].slice.call(arguments, 0);
  sources.forEach(function( source ) {
      var prop;
      for ( prop in source ) {
        if(memorySizeOf(destination)>inputs[3]){      // check if size exceeds
          console.log("and also the Size Exceeded so let's not be greddy!!!!!!!!!!!!!!!");
          // console.log(memorySizeOf(destination));

        } else {
          if ( prop in destination && Array.isArray( destination[ prop ] ) ) {

              // Concat Arrays
              destination[ prop ] = destination[ prop ].concat( source[ prop ] );

          } else if ( prop in destination && typeof destination[ prop ] === "object" ) {

              // Merge Objects
              destination[ prop ] = merge( destination[ prop ], source[ prop ] );

          } else {

              // Set new values
              destination[ prop ] = source[ prop ];

          }
          //console.log(memorySizeOf(destination));
        }

      }
  });
  return destination;
  };

  //convert and write JSON object to output file

  files.forEach(function(f){
    fs.readFile(directory + f,'utf-8',function(err,data){
      if(err) {
        console.log(err);
      }
      else{
        (function(data){
          var outputObj={};
          data = JSON.parse(data);
          jsonArray.push(data);

              outputObj = JSON.stringify(merge(...jsonArray,outputObj));  //merging if objects concat if arrays and set distinct values as it is

        //console.log(outputObj);
        fs.writeFile(inputs[2]+'.json',outputObj, 'utf-8',function(err){
          if(err) console.log(err);
        });

//The bit of code that's commented below is used to check for size of the file instead of checking the file's components

        // var stats = fs.statSync("res.json");
        // var fileSizeInBytes = stats["size"];
        // //Convert the file size to megabytes (optional)
        // console.log(fileSizeInBytes);
        // if(fileSizeInBytes>inputs[3]){
        //   console.log("File size exceeded ");
        //   fs.writeFile('res.json', {}, 'utf-8',function(err){
        //     console.log(err);
        //   });
        // }
        
        })(data);
      }

    });
  });
  console.log("Done! Now let's go check " + inputs[2] +".json file and hope it's updated :)");
}

function memorySizeOf(obj) {
    var bytes = 0;
    //to easily initialize bytes to 0
    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    }
    return sizeOf(obj);
}

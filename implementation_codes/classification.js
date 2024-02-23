const Fs = require("fs");
const CsvReadableStream = require("csv-reader");
let inputStream = Fs.createReadStream("vscodecomplex.csv", "utf8");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  append: true,
  path: "vscodecomplexclass.csv",
  header: [
    { id: "noOfComments", title: "noOfComments" },
    { id: "bodyLength", title: "bodyLength" },
    { id: "bodyContent", title: "bodyContent" },
    { id: "commentsSentimentValue", title: "commentsSentimentValue" },
    { id: "noOfevents", title: "noOfevents" },
    { id: "filteredUsers", title: "filteredUsers" },
    { id: "noOfDevelopers", title: "noOfDevelopers" },
    { id: "bugAuthor", title: "bugAuthor" },
    { id: "labels", title: "labels" },
    { id: "sameBugFixTime", title: "sameBugFixTime" },
    { id: "timeToFix", title: "timeToFix" },
    { id: "sameBugFixTimeClass", title: "sameBugFixTimeClass" },
    { id: "timeToFixClass", title: "timeToFixClass" },
  ],
});

let dataIntheCsv = [];

let newArr = [];

inputStream
  .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
  .on("data", function (row) {
    dataIntheCsv.push(row);
  })
  .on("end", function (data) {
    console.log("No more rows!");
    for (let i = 0; i < dataIntheCsv.length; i++) {
      let selectedRow = dataIntheCsv[i];
      let sameBugFixTimeclass;
      let bugFixtimeClass;
      if (selectedRow[9] < 33.6) {
        sameBugFixTimeclass = 1;
      } else if (selectedRow[9] < 81.6) {
        sameBugFixTimeclass = 2;
      } else if (selectedRow[9] < 180) {
        sameBugFixTimeclass = 3;
      } else if (selectedRow[9] < 468) {
        sameBugFixTimeclass = 4;
      } else if (selectedRow[9] < 1260) {
        sameBugFixTimeclass = 5;
      } else if (selectedRow[9] < 3744) {
        sameBugFixTimeclass = 6;
      } else {
        sameBugFixTimeclass = 7;
      }
      //////////////////////////////

      if (selectedRow[10] < 33.6) {
        bugFixtimeClass = 1;
      } else if (selectedRow[10] < 81.6) {
        bugFixtimeClass = 2;
      } else if (selectedRow[10] < 180) {
        bugFixtimeClass = 3;
      } else if (selectedRow[10] < 468) {
        bugFixtimeClass = 4;
      } else if (selectedRow[10] < 1260) {
        bugFixtimeClass = 5;
      } else if (selectedRow[10] < 3744) {
        bugFixtimeClass = 6;
      } else {
        bugFixtimeClass = 7;
      }

      const records = {
        noOfComments: selectedRow[0],
        bodyLength: selectedRow[1],
        bodyContent: selectedRow[2],
        commentsSentimentValue: selectedRow[3],
        noOfevents: selectedRow[4],
        filteredUsers: selectedRow[5],
        noOfDevelopers: selectedRow[6],
        bugAuthor: selectedRow[7],
        labels: selectedRow[8],
        sameBugFixTime: selectedRow[9],
        timeToFix: selectedRow[10],
        sameBugFixTimeClass: sameBugFixTimeclass,
        timeToFixClass: bugFixtimeClass,
      };
      newArr.push(records);
      console.count();
    }

    console.log(newArr.length);

    csvWriter.writeRecords(newArr).then(() => {
      console.log("...Done");
    });
  });

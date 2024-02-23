var natural = require('natural');


const Fs = require('fs');
const CsvReadableStream = require('csv-reader'); 
let inputStream = Fs.createReadStream('npmcsv.csv', 'utf8');


const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    append: true,
    path: 'npmcomplex.csv',
    header: [
        { id: 'noOfComments', title: 'noOfComments' },
        { id: 'bodyLength', title: 'bodyLength' },
        { id:'bodyContent',title:'bodyContent'},
        { id: 'commentsSentimentValue', title: 'commentsSentimentValue' },
        { id: 'noOfevents', title: 'noOfevents' },
        { id: 'filteredUsers', title:'filteredUsers' },
        { id: 'noOfDevelopers', title:'noOfDevelopers' },
        { id: 'bugAuthor', title:'bugAuthor' },
        { id: 'labels', title:'labels' },
        { id: 'sameBugFixTime', title: 'sameBugFixTime' },
        { id: 'timeToFix', title: 'timeToFix' },
    ]
});

let dataIntheCsv=[];




    let newArr=[];

    inputStream
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {
        dataIntheCsv.push(row);
    })
    .on('end', function (data) {
        console.log('No more rows!');
        console.log('hi');
        for(let i=0;i<dataIntheCsv.length;i++){
            let selectedRow=dataIntheCsv[i];
            let selectedTitle=selectedRow[2];     
            let maxValue=0;
            let selectedSamelabelObject;         
            for(let j=0;j<dataIntheCsv.length;j++){
                if(i!==j){
                    let selectedRow2=dataIntheCsv[j];
                    let selectedTitle2=selectedRow2[2];
                    let wordsimilarity=natural.JaroWinklerDistance(selectedTitle,selectedTitle2)
                    if(wordsimilarity>=maxValue){
                        maxValue=wordsimilarity;
                        selectedSamelabelObject=dataIntheCsv[j];
                    } 
                   
                }
            }

          
            const records={
                    'noOfComments':selectedRow[0],
                    'bodyLength': selectedRow[1],
                    'bodyContent':selectedRow[2],

                    'commentsSentimentValue': selectedRow[3],
                    'noOfevents':selectedRow[4],
                    'filteredUsers':selectedRow[5],
                    'noOfDevelopers': selectedRow[6],
                    'bugAuthor':selectedRow[7],
                    'labels':selectedRow[8],
                    'sameBugFixTime':selectedSamelabelObject[9],
                    'timeToFix': selectedRow[9],
  
                }
            newArr.push(records);
            console.count();
          
        }

        console.log(newArr.length)
        
    csvWriter.writeRecords(newArr)       // returns a promise
    .then(() => {
        console.log('...Done');
    });
    });


 



  
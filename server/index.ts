import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import { serverAPIPort, APIPath } from '@fed-exam/config';
import { Ticket } from '../client/src/api';

console.log('starting server', { serverAPIPort, APIPath });

const app = express();

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get(APIPath, (req, res) => {

  // @ts-ignore
  let lastPage = "false"
  // @ts-ignore
  let newPage: number = req.query.page || 1;

  // Updating page number in case we passed last page
  // @ts-ignore
  if (tempData.length - newPage * PAGE_SIZE < 0){
    // @ts-ignore
    newPage = newPage - 1;
    lastPage = "true";
  }
  
  
  // Sorting when needed
  // @ts-ignore
  let sortBy : string = req.query.sortBy || "";
  // @ts-ignore
  let reverseString : string = req.query.reverse || "";
  let reverse = reverseString === "true" ? true : false;
  switch(sortBy) {
    case "Email":
      tempData.sort(reverse ? reverseCompareByEmail : compareByEmail);
      break;
    case "Date":
      tempData.sort(reverse? reverseCompareByDate : compareByDate);
      break;
    case "Title":
      tempData.sort(reverse? reverseCompareByTitle : compareByTitle);
      break;
  }
 // @ts-ignore
    let searchVal : string = req.query.searchVal || "";
    const filteredTickets = tempData
			.filter((t) => {
        let searchWords : string = searchVal;
        // check "after:"
        // check "before:"
        let currVal = t.title + t.content;
        if((searchVal).startsWith("after:") && searchVal.length >= 16){
          let dateString = searchVal.slice(6,16);
          searchWords = searchVal.slice(16);
          // Need to check what timezone
          if(t.creationTime < ParseToEpoc(dateString)){
              return false;
          }
        } 
        
          if((searchVal).startsWith("before:") && searchVal.length >= 17){
            let dateString = searchVal.slice(7,17);
            searchWords = searchVal.slice(17);
            if(t.creationTime < ParseToEpoc(dateString)){
              return false;
        }
      }
      console.log("searchVal = " + searchVal);
        if((searchVal).startsWith("from:")){
          // Gets the string until whitespace and then cuts "from:" from it.
          let indexOfWhitespace = Math.max(searchVal.indexOf(' ') !== -1 ? searchVal.indexOf(' ') : searchWords.length) ;
          let searchEmail = searchVal.substr(0,indexOfWhitespace).slice(5);
          searchWords = searchVal.substr(indexOfWhitespace+1);
          if(searchEmail !== t.userEmail){
            return false;
          }
        }
        return (t.title.toLowerCase() + t.content.toLowerCase()).includes(searchWords.toLowerCase())
      });

  const paginatedData = filteredTickets.slice((newPage - 1) * PAGE_SIZE, newPage * PAGE_SIZE);


  res.send({tickets : paginatedData, last_page : lastPage});
});
app.listen(serverAPIPort);
console.log('server running', serverAPIPort)

//Compare functions
function compareByEmail(a:Ticket, b:Ticket ) {
  if ( a.userEmail < b.userEmail ){
    return -1;
  }
  if ( a.userEmail > b.userEmail ){
    return 1;
  }
  return 0;
}

function compareByDate(a:Ticket, b:Ticket ) {
  if ( a.creationTime < b.creationTime ){
    return -1;
  }
  if ( a.creationTime > b.creationTime ){
    return 1;
  }
  return 0;
}

function compareByTitle(a:Ticket, b:Ticket ) {
 let trimmedATitle:string =  a.title.replace(/[^\w\s]/gi, '');
 let trimmedBTitle:string =  b.title.replace(/[^\w\s]/gi, '');
  if ( trimmedATitle < trimmedBTitle ){
    return -1;
  }
  if ( trimmedATitle > trimmedBTitle ){
    return 1;
  }
  return 0;
}

function reverseCompareByEmail(a:Ticket, b:Ticket ) {
  if ( a.userEmail < b.userEmail ){
    return 1;
  }
  if ( a.userEmail > b.userEmail ){
    return -1;
  }
  return 0;
}

function reverseCompareByDate(a:Ticket, b:Ticket ) {
  if ( a.creationTime < b.creationTime ){
    return 1;
  }
  if ( a.creationTime > b.creationTime ){
    return -1;
  }
  return 0;
}

function reverseCompareByTitle(a:Ticket, b:Ticket ) {
  let trimmedATitle:string =  a.title.replace(/[^\w\s]/gi, '');
  let trimmedBTitle:string =  b.title.replace(/[^\w\s]/gi, '');
   if ( trimmedATitle < trimmedBTitle ){
     return 1;
   }
   if ( trimmedATitle > trimmedBTitle ){
     return -1;
   }
   return 0;
 }

 function ParseToEpoc(dateString : string){
  let day = parseInt(dateString.slice(0,2));
  let month = parseInt(dateString.slice(3,5));
  let year = parseInt(dateString.slice(6));
  return (new Date(year,month,day).getTime()) / 1000;
 }
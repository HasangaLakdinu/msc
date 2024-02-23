const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const axios = require("axios");

const { NlpManager } = require("node-nlp");
const csvWriter = createCsvWriter({
  append: true,
  path: "vscodecsv.csv",
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
    { id: "timeToFix", title: "timeToFix" },
  ],
});

async function apiCall() {
  const manager = new NlpManager({ languages: ["en"] });
  let resultArray;
  try {
    let apidata = await axios(
      "https://api.github.com/search/issues?q=repo:microsoft/vscode+label:bug+state:closed&page=10&per_page=50",
      {
        method: "GET",

        headers: { Authorization: `token 9f1644d99c6ec220ed20165e321fc8679b3eec60` },
      }
    );

    resultArray = await Promise.all(
      apidata.data.items.map(async (item) => {
        let bugAuthor = item.user.login;

        let labelnameArray = item.labels.map((label) => label.name);
        let labels = labelnameArray.toString();

        let startDate = new Date(item.created_at);
        let closedDate = new Date(item.closed_at);
        let Difference_In_Time = closedDate.getTime() - startDate.getTime();
        let Difference_In_Hours = Difference_In_Time / (1000 * 3600);

        //getting comments data
        let commentDataForThisBug;
        let commId = 0;
        let commentsSentimentValue = 0;
        let commentUserNames = [];

        let filteredUsers = [];
        let mixedUsers = [];
        if (item.comments > 0) {
          try {
            commentDataForThisBug = await axios(item.comments_url, {
              method: "GET",
              headers: { Authorization: `token 9f1644d99c6ec220ed20165e321fc8679b3eec60` },
            });
            commId = commentDataForThisBug.data[0].id;

            await Promise.all(
              commentDataForThisBug.data.map(async (comm) => {
                try {
                  commentUserNames.push(comm.user.login);
                  let thiscommentSentimentValue = await manager.process(
                    comm.body.replace(/[\r\n\t]/g, "")
                  );
                  commentsSentimentValue =
                    commentsSentimentValue + thiscommentSentimentValue.sentiment.score;
                } catch (error) {
                  console.log(error);
                }
              })
            );
          } catch (error) {
            console.log(error);
          }
        }
        //getting events
        let eventForThisBug;
        let noOfevents;
        let eventUserNames = [];

        try {
          eventForThisBug = await axios(item.events_url, {
            method: "GET",
            headers: { Authorization: `token 9f1644d99c6ec220ed20165e321fc8679b3eec60` },
          });

          noOfevents = eventForThisBug.data.length;
          eventForThisBug.data.map((event) => {
            eventUserNames.push(event.actor.login);
          });
        } catch (err) {}

        mixedUsers = eventUserNames.concat(commentUserNames);

        filteredUsers = mixedUsers.filter(function (item, index) {
          if (mixedUsers.indexOf(item) == index) if (item != "ansibot") return item;
        });

        let filteredUsersString = filteredUsers.toString();
        let noOfDevelopers = filteredUsers.length;

        let fullBodyContent = item.body
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(/`/g, "")
          .replace(/#/g, "")
          .replace(/<!--/g, "")
          .replace(/\*/g, "")
          .replace(/-->/g, "")
          .replace(/\s+/g, " ")
          .replace(/SUMMARY/g, "");
        let fullbodysplitttedArray = fullBodyContent.split("ISSUE TYPE");
        let bodyContent = item.title + " , " + fullbodysplitttedArray[0].substring(0, 300);

        return {
          commentsSentimentValue: commentsSentimentValue,
          timeToFix: Difference_In_Hours,
          noOfComments: item.comments,
          bodyLength: item.body.length,
          noOfevents: noOfevents,
          bodyContent: bodyContent,
          filteredUsers: filteredUsersString,
          noOfDevelopers: noOfDevelopers,
          bugAuthor: bugAuthor,
          labels: labels,
        };
      })
    );
  } catch (err) {
    console.log(err);
  }

  await csvWriter.writeRecords(resultArray);
}
apiCall();

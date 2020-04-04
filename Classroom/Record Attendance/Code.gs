var courseId = 'XXXXXXXXXXXX'; // https://developers.google.com/classroom/reference/rest/v1/courses/list
var topicID = 'YYYYYYYYYYY'; // https://developers.google.com/classroom/reference/rest/v1/courses.topics/list

var startDate = new Date(); // new Date("dd-MMM-yyyy")
var scheduleForDays = 5; // Number of days to schedule the attendace from 'startDate'

var scheduledTimeHour = 9; // the number 9 (integer value) for 9 AM
var scheduledTimeMinutes = 0; // the number 0 (integer value) for exactly at the 'scheduledTimeHour'
var dueByHour = 15; // 24-hour; the number 15 (integer value) for 3 PM
var dueByMinutes = 30; // the number 30 (integer value) for the 30th minute from 'dueByHour'

function scheduleAttendance() {
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var questionDate = startDate;
  for (var i = 0; i < scheduleForDays; i++) {
    var newDate = new Date(questionDate.getTime() + MILLIS_PER_DAY);
    createQuestion(questionDate);
    questionDate = newDate;
  }
}

function createQuestion(date) {
  var title = "Attendance for " + Utilities.formatDate(date, Session.getScriptTimeZone(), "dd-MMMM-yyyy");
  var scheduledTime = Utilities.formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), scheduledTimeHour, scheduledTimeMinutes, 0), "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  var dueByTime = Utilities.formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), dueByHour, dueByMinutes, 0), "UTC", "yyyy-MM-dd HH:mm:ss");
  var payload = {
    "workType": "MULTIPLE_CHOICE_QUESTION",
    "multipleChoiceQuestion": {
      "choices": [
        "Yes"
      ]
    },
    "title": title,
    "description": "Are you working online in Google Classroom?",
    "scheduledTime": scheduledTime,
    "topicId": topicID,
    "dueDate": {
      "day": date.getDate(),
      "month": date.getMonth() + 1,
      "year": date.getFullYear()
    },
    "dueTime": {
      "hours": new Date(dueByTime).getHours(),
      "minutes": new Date(dueByTime).getMinutes(),
      "seconds": 0
    }
  };
  Classroom.Courses.CourseWork.create(payload, courseId); // https://developers.google.com/classroom/reference/rest/v1/courses.courseWork/create
}

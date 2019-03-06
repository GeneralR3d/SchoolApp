'use strict';

//----------------------------------------------------------------------------------------------------\\

var STUDENTROLE = {};

//----------------------------------------------------------------------------------------------------\\

STUDENTROLE.updateUser = async () => {
  await STUDENTROLE.updateUserData();
  await STUDENTROLE.updateTeachers();
  await STUDENTROLE.updatePtmTimeslots();
};

STUDENTROLE.updateUserData = async () => {
  var user = await FIRESTORE.doc(`users/${USER.email}`).get();

  USER.class = user.data().class;
  USER.subjects = user.data().subjects;
  USER.teachers = {};
};

STUDENTROLE.updateTeachers = async () => {
  try {
    var teacherCollection = await FIRESTORE.collection(`classes/${USER.class}/teachers`).get();

    teacherCollection.docs.forEach((teacherDoc) => {
      USER.teachers[teacherDoc.id] = {
        name: teacherDoc.data().name,
        subjects: teacherDoc.data().subjects,
      }
      ROUTES[`/${teacherDoc.id.split('@')[0].split('.').join('_')}`] = {
        template: teacherPage,
        script: 'scripts/pages/teacherView.js',
      };
    });
  } catch (error) {
    console.error('[App, Firebase]', error);
  }
};

STUDENTROLE.updatePtmTimeslots = async () => {
  try {
    USER.bookedTimeslots = [];
    for (var teacherEmail in USER.teachers) {
      var timeslotCollection = await FIRESTORE.collection(`users/${teacherEmail}/timeslots`).get();

      var teacher = USER.teachers[teacherEmail];
      teacher.availableTimeslots = [];
      if (timeslotCollection.docs.length > 0) {
        timeslotCollection.docs.forEach((timeslotDoc) => {
          var timeslotData = timeslotDoc.data();
          if (timeslotData.available) {
            teacher.availableTimeslots.push(timeslotDoc);
          } else if (timeslotData.user === USER.email) {
            teacher.bookedTimeslot = timeslotDoc;
            USER.bookedTimeslots.push({
              teacherEmail: teacherEmail,
              time: timeslotData.time,
            });
          }
        });
      }
    }

    USER.bookedTimeslots.sort((a, b) => {
      return new Date(a.time) - new Date(b.time);
    });
  } catch (error) {
    console.error('[App, Firebase]', error);
  }
};

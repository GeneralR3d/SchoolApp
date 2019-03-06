'use strict';

//----------------------------------------------------------------------------------------------------\\

var TEACHERROLE = {};

//----------------------------------------------------------------------------------------------------\\

TEACHERROLE.updateUser = async () => {
  await TEACHERROLE.updateUserData();
  // await TEACHERROLE.updateTeachers();
  await TEACHERROLE.updatePtmTimeslots();
};

TEACHERROLE.updateUserData = async () => {
  var user = await FIRESTORE.doc(`users/${USER.email}`).get();

  // USER.class = user.data().class;
  // USER.subjects = user.data().subjects;
};

// TEACHERROLE.updateStudents = async () => {
//   try {
//     var teacherCollection = await FIRESTORE.collection(`classes/${USER.class}/teachers`).get();
//
//     teacherCollection.docs.forEach((teacherDoc) => {
//       USER.teachers[teacherDoc.id] = {
//         name: teacherDoc.data().name,
//         subjects: teacherDoc.data().subjects,
//       }
//       ROUTES[`/${teacherDoc.id.split('@')[0].split('.').join('_')}`] = {
//         template: teacherPage,
//         script: 'scripts/pages/teacherView.js',
//       };
//     });
//   } catch (error) {
//     console.error('[App, Firebase]', error);
//   }
// };

TEACHERROLE.updatePtmTimeslots = async () => {
  try {
    USER.timeslots = [];
    var timeslotCollection = await FIRESTORE.collection(`users/${USER.email}/timeslots`).get();

    USER.timeslots = timeslotCollection.docs;
  } catch (error) {
    console.error('[App, Firebase]', error);
  }
};

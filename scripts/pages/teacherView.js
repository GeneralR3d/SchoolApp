'use strict';

//----------------------------------------------------------------------------------------------------\\

var TEACHER = {
  email: `${window.location.pathname.split('_').join('.').split('/')[1]}@dhs.sg`,
  name: USER.teachers[`${window.location.pathname.split('_').join('.').split('/')[1]}@dhs.sg`].name,
  subjects: USER.teachers[`${window.location.pathname.split('_').join('.').split('/')[1]}@dhs.sg`].subjects,
  timeslots: [],

  teacherCard: document.querySelector('#teacher-card'),

  ptmCard: document.querySelector('#ptm-card'),

  ptmTimeslotSelect: document.querySelector('#ptm-timeslot-select'),
  ptmConfirmButton: document.querySelector('#ptm-confirm-btn'),
};

//----------------------------------------------------------------------------------------------------\\

TEACHER.ptmConfirmButton.addEventListener('click', () => {
  TEACHER.confirmTimeslot();
});

//----------------------------------------------------------------------------------------------------\\

TEACHER.updateUI = () => {
  APP.pageTitle.innerHTML = 'Teacher';

  TEACHER.teacherCard.querySelector('.card-header').innerHTML = TEACHER.name;

  TEACHER.teacherCard.querySelector('.card-content').innerHTML = '';
  TEACHER.subjects.forEach((subject) => {
    var element = document.createElement('p');
    element.appendChild(document.createTextNode(subject));
    TEACHER.teacherCard.querySelector('.card-content').appendChild(element);
  });

  TEACHER.ptmTimeslotSelect.innerHTML = '<option value=""></option>';
  USER.teachers[TEACHER.email].timeslots.forEach((timeslot) => {
    if (timeslot.data().available && !USER.bookedTimes.includes(timeslot.data().time.seconds)) {
      var option = document.createElement('option');
      var textNode = document.createTextNode(new Date(timeslot.data().time.seconds * 1000));
      option.appendChild(textNode);
      option.value = timeslot.id;
      TEACHER.ptmTimeslotSelect.appendChild(option);
    }
  });
};

TEACHER.confirmTimeslot = async () => {
  if (TEACHER.ptmTimeslotSelect.value === '') {
    APP.toggleSnackbar('Please select a timeslot');
  } else {
    try {
      await FIRESTORE.doc(`users/${TEACHER.email}/timeslots/${TEACHER.ptmTimeslotSelect.value}`).update({
        available: false,
        user: USER.email,
      });
      await APP.updateTeacherTimeslots();
      TEACHER.updateUI();
      APP.toggleSnackbar(`Successfully registered meeting for ${TEACHER.name}`);
    } catch (error) {
      console.error('[App, Firebase]', error);
      APP.toggleSnackbar('Confirmation failed, please try again');
    }
  }
};

//----------------------------------------------------------------------------------------------------\\

APP.updateTeacherTimeslots().then(() => {
  TEACHER.updateUI();
});

'use strict';

//----------------------------------------------------------------------------------------------------\\

var PTM = {
  ptmDesktopCard: document.querySelector('#ptm-desktop-card'),
  ptmMobileCard: document.querySelector('#ptm-mobile-card'),

  ptmBookTemplate: document.querySelector('.ptm-book-template'),
  ptmViewTemplate: document.querySelector('.ptm-view-template'),
};

//----------------------------------------------------------------------------------------------------\\

PTM.updateUI = () => {
  if (USER.role !== 'student') {
    APP.toggleSnackbar('Sorry, you need to be a student to access this page');
    APP.togglePage('/');
  } else {
    APP.pageTitle.innerHTML = 'PTM';

    PTM.ptmMobileCard.querySelector('.card-content').innerHTML = '';
    for (var teacherEmail in USER.teachers) {
      var teacher = USER.teachers[teacherEmail];

      var ptmDiv;
      if (teacher.bookedTimeslot) {
        ptmDiv = PTM.ptmViewTemplate.cloneNode(true);

        ptmDiv.querySelector('.ptm-name').innerHTML = teacher.name;
        ptmDiv.querySelector('.ptm-time').innerHTML = new Date(teacher.bookedTimeslot.data().time.seconds * 1000);
      } else {
        ptmDiv = PTM.ptmBookTemplate.cloneNode(true);

        var ptmTeacherName = ptmDiv.querySelector('.ptm-teacher-name');
        var ptmTeacherEmail = ptmDiv.querySelector('.ptm-teacher-email');
        var ptmTeacherSubjects = ptmDiv.querySelector('.ptm-teacher-subjects');
        var ptmTimeslotSelectLabel = ptmDiv.querySelector('.ptm-timeslot-select-label');
        var ptmTimeslotSelect = ptmDiv.querySelector('.ptm-timeslot-select');
        var ptmConfirmButton = ptmDiv.querySelector('.ptm-confirm-btn');

        ptmDiv.className = 'ptm-book card-form';

        ptmTeacherName.innerHTML = teacher.name;
        ptmTeacherEmail.innerHTML = teacherEmail;
        ptmTeacherSubjects.innerHTML = teacher.subjects.join(', ');

        ptmTimeslotSelectLabel.htmlFor = `${teacherEmail}-ptm-timeslot-select`;

        var bookedTimes = USER.bookedTimeslots.map((bookedTimeslot) => {
          return bookedTimeslot.time.seconds;
        });
        ptmTimeslotSelect.id = `${teacherEmail}-ptm-timeslot-select`;
        ptmTimeslotSelect.innerHTML = '<option value=""></option>';
        teacher.availableTimeslots.forEach((timeslot) => {
          if (!bookedTimes.includes(timeslot.data().time.seconds)) {
            var option = document.createElement('option');
            var textNode = document.createTextNode(new Date(timeslot.data().time.seconds * 1000));
            option.appendChild(textNode);
            option.value = timeslot.id;
            ptmTimeslotSelect.appendChild(option);
          }
        });

        ptmConfirmButton.id = `${teacherEmail}-ptm-confirm-btn`;
      }
      PTM.ptmMobileCard.querySelector('.card-content').appendChild(ptmDiv);
    }

    document.querySelectorAll('.ptm-confirm-btn').forEach((button) => {
      button.addEventListener('click', () => {
        PTM.confirmTimeslot(button.id.split('-')[0]);
      });
    });
  }
};

PTM.confirmTimeslot = async (teacherEmail) => {
  document.querySelectorAll('.ptm-confirm-btn').forEach((element) => {
    element.disabled = true;
  });

  var timeslot = document.getElementById(`${teacherEmail}-ptm-timeslot-select`).value;

  if (timeslot === '') {
    APP.toggleSnackbar('Please select a timeslot');

    document.querySelectorAll('.ptm-confirm-btn').forEach((element) => {
      element.disabled = false;
    });
  } else {
    APP.toggleSnackbar(`Booking timeslot for ${teacherEmail}`);
    try {
      var timeslotRef = FIRESTORE.doc(`users/${teacherEmail}/timeslots/${timeslot}`);
      var userRef = FIRESTORE.doc(`users/${teacherEmail}`);

      await FIRESTORE.runTransaction(async (transaction) => {
        return transaction.get(timeslotRef)
          .then((timeslotDoc) => {
            if (timeslotDoc.data().available) {
              transaction.update(timeslotRef, {
                available: false,
                user: USER.email,
              });
              return;
            } else {
              return Promise.reject('Confirmation failed, timeslot already taken');
            }
          });
      });

      APP.toggleSnackbar(`Successfully registered meeting for ${USER.teachers[teacherEmail].name}`);
    } catch (error) {
      console.error('[App, Firebase]', error);
      APP.toggleSnackbar('Confirmation failed, please try again');
    }
    try {
      await STUDENTROLE.updatePtmTimeslots();
      PTM.updateUI();
    } catch (error) {
      console.error('[App, Firebase]', error);
    }
  }
}

//----------------------------------------------------------------------------------------------------\\

STUDENTROLE.updatePtmTimeslots().then(() => {
  PTM.updateUI();
});

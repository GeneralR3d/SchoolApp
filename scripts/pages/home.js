'use strict';

//----------------------------------------------------------------------------------------------------\\

var HOME = {
  userCard: document.querySelector('#user-card'),
  subjectCard: document.querySelector('#subject-card'),
  teacherCard: document.querySelector('#teacher-card'),
  adminCard: document.querySelector('#admin-card'),

  refreshButton: document.querySelector('#refresh-btn'),
  userDataUploadButton: document.querySelector('#user-data-upload-btn'),
  addAdminButton: document.querySelector('#add-admin-btn'),
  deleteAdminButton: document.querySelector('#delete-admin-btn'),

  studentDataInput: document.querySelector('#student-data-input'),
  teacherDataInput: document.querySelector('#teacher-data-input'),

  addAdminSelect: document.querySelector('#add-admin-select'),
  deleteAdminSelect: document.querySelector('#delete-admin-select'),

  students: {},
  teachers: {},
};

//----------------------------------------------------------------------------------------------------\\

HOME.refreshButton.addEventListener('click', async () => {
  HOME.toggleUI();
});

//----------------------------------------------------------------------------------------------------\\

HOME.toggleUI = async () => {
  HOME.userCard.querySelector('.user-card-name').innerHTML = `Welcome ${USER.displayName}`;

  var idTokenResult = await USER.getIdTokenResult(true);
  var role = idTokenResult.claims.role;
  var admin = idTokenResult.claims.admin;

  if (!role && !admin) {
    HOME.refreshButton.hidden = false;
    HOME.userCard.querySelector('.user-card-role').innerHTML = 'Your role has not updated, please click the button below to attempt refresh.';
    APP.toggleSnackbar('Please try again');
  } else {
    if (role) {
      HOME.refreshButton.hidden = true;
      HOME.userCard.querySelector('.user-card-role').innerHTML = `You are signed in as a ${role}.`;

      switch (role) {
        case 'student':
          HOME.subjectCard.hidden = false;
          HOME.teacherCard.hidden = false;

          FIRESTORE.doc(`users/${USER.email}`).get()
            .then((doc) => {
              var subjects = doc.data().subjects;

              subjects.forEach((subject) => {
                var element = document.createElement('p');
                element.appendChild(document.createTextNode(subject));
                HOME.subjectCard.querySelector('.card-content').appendChild(element);
              });

              HOME.subjectCard.querySelector('.card-loader').hidden = true;
            })
            .catch((error) => {
              console.error('[Home, Firebase]', error);
            });

          HOME.teacherCard.querySelector('.card-loader').hidden = true;

          break;
        case 'parent':
          break;
        case 'teacher':
          break;
        default:
          break;
      }
    }
  }
}; // TODO

//----------------------------------------------------------------------------------------------------\\

HOME.toggleUI();

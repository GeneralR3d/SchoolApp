'use strict';

//----------------------------------------------------------------------------------------------------\\

var ADMIN = {
  userDataUploadButton: document.querySelector('#user-data-upload-btn'),
  addAdminButton: document.querySelector('#add-admin-btn'),
  deleteAdminButton: document.querySelector('#delete-admin-btn'),

  studentDataInput: document.querySelector('#student-data-input'),
  teacherDataInput: document.querySelector('#teacher-data-input'),

  addAdminSelect: document.querySelector('#add-admin-select'),
  deleteAdminSelect: document.querySelector('#delete-admin-select'),

  userList: [],
  adminList: [],

  studentData: {},
  teacherData: {},
};

//----------------------------------------------------------------------------------------------------\\

ADMIN.studentDataInput.addEventListener('change', () => {
  ADMIN.updateStudentData();
});

ADMIN.teacherDataInput.addEventListener('change', () => {
  ADMIN.updateTeacherData();
});

ADMIN.userDataUploadButton.addEventListener('click', () => {
  ADMIN.uploadUsers();
});

ADMIN.addAdminButton.addEventListener('click', () => {
  ADMIN.addAdmin();
});

ADMIN.deleteAdminButton.addEventListener('click', () => {
  ADMIN.deleteAdmin();
});

//----------------------------------------------------------------------------------------------------\\

ADMIN.updateUserList = async () => {
  var userCollection = await FIRESTORE.collection('users').get();
  ADMIN.userList = userCollection.docs;
};

ADMIN.updateAdminList = async () => {
  var adminCollection = await FIRESTORE.collection('admins').get();
  ADMIN.adminList = adminCollection.docs;
};

ADMIN.updateUI = () => {
  APP.pageTitle.innerHTML = 'Admin';

  if (!USER.admin) {
    APP.toggleSnackbar('You need to be an admin to access the page. :P');
    APP.togglePage('/');
  } else {
    ADMIN.addAdminSelect.innerHTML = '<option value=""></option>';
    ADMIN.userList.forEach((user) => {
      var option = document.createElement('option');
      var textNode = document.createTextNode(user.id);

      option.value = user.id;
      option.appendChild(textNode);
      ADMIN.addAdminSelect.appendChild(option);
    });

    ADMIN.deleteAdminSelect.innerHTML = '<option value=""></option>';
    ADMIN.adminList.forEach((admin) => {
      var option = document.createElement('option');
      var textNode = document.createTextNode(admin.id);

      if (admin.id !== USER.email) {
        option.value = admin.id;
        option.appendChild(textNode);
        ADMIN.deleteAdminSelect.appendChild(option);
      }
    });
  }
}; // DONE

ADMIN.updateStudentData = () => {
  if (ADMIN.studentDataInput.files.length !== 0) {
    if (window.FileReader) {
      var file = ADMIN.studentDataInput.files[0];

      var reader = new FileReader();

      reader.readAsText(file);

      reader.onload = (event) => {
        event.target.result.split(/\r\n|\n/).forEach((line) => {
          var lineArray = line.split(',');
          var studentEmail, studentName, studentClass, studentSubject;

          studentEmail = line.split(',')[0];

          if (lineArray.length == 4) {
            studentName = lineArray[1];
            studentClass = lineArray[2];
            studentSubject = lineArray[3];
          } else {
            var studentNameArray = [];

            var i = 0;
            for (i; i <= lineArray.length - 4; i++) {
              studentNameArray.push(lineArray[i + 1].replace(/'/, ''));
            }
            studentName = studentNameArray.join(',');
            studentClass = lineArray[i + 1];
            studentSubject = lineArray[i + 2];
          }

          if (!ADMIN.studentData[studentEmail]) {
            ADMIN.studentData[studentEmail] = {
              name: studentName,
              class: studentClass,
              role: 'student',
              subjects: [],
            };
          }

          ADMIN.studentData[studentEmail].subjects.push(studentSubject);
        });

        delete ADMIN.studentData[''];

        console.log(ADMIN.studentData);
      };

      reader.onerror = (error) => {
        console.error('[Admin]', error);
      };
    } else {
      console.error('[Admin] FileReader is not supported in this browser');
      APP.toggleSnackbar('FileReader is not supported in this browser');
    }
  } else {
    ADMIN.studentData = {};
  }
}; // DONE

ADMIN.updateTeacherData = () => {
  return;
}; // TODO

ADMIN.uploadUsers = () => {
  if (ADMIN.studentData === {} && ADMIN.teacherData === {}) {
    console.log('[Admin] No data selected');
    APP.toggleSnackbar('No data selected');
  } else {
    var batch = FIRESTORE.batch();

    if (ADMIN.studentData !== {}) {
      for (var key in ADMIN.studentData) {
        var ref = FIRESTORE.doc(`users/${key}`);
        batch.set(ref, ADMIN.studentData[key]);
      }
    } else {
      console.log('[Admin] No student data detected');
    }
    if (ADMIN.teacherData !== {}) {
      for (var key in ADMIN.teacherData) {
        var ref = FIRESTORE.doc(`users/${key}`);
        batch.set(ref, ADMIN.teacherData[key]);
      }
    } else {
      console.log('[Admin] No teacher data detected');
    }

    batch.commit()
      .then(() => {
        console.log('[Admin] Users Update Successful');

        ADMIN.studentData = {};
        ADMIN.teacherData = {};

        ADMIN.updateUserList()
          .then(() => {
            ADMIN.updateUI();
          });
      })
      .catch((error) => {
        console.error('[Admin, Firebase]', error);
      });
  }
}; // DONE

ADMIN.addAdmin = () => {
  var email = ADMIN.addAdminSelect.value;
  if (email !== '') {
    console.log(`[Admin, Firebase] Making ${email} an admin`);
    APP.toggleSnackbar(`Making ${email} an admin...`);
    APP.addAdmin({
        email: email,
      })
      .then((result) => {
        console.log(result.data);
        APP.toggleSnackbar(result.data.result || result.data.error);

        ADMIN.updateAdminList()
          .then(() => {
            ADMIN.updateUI();
            ADMIN.addAdminSelect.value = '';
          });
      });
  } else {
    console.log('[Admin] No user selected');
    APP.toggleSnackbar('No user selected');
  }
}; // DONE

ADMIN.deleteAdmin = () => {
  var email = ADMIN.deleteAdminSelect.value;
  if (email !== '') {
    console.log(`[Admin, Firebase] Removing ${email} as admin`);
    APP.toggleSnackbar(`Removing ${email} as admin...`);
    APP.deleteAdmin({
        email: email,
      })
      .then((result) => {
        console.log(result.data);
        APP.toggleSnackbar(result.data.result || result.data.error);

        ADMIN.updateAdminList()
          .then(() => {
            ADMIN.updateUI();
            ADMIN.deleteAdminSelect.value = '';
          });
      });
  } else {
    console.log('[Admin] No user selected');
    APP.toggleSnackbar('No user selected');
  }
}; // DONE

//----------------------------------------------------------------------------------------------------\\

ADMIN.updateUserList()
  .then(() => {
    ADMIN.updateAdminList()
      .then(() => {
        ADMIN.updateUI();
      });
  });

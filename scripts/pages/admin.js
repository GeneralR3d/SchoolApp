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

  students: {},
  teachers: {},
};

//----------------------------------------------------------------------------------------------------\\

ADMIN.studentDataInput.addEventListener('change', () => {
  ADMIN.updateStudents();
});

ADMIN.teacherDataInput.addEventListener('change', () => {
  ADMIN.updateTeachers();
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

ADMIN.toggleUI = async () => {
  var idTokenResult = await USER.getIdTokenResult(true);
  var role = idTokenResult.claims.role;
  var admin = idTokenResult.claims.admin;

  if (!role && !admin) {
    APP.togglePage('/');
  } else if (!admin) {
    APP.toggleSnackbar('You need to be an admin to access the page. :P')
    togglePage('/')
  } else {
    var userCollection = await FIRESTORE.collection('users').get();
    userCollection.docs.forEach((user) => {
      var option = document.createElement('option');
      var textNode = document.createTextNode(user.id);

      option.value = user.id;
      option.appendChild(textNode);
      ADMIN.addAdminSelect.appendChild(option);
    });

    ADMIN.deleteAdminSelect.innerHTML = '<option value=""></option>';
    var adminCollection = await FIRESTORE.collection('admins').get();
    adminCollection.docs.forEach((admin) => {
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

ADMIN.updateStudents = () => {
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

          if (!ADMIN.students[studentEmail]) {
            ADMIN.students[studentEmail] = {
              name: studentName,
              class: studentClass,
              role: 'student',
              subjects: [],
            };
          }

          ADMIN.students[studentEmail].subjects.push(studentSubject);
        });

        delete ADMIN.students[''];

        console.log(ADMIN.students);
      };

      reader.onerror = (error) => {
        console.error('[Admin]', error);
      };
    } else {
      console.error('[Admin] FileReader is not supported in this browser');
      APP.toggleSnackbar('FileReader is not supported in this browser');
    }
  } else {
    ADMIN.students = {};
  }
}; // DONE

ADMIN.updateTeachers = () => {
  return;
}; // TODO

ADMIN.uploadUsers = () => {
  if (ADMIN.students === {} && ADMIN.teachers === {}) {
    console.error('[Admin] No data selected');
  } else {
    var batch = FIRESTORE.batch();

    if (ADMIN.students !== {}) {
      for (var key in ADMIN.students) {
        var ref = FIRESTORE.doc(`users/${key}`);
        batch.set(ref, ADMIN.students[key]);
      }
    } else {
      console.log('[Admin] No student data detected');
    }
    if (ADMIN.teachers !== {}) {
      for (var key in ADMIN.teachers) {
        var ref = FIRESTORE.doc(`users/${key}`);
        batch.set(ref, ADMIN.teachers[key]);
      }
    } else {
      console.log('[Admin] No teacher data detected');
    }

    batch.commit()
      .then(() => {
        console.log('[Admin] Users Update Successful');

        ADMIN.students = {};
        ADMIN.teachers = {};
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

        ADMIN.toggleUI();
        ADMIN.addAdminSelect.value = '';
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

        ADMIN.toggleUI();
        ADMIN.deleteAdminSelect.value = '';
      });
  } else {
    console.log('[Admin] No user selected');
    APP.toggleSnackbar('No user selected');
  }
}; // DONE

//----------------------------------------------------------------------------------------------------\\

ADMIN.toggleUI();

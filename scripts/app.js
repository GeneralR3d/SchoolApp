(function() {

  //----------------------------------------------------------------------------------------------------\\

  'use strict';

  //----------------------------------------------------------------------------------------------------\\

  var APP = {
    menuDelay: 0,
    menuHidden: true,

    header: document.querySelector('#header'),
    pageTitle: document.querySelector('#page-title'),
    userButtonContainer: document.querySelector('#user-button-container'),

    allPages: document.querySelectorAll('.page'),
    signInPage: document.querySelector('#sign-in-page'),

    userCard: document.querySelector('#user-card'),
    subjectCard: document.querySelector('#subject-card'),
    teacherCard: document.querySelector('#teacher-card'),
    adminCard: document.querySelector('#admin-card'),

    onlineElements: document.querySelectorAll('.online'),

    profileButton: document.querySelector('#profile-btn'),
    signInButton: document.querySelector('#sign-in-btn'),
    signOutButton: document.querySelector('#sign-out-btn'),
    deleteUserButton: document.querySelector('#delete-user-btn'),
    refreshButton: document.querySelector('#refresh-btn'),
    userDataUploadButton: document.querySelector('#user-data-upload-btn'),
    addAdminButton: document.querySelector('#add-admin-btn'),

    studentDataInput: document.querySelector('#student-data-input'),
    teacherDataInput: document.querySelector('#teacher-data-input'),

    userSelect: document.querySelector('#user-select'),

    cardButtonTemplate: document.querySelector('.card-btn-template'),

    students: {},
    teachers: {},
  };

  const AUTH = firebase.auth();

  const PROVIDER = new firebase.auth.GoogleAuthProvider();

  const FIRESTORE = firebase.firestore();

  const FUNCTIONS = firebase.functions();

  var USER;

  //----------------------------------------------------------------------------------------------------\\

  APP.userButtonContainer.childNodes.forEach((element) => {
    element.addEventListener('animationend', () => {
      if (element.style.opacity === "1") {
        element.hidden = true;
      }
    });
  });

  APP.profileButton.addEventListener('click', toggleUserMenu);

  APP.signInButton.addEventListener('click', handleSignIn);

  APP.signOutButton.addEventListener('click', handleSignOut);

  APP.deleteUserButton.addEventListener('click', deleteUser);

  APP.refreshButton.addEventListener('click', refreshRole);

  APP.userDataUploadButton.addEventListener('click', uploadUsers);

  APP.studentDataInput.addEventListener('change', updateStudents);

  APP.teacherDataInput.addEventListener('change', updateTeachers);

  //----------------------------------------------------------------------------------------------------\\

  function initAuth() {
    AUTH.onAuthStateChanged((user) => {
      APP.profileButton.style.animation = "none";

      toggleOnline(navigator.onLine);

      if (user) {
        console.log("[App, Firebase] User Signed In True");

        USER = user;

        refreshRole();

        toggleUserSignedIn(true);
      } else {
        console.log("[App, Firebase] User Signed In False");

        USER = undefined;

        toggleUserSignedIn(false);
      }
    });
  }; // DONE

  function initFirestore() {
    FIRESTORE.settings({
      timestampsInSnapshots: true,
    });

    FIRESTORE.enablePersistence()
      .catch((error) => {
        console.log("[App, Firebase] Firestore Enable Persistence Error", error);
      });
  }; // DONE

  function initFunctions() {
    var addAdmin = firebase.functions().httpsCallable('addAdmin');

    APP.addAdminButton.addEventListener('click', () => {
      var email = APP.userSelect.value;
      if (email !== "") {
        console.log("[App, Firebase] Making " + email + " an admin");
        addAdmin({
            text: email,
          })
          .then((result) => {
            console.log(result.data.result);
          });
      } else {
        console.error("[App, Firebase] No user selected");
      }
    });
  }; // TODO

  function handleSignIn() {
    AUTH.signInWithRedirect(PROVIDER)
      .then((result) => {
        console.log("[App, Firebase] User Sign In Successful");
        console.log(result);
      })
      .catch((error) => {
        console.error("[App, Firebase] User Sign In Error", error);

        APP.signInButton.innerHTML = "Error... Sign In Again";
      });
  }; // DONE

  function handleSignOut() {
    AUTH.signOut()
      .then(() => {
        console.log("[App, Firebase] User Sign Out Successful");
      }).catch((error) => {
        console.error("[App, Firebase] User Sign Out Error", error);
      });
  }; // DONE

  function deleteUser() {
    USER.delete().then(() => {
      console.log("[App, Firebase] Delete User Successful");
    }).catch((error) => {
      console.error("[App, Firebase] Delete User Error", error);
    });
  }; // DONE

  function refreshRole() {
    USER.getIdTokenResult(true)
      .then((idTokenResult) => {
        toggleUI(idTokenResult.claims.role, idTokenResult.claims.admin);
      })
      .catch((error) => {
        console.log("[App, Firebase] Get Id Token Result", error);
      });
  }; // DONE

  function toggleUserSignedIn(userSignedIn) {
    if (userSignedIn) {
      APP.header.style.boxShadow = "0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 2px 9px 1px rgba(0, 0, 0, 0.12), 0 4px 2px -2px rgba(0, 0, 0, 0.2)";
      APP.signInPage.style.transform = "translateY(-100vh)";
      APP.profileButton.style.backgroundImage = "url('" + USER.photoURL + "')";
      APP.signOutButton.disabled = false;
      APP.deleteUserButton.disabled = false;
    } else {
      APP.header.style.boxShadow = "none";
      APP.signInPage.style.transform = "translateY(0)";
      APP.profileButton.style.backgroundImage = "url('/images/icons/icon-144.png')";
      APP.signOutButton.disabled = true;
      APP.deleteUserButton.disabled = true;
      if (!APP.menuHidden) {
        APP.profileButton.click();
      }
      APP.profileButton.style.border = "none";
    }
  }; // DONE

  function toggleUI(role, admin) {
    APP.userCard.querySelector('.user-card-name').innerHTML = "Welcome " + USER.displayName;

    if (role) {
      APP.refreshButton.hidden = true;

      APP.userCard.querySelector('.user-card-role').innerHTML = "You are signed in as a " + role + ".";

      if (admin) {
        APP.adminCard.hidden = false;
        APP.profileButton.style.border = "2px solid red";

        FIRESTORE.collection('users').get().then((collection) => {
          collection.docs.forEach((doc) => {
            var option = document.createElement('option');
            var nameText = document.createTextNode(doc.data().name);

            option.value = doc.id;
            option.appendChild(nameText);
            APP.userSelect.appendChild(option);
          });
        });
      }

      switch (role) {
        case "student":
          APP.subjectCard.hidden = false;
          APP.teacherCard.hidden = false;

          FIRESTORE.doc('users/' + USER.email).get()
            .then((doc) => {
              var subjects = doc.data().subjects;

              subjects.forEach((subject) => {
                var element = document.createElement("p");
                element.appendChild(document.createTextNode(subject));
                APP.subjectCard.querySelector('.card-content').appendChild(element);
              });

              APP.subjectCard.querySelector('.card-loader').hidden = true;
            })
            .catch((error) => {
              console.error("[App, Firebase]", error);
            });

          APP.teacherCard.querySelector('.card-loader').hidden = true;

          break;
        case "parent":
          break;
        case "teacher":
          break;
        default:
          break;
      }
    } else {
      APP.refreshButton.hidden = false;

      APP.userCard.querySelector('.user-card-role').innerHTML = "Your role has not updated, please click the button below to attempt refresh.";
    }
  }; // TODO

  function toggleUserMenu() {
    if (APP.menuHidden) {
      APP.profileButton.style.animation = "spin--right 0.3s ease";

      APP.userButtonContainer.childNodes.forEach((element) => {
        if (element.nodeType === 1) {
          element.hidden = false;

          element.style.animation = "fade-in--right 0.3s ease forwards";
          element.style.animationDelay = APP.menuDelay + "s";
          element.style.opacity = "0";

          APP.menuDelay += 0.1;
        }
      });
      APP.menuDelay -= 0.1;

      APP.menuHidden = false;
    } else {
      APP.profileButton.style.animation = "spin--left 0.3s ease";

      APP.userButtonContainer.childNodes.forEach((element) => {
        if (element.nodeType === 1) {
          element.style.animation = "fade-out--right 0.3s ease forwards";
          element.style.animationDelay = APP.menuDelay + "s";
          element.style.opacity = "1";

          APP.menuDelay -= 0.1;
        }
      });
      APP.menuDelay += 0.1;

      APP.menuHidden = true;
    }
  }; // DONE

  function updateStudents() {
    if (APP.studentDataInput.files.length !== 0) {
      if (window.FileReader) {
        var file = APP.studentDataInput.files[0];

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
                studentNameArray.push(lineArray[i + 1].replace(/"/, ""));
              }
              studentName = studentNameArray.join(",");
              studentClass = lineArray[i + 1];
              studentSubject = lineArray[i + 2];
            }

            if (!APP.students[studentEmail]) {
              APP.students[studentEmail] = {
                name: studentName,
                class: studentClass,
                role: "student",
                subjects: [],
              };
            }

            APP.students[studentEmail].subjects.push(studentSubject);
          });

          delete APP.students[""];

          console.log(APP.students);
        };

        reader.onerror = (error) => {
          console.error("[App]", error);
        };
      } else {
        console.error("[APP] FileReader is not supported in this browser");
        alert("FileReader is not supported in this browser");
      }
    } else {
      APP.students = {};
    }
  }; // DONE

  function updateTeachers() {
    return;
  }; // TODO

  function uploadUsers() {
    if (APP.students === {} && APP.teachers === {}) {
      console.error("[App, Firebase] No data selected");
    } else {
      var batch = FIRESTORE.batch();

      if (APP.students !== {}) {
        for (var key in APP.students) {
          var ref = FIRESTORE.doc('users/' + key);
          batch.set(ref, APP.students[key]);
        }
      }
      if (APP.teachers !== {}) {
        for (var key in APP.teachers) {
          var ref = FIRESTORE.doc('users/' + key);
          batch.set(ref, APP.teachers[key]);
        }
      }

      batch.commit()
        .then(() => {
          console.log("[App, Firebase] Users Update Successful");

          APP.students = {};
          APP.teachers = {};
        })
        .catch((error) => {
          console.error("[App, Firebase]", error);
        });
    }
  }; // DONE

  //----------------------------------------------------------------------------------------------------\\

  function toggleOnline(onlineState) {
    console.log("[App] isOnline", onlineState);

    if (onlineState) {
      APP.onlineElements.forEach((element) => {
        element.disabled = false;
      });

      APP.signInButton.style.boxShadow = "0 5px #004c8c";
    } else {
      APP.onlineElements.forEach((element) => {
        element.disabled = true;
      });

      APP.signInButton.style.boxShadow = "0 5px #8d8d8d";
    }
  };

  //----------------------------------------------------------------------------------------------------\\

  window.addEventListener('load', () => {
    initAuth();
    initFirestore();
    initFunctions();
  });

  window.addEventListener('wheel', () => {
    console.log('[App] Scroll');
  });

  window.addEventListener('online', () => {
    toggleOnline(true);
  });

  window.addEventListener('offline', () => {
    toggleOnline(false);
  });

  //----------------------------------------------------------------------------------------------------\\

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
          console.log("[App] Service Worker is registered", registration);
        })
        .catch(function(error) {
          console.error("[App] Service Worker registration failed", error);
        });
    });
  } else {
    alert("Your browser does not support service workers!");
  }

  //----------------------------------------------------------------------------------------------------\\

})();

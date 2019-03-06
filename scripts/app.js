'use strict';

//----------------------------------------------------------------------------------------------------\\

var APP = {
  userMenuDelay: 0,
  userMenuHidden: true,
  menuHidden: true,

  snackbarNumber: 0,

  pageScript: document.querySelector('#pageScript'),

  header: document.querySelector('#header'),
  pageTitle: document.querySelector('#page-title'),

  page: document.querySelector('#page'),
  signInPage: document.querySelector('#sign-in-page'),

  menu: document.querySelector('#menu'),
  userMenu: document.querySelector('#user-menu'),

  menuButtons: document.querySelectorAll('.menu-btn'),
  adminButton: document.querySelector('#admin-btn'),
  ptmBookingButton: document.querySelector('#ptm-booking-btn'),

  backButton: document.querySelector('#back-btn'),
  menuButton: document.querySelector('#menu-btn'),
  profileButton: document.querySelector('#profile-btn'),
  signInButton: document.querySelector('#sign-in-btn'),
  signOutButton: document.querySelector('#sign-out-btn'),
  deleteUserButton: document.querySelector('#delete-user-btn'),
};

var ROUTES = {
  '': {
    template: '',
    script: '',
  },
  '/': {
    template: homePage,
    script: 'scripts/pages/home.js',
  },
  '/index.html': {
    template: homePage,
    script: 'scripts/pages/home.js',
  },
  '/ptmBooking': {
    template: ptmBookingPage,
    script: 'scripts/pages/ptmBooking.js'
  },
  '/admin': {
    template: adminPage,
    script: 'scripts/pages/admin.js'
  },
};

const AUTH = firebase.auth();

const PROVIDER = new firebase.auth.GoogleAuthProvider();

const FIRESTORE = firebase.firestore();

const FUNCTIONS = firebase.functions();

var USER = {};

//----------------------------------------------------------------------------------------------------\\

APP.backButton.addEventListener('click', () => {
  window.history.back();
});

APP.menuButton.addEventListener('click', () => {
  APP.toggleMenu();
});

APP.profileButton.addEventListener('click', () => {
  APP.toggleUserMenu();
});

APP.userMenu.childNodes.forEach((element) => {
  element.addEventListener('animationend', () => {
    if (APP.userMenuHidden) {
      element.hidden = true;
    }
  });
});

APP.signInButton.addEventListener('click', () => {
  APP.handleSignIn();
});

APP.signOutButton.addEventListener('click', () => {
  APP.handleSignOut();
});

APP.deleteUserButton.addEventListener('click', () => {
  APP.deleteUser();
});

//----------------------------------------------------------------------------------------------------\\

APP.initAuth = () => {
  AUTH.onAuthStateChanged((user) => {
    APP.profileButton.style.animation = 'none';

    APP.toggleOnline(navigator.onLine);

    if (user) {
      console.log('[App, Firebase] User Signed In', true);

      USER = user;

      APP.toggleUserSignedIn(true);
      APP.updateUser()
        .then(() => {
          APP.updateUI();
          APP.togglePage(window.location.pathname);
        });
    } else {
      console.log('[App, Firebase] User Signed In', false);

      USER = {};

      APP.toggleUserSignedIn(false);
      APP.togglePage('');
    }
  });
}; // DONE

APP.initFirestore = () => {
  FIRESTORE.settings({
    timestampsInSnapshots: true,
  });

  FIRESTORE.enablePersistence()
    .catch((error) => {
      console.log('[App, Firebase] Firestore Enable Persistence Error', error);
    });
}; // DONE

APP.initFunctions = () => {
  APP.addAdmin = firebase.functions().httpsCallable('addAdmin');
  APP.deleteAdmin = firebase.functions().httpsCallable('deleteAdmin');
}; // DONE

APP.handleSignIn = () => {
  AUTH.signInWithRedirect(PROVIDER)
    .then((result) => {
      console.log('[App, Firebase] User Sign In Successful');
      console.log(result);
    })
    .catch((error) => {
      console.error('[App, Firebase] User Sign In Error', error);

      APP.signInButton.innerHTML = 'Error... Sign In Again';
    });
}; // DONE

APP.handleSignOut = () => {
  AUTH.signOut()
    .then(() => {
      console.log('[App, Firebase] User Sign Out Successful');

      APP.togglePage();
    }).catch((error) => {
      console.error('[App, Firebase] User Sign Out Error', error);
    });
}; // DONE

APP.deleteUser = () => {
  USER.delete().then(() => {
    console.log('[App, Firebase] Delete User Successful');
  }).catch((error) => {
    console.error('[App, Firebase] Delete User Error', error);
  });
}; // DONE

APP.updateUser = async () => {
  try {
    var user = await FIRESTORE.doc(`users/${USER.email}`).get();

    if (user.exists) {
      USER.name = user.data().name;
      USER.role = user.data().role;

      switch (USER.role) {
        case 'student':
          await STUDENTROLE.updateUser();
          break;

        case 'teacher':
          await TEACHERROLE.updateUser();
          break;
      }
    } else {
      USER.role = 'guest';
    }

    var idTokenResult = await USER.getIdTokenResult();
    USER.admin = idTokenResult.claims.admin;
  } catch (error) {
    console.error('[App, Firebase]', error);
  }
}; // DONE

APP.updateUI = () => {
  if (USER.admin) {
    APP.profileButton.style.border = '2px solid red';
    APP.adminButton.hidden = false;
  }
  switch (USER.role) {
    case 'student':
      APP.ptmBookingButton.hidden = false;
      break;
    default:

  }
}; // DONE

APP.toggleUserSignedIn = (userSignedIn) => {
  if (userSignedIn) {
    APP.header.style.boxShadow = '0px 0px 10px 0px rgba(0,0,0,0.75)';
    APP.signInPage.style.transform = 'translateY(-100vh)';
    APP.profileButton.style.backgroundImage = `url('${USER.photoURL}')`;
    APP.signOutButton.disabled = false;
    APP.deleteUserButton.disabled = false;
    APP.menuButton.hidden = false;
  } else {
    APP.pageTitle.innerHTML = '';
    APP.header.style.boxShadow = 'none';
    APP.signInPage.style.transform = 'translateY(0)';
    APP.profileButton.style.backgroundImage = 'url("/images/icons/icon-144.png")';
    APP.signOutButton.disabled = true;
    APP.deleteUserButton.disabled = true;
    if (!APP.userMenuHidden) {
      APP.profileButton.click();
    }
    if (!APP.menuHidden) {
      APP.menuButton.click();
    }
    APP.profileButton.style.border = 'none';
    APP.backButton.hidden = true;
    APP.menuButton.hidden = true;
    APP.adminButton.hidden = true;
  }
}; // DONE

APP.toggleMenu = () => {
  if (APP.menuHidden == true) {
    APP.page.style.animation = 'shrink 0.3s ease forwards';
    APP.menuHidden = false;
  } else {
    APP.page.style.animation = 'expand 0.3s ease forwards';
    APP.menuHidden = true;
  }
} // DONE

APP.toggleUserMenu = () => {
  if (APP.userMenuHidden) {
    APP.profileButton.style.animation = 'spin--right 0.3s ease';
    APP.userMenu.childNodes.forEach((element) => {
      if (element.nodeType === 1) {
        element.hidden = false;
        element.style.animation = 'fade-in--right 0.3s ease forwards';
        element.style.animationDelay = `${APP.userMenuDelay}s`;
        element.style.opacity = '0';
        APP.userMenuDelay += 0.1;
      }
    });
    APP.userMenuDelay -= 0.1;
    APP.userMenuHidden = false;
  } else {
    APP.profileButton.style.animation = 'spin--left 0.3s ease';
    APP.userMenu.childNodes.forEach((element) => {
      if (element.nodeType === 1) {
        element.style.animation = 'fade-out--right 0.3s ease forwards';
        element.style.animationDelay = `${APP.userMenuDelay}s`;
        element.style.opacity = '1';
        APP.userMenuDelay -= 0.1;
      }
    });
    APP.userMenuDelay += 0.1;
    APP.userMenuHidden = true;
  }
}; // DONE

APP.togglePage = (path = '') => {
  window.history.pushState({}, path, window.location.origin + path);

  if (path === '/' || path === '/index.html' || path === '') {
    APP.backButton.hidden = true;
  } else {
    APP.backButton.hidden = false;
  }
  APP.page.innerHTML = ROUTES[path].template;
  document.querySelector('.script').remove();
  var script = document.createElement('script');
  script.src = ROUTES[path].script;
  script.className = 'script';
  script.id = ROUTES[path].script;
  document.head.appendChild(script);
}; // DONE

APP.toggleSnackbar = (message) => {
  APP.snackbarNumber += 1;
  var snackbar = document.createElement('div');
  var snackbarId = `snackbar${APP.snackbarNumber}`;

  snackbar.className = 'snackbar';
  snackbar.id = snackbarId;
  snackbar.innerHTML = message;
  document.body.appendChild(snackbar);

  var thisSnackbar = document.querySelector(`#${snackbarId}`);
  setTimeout(() => {
    thisSnackbar.style.animation = 'fade-out--bottom 0.5s ease forwards';
    setTimeout(() => {
      thisSnackbar.remove();
    }, 300);
  }, 3000);
}; // DONE

APP.toggleOnline = (onlineState) => {
  console.log('[App] isOnline', onlineState);

  if (onlineState) {
    document.querySelectorAll('.online').forEach((element) => {
      element.disabled = false;
    });
    APP.signInButton.style.boxShadow = '0 5px #004c8c';

    APP.toggleSnackbar(`You're online! :)`);
  } else {
    document.querySelectorAll('.online').forEach((element) => {
      element.disabled = true;
    });
    APP.signInButton.style.boxShadow = '0 5px #8d8d8d';

    APP.toggleSnackbar(`You've gone offline. :(`);
  }
}; // DONE

//----------------------------------------------------------------------------------------------------\\

window.addEventListener('load', () => {
  APP.initAuth();
  APP.initFirestore();
  APP.initFunctions();
});

window.addEventListener('online', () => {
  APP.toggleOnline(true);
});

window.addEventListener('offline', () => {
  APP.toggleOnline(false);
});

window.onpopstate = () => {
  APP.togglePage(window.location.pathname);
}

//----------------------------------------------------------------------------------------------------\\

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(registration) {
        console.log('[App] Service Worker is registered', registration);
      })
      .catch(function(error) {
        console.error('[App] Service Worker registration failed', error);
      });
  });
} else {
  alert('Your browser does not support service workers!');
}

'use strict';

//----------------------------------------------------------------------------------------------------\\

var APP = {
  menuDelay: 0,
  menuHidden: true,

  snackbarNumber: 0,

  pageScript: document.querySelector('#pageScript'),

  header: document.querySelector('#header'),
  pageTitle: document.querySelector('#page-title'),
  userButtonContainer: document.querySelector('#user-button-container'),

  page: document.querySelector('.page'),
  signInPage: document.querySelector('#sign-in-page'),

  onlineElements: document.querySelectorAll('.online'),

  profileButton: document.querySelector('#profile-btn'),
  signInButton: document.querySelector('#sign-in-btn'),
  signOutButton: document.querySelector('#sign-out-btn'),
  deleteUserButton: document.querySelector('#delete-user-btn'),

  cardButtonTemplate: document.querySelector('.card-btn-template'),
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
  '/admin': {
    template: adminPage,
    script: 'scripts/pages/admin.js'
  }
};

const AUTH = firebase.auth();

const PROVIDER = new firebase.auth.GoogleAuthProvider();

const FIRESTORE = firebase.firestore();

const FUNCTIONS = firebase.functions();

var USER;

//----------------------------------------------------------------------------------------------------\\

APP.userButtonContainer.childNodes.forEach((element) => {
  element.addEventListener('animationend', () => {
    if (element.style.opacity === '1') {
      element.hidden = true;
    }
  });
});

APP.profileButton.addEventListener('click', () => {
  APP.toggleUserMenu();
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
      APP.toggleUI();
    } else {
      console.log('[App, Firebase] User Signed In', false);

      USER = undefined;

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

APP.toggleUserSignedIn = (userSignedIn) => {
  if (userSignedIn) {
    APP.header.style.boxShadow = '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 2px 9px 1px rgba(0, 0, 0, 0.12), 0 4px 2px -2px rgba(0, 0, 0, 0.2)';
    APP.signInPage.style.transform = 'translateY(-100vh)';
    APP.profileButton.style.backgroundImage = `url('${USER.photoURL}')`;
    APP.signOutButton.disabled = false;
    APP.deleteUserButton.disabled = false;
  } else {
    APP.header.style.boxShadow = 'none';
    APP.signInPage.style.transform = 'translateY(0)';
    APP.profileButton.style.backgroundImage = 'url("/images/icons/icon-144.png")';
    APP.signOutButton.disabled = true;
    APP.deleteUserButton.disabled = true;
    if (!APP.menuHidden) {
      APP.profileButton.click();
    }
    APP.profileButton.style.border = 'none';
  }
}; // DONE

APP.toggleUI = async () => {
  var idTokenResult = await USER.getIdTokenResult(true);
  var role = idTokenResult.claims.role;
  var admin = idTokenResult.claims.admin;

  if (!role && !admin) {
    APP.togglePage('/');
  } else {
    if (admin) {
      APP.profileButton.style.border = '2px solid red';
    }
    APP.togglePage(window.location.pathname);
  }
}; // DONE

APP.togglePage = (path = '') => {
  APP.page.innerHTML = ROUTES[path].template;
  // APP.pageScript.src = ROUTES[path].script;
  document.querySelector('.script').remove();
  var script = document.createElement('script');
  script.src = ROUTES[path].script;
  script.className = 'script';
  script.id = ROUTES[path].script;
  document.head.appendChild(script);
}; // DONE

APP.toggleUserMenu = () => {
  if (APP.menuHidden) {
    APP.profileButton.style.animation = 'spin--right 0.3s ease';

    APP.userButtonContainer.childNodes.forEach((element) => {
      if (element.nodeType === 1) {
        element.hidden = false;

        element.style.animation = 'fade-in--right 0.3s ease forwards';
        element.style.animationDelay = `${APP.menuDelay}s`;
        element.style.opacity = '0';

        APP.menuDelay += 0.1;
      }
    });
    APP.menuDelay -= 0.1;

    APP.menuHidden = false;
  } else {
    APP.profileButton.style.animation = 'spin--left 0.3s ease';

    APP.userButtonContainer.childNodes.forEach((element) => {
      if (element.nodeType === 1) {
        element.style.animation = 'fade-out--right 0.3s ease forwards';
        element.style.animationDelay = APP.menuDelay + 's';
        element.style.opacity = '1';

        APP.menuDelay -= 0.1;
      }
    });
    APP.menuDelay += 0.1;

    APP.menuHidden = true;
  }
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

APP.onNavItemClick = (path) => {
  window.history.pushState({}, path, window.location.origin + path);
  APP.togglePage(path);
} // TODO: CHANGE NAME

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

'use strict';

//----------------------------------------------------------------------------------------------------\\

var HOME = {
  userCard: document.querySelector('#user-card'),
  subjectCard: document.querySelector('#subject-card'),
  teachersCard: document.querySelector('#teachers-card'),
  ptmCard: document.querySelector('#ptm-card'),

  teacherButtonTemplate: document.querySelector('.teacher-btn-template'),
};

//----------------------------------------------------------------------------------------------------\\



//----------------------------------------------------------------------------------------------------\\

HOME.updateUI = () => {
  APP.pageTitle.innerHTML = 'Home';

  HOME.userCard.querySelector('.user-card-name').innerHTML = `Welcome ${USER.displayName}`;
  HOME.userCard.querySelector('.user-card-role').innerHTML = `You are signed in as a ${USER.role}.`;
  HOME.userCard.hidden = false;

  switch (USER.role) {
    case 'student':
      HOME.subjectCard.hidden = false;
      HOME.teachersCard.hidden = false;
      HOME.ptmCard.hidden = false;

      HOME.subjectCard.querySelector('.card-content').innerHTML = '';
      USER.subjects.forEach((subject) => {
        var element = document.createElement('p');
        element.appendChild(document.createTextNode(subject));
        HOME.subjectCard.querySelector('.card-content').appendChild(element);
      });

      HOME.teachersCard.querySelector('.card-content').innerHTML = '';
      for (var teacherEmail in USER.teachers) {
        var teacher = USER.teachers[teacherEmail];
        var teacherButton = HOME.teacherButtonTemplate.cloneNode(true);
        teacherButton.className = 'teacher-btn';
        teacherButton.id = teacherEmail.split('@')[0].split('.').join('_');
        teacherButton.querySelector('.teacher-name').innerHTML = teacher.name;
        teacherButton.querySelector('.teacher-subjects').innerHTML = teacher.subjects.join(', ');
        HOME.teachersCard.querySelector('.card-content').appendChild(teacherButton);
      }
      document.querySelectorAll('.teacher-btn').forEach((element) => {
        element.addEventListener('click', () => {
          APP.togglePage(`/${element.id}`);
        });
      });

      HOME.ptmCard.querySelector('.card-content').innerHTML = '<button class="menu-btn" onclick="APP.togglePage(\'/ptmBooking\')">Register Here</button>';
      USER.bookedTimeslots.forEach((bookedTimeslot) => {
        var element = document.createElement('p');
        element.appendChild(document.createTextNode(`${new Date(bookedTimeslot.time.seconds * 1000)}: ${USER.teachers[bookedTimeslot.teacherEmail].name}`));
        HOME.ptmCard.querySelector('.card-content').appendChild(element);
      });
      break;
    case 'teacher':
      HOME.ptmCard.hidden = false;

      HOME.ptmCard.querySelector('.card-content').innerHTML = '';
      USER.timeslots.forEach((timeslot) => {
        var element = document.createElement('p');
        element.appendChild(document.createTextNode(`${new Date(timeslot.data().time.seconds * 1000)}: ${timeslot.data().available}: ${timeslot.data().user}`));
        HOME.ptmCard.querySelector('.card-content').appendChild(element);
      });
      break;
  }
};

//----------------------------------------------------------------------------------------------------\\

HOME.updateUI();

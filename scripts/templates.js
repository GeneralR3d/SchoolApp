var homePage =
  `
    <div class="card" id="user-card">
      <p class="user-card-name"></p>
      <p class="user-card-role"></p>
      <button class="online" id="refresh-btn" hidden>Refresh Role</button>
    </div>
    <div class="card" id="subject-card" hidden>
      <p class="card-header">Subjects</p>
      <div class="card-content">
        <div class="card-loader">
          <div></div>
        </div>
      </div>
      <p class="card-footer"></p>
    </div>
    <div class="card" id="teacher-card" hidden>
      <p class="card-header">Teachers</p>
      <div class="card-content">
        <div class="card-loader">
          <div></div>
        </div>
      </div>
      <p class="card-footer">Click on any of the teachers to see their details</p>
    </div>
    <button onclick="APP.onNavItemClick('/admin')">ADMIN</button>
    <div id="page-bottom"></div>
  `;

var adminPage =
  `
    <div class="card" id="admin-card">
      <p class="card-header">Admin</p>
      <div class="card-content">
        <div id="admin-data-upload">
          <form>
            <label for="student-data-input">Student Data:</label>
            <input class="online" id="student-data-input" type="file" accept=".csv">
            <br><br>
            <label for="teacher-data-input">Teacher Data:</label>
            <input class="online" id="teacher-data-input" type="file" accept=".csv">
          </form>
          <button class="online" id="user-data-upload-btn">Upload Data</button>
        </div>
        <div id="admin-add-admin">
          <form>
            <label for="add-admin-select">Select user to add as admin:</label><br>
            <select id="add-admin-select">
              <option value=""></option>
            </select>
          </form>
          <button class="online" id="add-admin-btn">Add Admin</button>
        </div>
        <div id="admin-delete-admin">
          <form>
            <label for="delete-admin-select">Select user to delete from admin:</label><br>
            <select id="delete-admin-select">
              <option value=""></option>
            </select>
          </form>
          <button class="online" id="delete-admin-btn">Delete Admin</button>
        </div>
      </div>
      <p class="card-footer">Hi there admin</p>
    </div>
    <div id="page-bottom"></div>
  `;

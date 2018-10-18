const APIROOT = 'https://fortnite-public-api.theapinetwork.com/prod09/';
const CONTAINER = document.querySelector('#main-container');
const TODAY = new Date();
const TODAYSTR = TODAY.getMonth()+1 + '/' + TODAY.getDate() + '/' + TODAY.getFullYear();

function getStoreUpcoming() {
  fetch(APIROOT + '/upcoming/get', {
      headers: {
        'Authorization':FORTNITE_APIKEY
      }
  }).then((response) => {
    if (response.status !== 200) {
      console.log('Status Code: ' + response.status);
      return;
    }
    CONTAINER.innerHTML = '<h3>Upcoming Items on ' + TODAYSTR + '</h3>';
    response.json().then((data) => {
      displayStoreData(data);
    });
  }).catch((error) => {
    console.log(error);
  });
}

function getStore() {
  fetch(APIROOT + '/store/get', {
    headers: {
      'Authorization':FORTNITE_APIKEY
    }
  }).then((response) => {
    if (response.status !== 200) {
      console.log('Status Code: ' + response.status);
      return;
    }
    
    CONTAINER.innerHTML = '<h3>Store Items for ' + TODAYSTR + '</h3>';
    response.json().then((data) => {
        displayStoreData(data);
    });
  }).catch((error) => {
    console.log(error);
  });
}

function getUser(username, platform) {
  fetch(APIROOT + '/users/id?username=' + username, {
    headers: {
      'Authorization':FORTNITE_APIKEY
    }
  }).then((response) => {
    if (response.status !== 200) {
      console.log('Status Code: ' + response.status);
      return;
    }
    response.json().then((data) => {
      if (data.uid && data.platforms.includes(platform)) {
        localStorage.setItem('userid', data.uid);
        localStorage.setItem('username', username);
        localStorage.setItem('platform', platform);
        getUserStats(data.uid, platform);
      } else if (data.uid) {
        console.log('the user was found but not for the specified platform');
      } else {
        console.log('the user was not found');
      }
    });
  }).catch((error) => {
    console.log(error);
  });
}

function getUserStats(userid, platform) {
  const requestUrl = APIROOT + '/users/public/br_stats?user_id=' + userid + '&platform=' + platform;
  CONTAINER.innerHTML = '<p>Loading...</p>';
  fetch(requestUrl, {
    headers: {
      'Authorization':FORTNITE_APIKEY
    }
  }).then((response) => {
    if (response.status !== 200) {
      console.log('Status Code: ' + response.status);
      return;
    }
    response.json().then((data) => {
      localStorage.setItem('userdata', JSON.stringify(data));
      localStorage.setItem('userdata-lastupdated', TODAY.toDateString());
      CONTAINER.innerHTML = '';
      displayUserData(data);
    });
  }).catch((error) => {
    console.log(error);
  });
}

function displayMyStats() {
  
  if (localStorage.getItem('userdata')) {
    const lastUpdated = new Date(localStorage.getItem('userdata-lastupdated'));
    const dayDiff = Math.floor((Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) - Date.UTC(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate()) ) /(1000 * 60 * 60 * 24));

    CONTAINER.innerHTML = '';
    displayUserData(JSON.parse(localStorage.getItem('userdata')));

    if ((dayDiff >= 1) && (navigator.onLine)) {
      getUserStats(
        localStorage.getItem('userid'),
        localStorage.getItem('platform')
      );
    }
  }
  else if (localStorage.getItem('userid') && localStorage.getItem('platform')) {
    getUserStats(
      localStorage.getItem('userid'),
      localStorage.getItem('platform')
    );
  } else if (
    localStorage.getItem('username') &&
    localStorage.getItem('platform')
  ) {
    getUser(
      localStorage.getItem('username'),
      localStorage.getItem('platform')
    );
  } else {
    CONTAINER.innerHTML = '';
    displayForm();
  }
}

function displayForm() {
  CONTAINER.innerHTML = `
    <form>
    <div class="form-group">
      <label for="username">Username:</label>
      <input type="text" name="username" id="usernameInput" class="form-control"><br>
    </div>
    <div class="form-group">
      <label for="username">Platform:</label>
      <select name="platform" id="platformSelect" class="form-control">
        <option value="ps4">Playstation</option>
        <option value="xbox">XBox</option>
        <option value="nintendo">Switch</option>
        <option value="pc">PC</option>
      </select>
    </div>
    <button id="submitForm" class="btn btn-primary mb-2">Submit</button>
    </form>
  `;
  document.querySelector('#submitForm').addEventListener('click', handleFormSubmit);
}

function displayUserData(data) {
  const lastUpdated = new Date(localStorage.getItem('userdata-lastupdated'));
  const lastUpdatedStr = lastUpdated.getMonth()+1 + '/' + lastUpdated.getDate() + '/' + lastUpdated.getFullYear();

  CONTAINER.innerHTML += `
    <div class="col">
      <h2>${data.username}/${data.platform}</h2>
      <h4>Totals (all time) as of ${lastUpdatedStr}</h4>
      <ul>
        <li>Matches Played: ${data.totals.matchesplayed}</li>
        <li>Kills: ${data.totals.kills}</li>
        <li>Wins: ${data.totals.wins}
          <ul>
            <li>Solo: ${data.stats.placetop1_solo}</li>
            <li>Duo: ${data.stats.placetop1_duo}</li>
            <li>Squad: ${data.stats.placetop1_squad}</li>
          </ul>
        </li>
        <li>Win Rate: ${data.totals.winrate}</li>
        <li>K/D: ${data.totals.kd}</li>
      </ul>
      <a href="#" onclick="clearStats()">clear</a>
    </div>
    `;
}

function clearStats() {
  localStorage.clear();
  displayForm();
}

function displayStoreData(data) {
  data.items.forEach(item => {
    CONTAINER.innerHTML += `
      <div style="width:33%;float:left;">
        <img src="${item.item.images.background}" height="200">
        <h3>${item.name}</h3>
        <p><img src="${data.vbucks}" width="20"> ${
          item.cost
        }</p>
      </div>`;
  });
}

function handleFormSubmit() {
  const username = document.querySelector('#usernameInput').value;
  const platform = document.querySelector('#platformSelect');
  if (username) {
    getUser(username, platform[platform.selectedIndex].value);
  }
}

function handleStatsClick() {
  document.querySelector('#statsNav').classList.add('active');
  document.querySelector('#storeNav').classList.remove('active');
  document.querySelector('#upcomingNav').classList.remove('active');

  displayMyStats();
}
function handleStoreClick() {
  document.querySelector('#statsNav').classList.remove('active');
  document.querySelector('#storeNav').classList.add('active');
  document.querySelector('#upcomingNav').classList.remove('active');

  getStore();
}
function handleUpcomingClick() {
  document.querySelector('#statsNav').classList.remove('active');
  document.querySelector('#storeNav').classList.remove('active');
  document.querySelector('#upcomingNav').classList.add('active');

  getStoreUpcoming();
}

document.querySelector('#statsNav').addEventListener('click', handleStatsClick);
document.querySelector('#storeNav').addEventListener('click', handleStoreClick);
document.querySelector('#upcomingNav').addEventListener('click', handleUpcomingClick);
displayMyStats();
const APIROOT = 'https://fortnite-public-api.theapinetwork.com/prod09/';
const CONTAINER = document.querySelector('#main-container');
const TODAY = new Date();
const TODAYSTR = TODAY.getMonth()+1 + '/' + TODAY.getDate() + '/' + TODAY.getFullYear();

function getStoreUpcoming() {
  const dataStore = Kinvey.DataStore.collection('fortniteStore', Kinvey.DataStoreType.Sync);
  const query = new Kinvey.Query();
  query.equalTo('type','upcoming');
  const stream = dataStore.find(query);
  stream.subscribe(
    (items) => {
      if (items.length === 0) {
        loadUpcomingStoreData();
      }
      else {
        let lastUpdated = new Date(items[0].requestDate);
        let dayDiff = Math.floor((Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) - Date.UTC(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate()) ) /(1000 * 60 * 60 * 24));

        // if the data is a day or more old, and we are connected
        if ((dayDiff >= 1) && (navigator.onLine))  {
          loadUpcomingStoreData();
        }
        else {
          CONTAINER.innerHTML = '<h3>Upcoming Items on ' + TODAYSTR + '</h3>';
          displayStoreData(items);
        }
      }
    },
    (error) => {
      console.log(error);
    }
  );
}

function loadUpcomingStoreData() {
  const dataStore = Kinvey.DataStore.collection('fortniteStore', Kinvey.DataStoreType.Sync);
  const query = new Kinvey.Query();
  query.equalTo('type','upcoming');

  fetch(APIROOT + '/upcoming/get', {
    headers: {
      'Authorization':FORTNITE_APIKEY
    }
  }).then((response) => {
    if (response.status !== 200) {
      console.log('Status Code: ' + response.status);
      return;
    }
    response.json().then((data) => {
      // delete the old items of this type in the database
      dataStore.remove(query).then(()=>{
        // store the new items in the database
        let ds = TODAY.toDateString();
        data.items.forEach(item => {
          item.requestDate = ds;
          item.type = 'upcoming'
          dataStore.save(item).then(function onSuccess(entity) {
            console.log('saved');
          }).catch(function onError(error) {
            console.log(error);
          });
        });
      });

      dataStore.push().then(() => {
        console.log('synced');
      });

      CONTAINER.innerHTML = '<h3>Upcoming Items on ' + TODAYSTR + '</h3>';
      displayStoreData(data.items);
    });
  }).catch((error) => {
    console.log(error);
  });
}

function getStore() {
  const dataStore = Kinvey.DataStore.collection('fortniteStore', Kinvey.DataStoreType.Sync);
  const query = new Kinvey.Query();
  query.equalTo('type','daily');
  const stream = dataStore.find(query);
  stream.subscribe(
    (items) => {
      if (items.length === 0) {
        loadStoreData();
      }
      else {
        let lastUpdated = new Date(items[0].requestDate);
        let dayDiff = Math.floor((Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) - Date.UTC(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate()) ) /(1000 * 60 * 60 * 24));

        // if the data is a day or more old, and we are connected
        if ((dayDiff >= 1) && (navigator.onLine))  {
          loadStoreData();
        }
        else {
          CONTAINER.innerHTML = '<h3>Store Items for ' + TODAYSTR + '</h3>';
          displayStoreData(items);
        }
      }
    },
    (error) => {
      console.log(error);
    }
  );
}

function loadStoreData() {
  const dataStore = Kinvey.DataStore.collection('fortniteStore', Kinvey.DataStoreType.Sync);
  const query = new Kinvey.Query();
  query.equalTo('type','daily');

  fetch(APIROOT + '/store/get', {
    headers: {
      'Authorization':FORTNITE_APIKEY
    }
  }).then((response) => {
    if (response.status !== 200) {
      console.log('Status Code: ' + response.status);
      return;
    }
    response.json().then((data) => {
      // delete the old items of this type in the database
      dataStore.remove(query).then(()=>{
        // store the new items in the database
        let ds = TODAY.toDateString();
        data.items.forEach(item => {
          item.requestDate = ds;
          item.type = 'daily'
          dataStore.save(item).then(function onSuccess(entity) {
            console.log('saved');
          }).catch(function onError(error) {
            console.log(error);
          });
        });
      });
      dataStore.push().then(() => {
        console.log('synced');
      });

      CONTAINER.innerHTML = '<h3>Store Items for ' + TODAYSTR + '</h3>';
      displayStoreData(data.items);
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
  data.forEach(item => {
    CONTAINER.innerHTML += `
      <div style="width:33%;float:left;">
        <img src="${item.item.images.background}" height="200">
        <h3>${item.name}</h3>
        <p><img src="/fortnite-vbucks-icon.png" width="20"> ${
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

// Kinvey
const client = Kinvey.init({
  appKey: 'kid_ByG-RzNqX',
  appSecret: 'e80255b058ef48e98141431684cc491b'
});
// just use an anonymous user for the purposes of this demo
const activeUser = Kinvey.User.getActiveUser(client);
if (!activeUser) {
  Kinvey.User.signup()
    .catch((error) => {
      console.log(error);
    });
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
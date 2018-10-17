const APIROOT = 'https://fortnite-public-api.theapinetwork.com/prod09/';
const CONTAINER = document.getElementById('main-container');
const TODAY = new Date();
const TODAYSTR = TODAY.getMonth()+1 + '/' + TODAY.getDate() + '/' + TODAY.getFullYear();

function getStoreUpcoming() {
  db.find({selector: {type: 'upcoming'}}).then((result)=>{
    // if it was not yet populated, load the data
    if (result.docs.length === 0) {
      loadUpcomingStoreData();
    }
    else {
      let lastUpdated = new Date(result.docs[0].requestDate);
      let dayDiff = Math.floor((Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) - Date.UTC(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate()) ) /(1000 * 60 * 60 * 24));

      // if the data is a day or more old, and we are connected
      if ((dayDiff >= 1) && (navigator.onLine))  {
        loadUpcomingStoreData();
      }
      else {
        CONTAINER.innerHTML = '<h3>Upcoming Items on ' + TODAYSTR + '</h3>';
        displayStoreData(result.docs);
      }
    }
  });
}

function loadUpcomingStoreData() {
  const request = new XMLHttpRequest();
  request.open('GET', APIROOT + '/upcoming/get', true);
  request.setRequestHeader('Authorization', FORTNITE_APIKEY);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);

      // delete the old items of this type in the database
      db.find({selector: {type: 'upcoming'}}).then((result)=>{
        result.docs.forEach(item => {
          db.remove(item);
        })
      });
      // store the new items in the database
      let ds = TODAY.toDateString();
      data.items.forEach(item => {
        item.requestDate = ds;
        item.type = 'upcoming'
      });
      db.bulkDocs(data.items).then((result)=>{
        console.log(result);
      }).catch((err)=>{
        console.log(err);
      });

      CONTAINER.innerHTML = '<h3>Upcoming Items on ' + TODAYSTR + '</h3>';
      displayStoreData(data.items);
    } else {
      console.log(request.statusText);
    }
  };

  request.onerror = function() {
    console.log('something went wrong');
  };

  request.send();
}

function getStore() {
  db.find({selector: {type: 'daily'}}).then((result)=>{
    // if it was not yet populated, load the data
    if (result.docs.length === 0) {
      loadStoreData();
    }
    else {
      let lastUpdated = new Date(result.docs[0].requestDate);
      let dayDiff = Math.floor((Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) - Date.UTC(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate()) ) /(1000 * 60 * 60 * 24));
      // if the data is a day or more old, and we are connected
      if ((dayDiff >= 1) && (navigator.onLine))  {
        loadStoreData();
      }
      else {
        CONTAINER.innerHTML = '<h3>Store Items for ' + TODAYSTR + '</h3>';
        displayStoreData(result.docs);
      }
    }
  });
}

function loadStoreData() {
  const request = new XMLHttpRequest();

  request.open('GET', APIROOT + '/store/get', true);
  request.setRequestHeader('Authorization', FORTNITE_APIKEY);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);

      // delete the old items of this type in the database
      db.find({selector: {type: 'daily'}}).then((result)=>{
        result.docs.forEach(item => {
          db.remove(item);
        })
      });
      // store the new items in the database
      let ds = TODAY.toDateString();
      data.items.forEach(item => {
        item.requestDate = ds;
        item.type = 'daily'
      });
      db.bulkDocs(data.items).then((result)=>{
        console.log(result);
      }).catch((err)=>{
        console.log(err);
      });
      CONTAINER.innerHTML = '<h3>Store Items for ' + TODAYSTR + '</h3>';
      displayStoreData(data.items);
    } else {
      console.log(request.statusText);
    }
  };

  request.onerror = function() {
    console.log('something went wrong');
  };

  request.send();
}

function getUser(username, platform) {
  const request = new XMLHttpRequest();
  request.open('GET', APIROOT + '/users/id?username=' + username, true);
  request.setRequestHeader('Authorization', FORTNITE_APIKEY);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
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
    } else {
      console.log(request.statusText);
    }
  };

  request.onerror = function() {
    console.log('something went wrong');
  };

  request.send();
}

function getUserStats(userid, platform) {
  const request = new XMLHttpRequest();
  CONTAINER.innerHTML = '<p>Loading...</p>';
  request.open(
    'GET',
    APIROOT + '/users/public/br_stats?user_id=' + userid + '&platform=' + platform,
    true
  );
  request.setRequestHeader('Authorization', FORTNITE_APIKEY);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      localStorage.setItem('userdata', request.responseText);
      localStorage.setItem('userdata-lastupdated', TODAY.toDateString())
      CONTAINER.innerHTML = '';
      displayUserData(data);
    } else {
      console.log(request.statusText);
    }
  };

  request.onerror = function() {
    console.log('something went wrong');
  };

  request.send();
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
  document
    .getElementById('submitForm')
    .addEventListener('click', handleFormSubmit);
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
  const username = document.getElementById('usernameInput').value;
  const platform = document.getElementById('platformSelect');
  if (username) {
    getUser(username, platform[platform.selectedIndex].value);
  }
}

// PouchDb
const db = new PouchDB('FNdbPouch');
db.createIndex({
  index: {
    fields: ['type']
  }
});

function handleStatsClick() {
  document.getElementById('statsNav').classList.add('active');
  document.getElementById('storeNav').classList.remove('active');
  document.getElementById('upcomingNav').classList.remove('active');

  displayMyStats();
}
function handleStoreClick() {
  document.getElementById('statsNav').classList.remove('active');
  document.getElementById('storeNav').classList.add('active');
  document.getElementById('upcomingNav').classList.remove('active');

  getStore();
}
function handleUpcomingClick() {
  document.getElementById('statsNav').classList.remove('active');
  document.getElementById('storeNav').classList.remove('active');
  document.getElementById('upcomingNav').classList.add('active');

  getStoreUpcoming();
}

document.getElementById('statsNav').addEventListener('click', handleStatsClick);
document.getElementById('storeNav').addEventListener('click', handleStoreClick);
document.getElementById('upcomingNav').addEventListener('click', handleUpcomingClick);
displayMyStats();
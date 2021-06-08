// const utils = require('./utils');
var bg = chrome.extension.getBackgroundPage();

/**
 * Créer un element Country
 * @param {String} name
 * @returns
 */
const newCountry = (name) => {
   let elemCountry = document.createElement('div');
   elemCountry.classList.add('country');
   elemCountry.textContent = name;
   return elemCountry;
};

/**
 * Créer un element Server
 * @param {Integer} serverId Id du server pour l'attribut data-id
 * @param {String} serverName Nom du serveur qui est affiché dans le popup
 * @param {Boolean} selected 
 * @returns
 */
const newServer = (serverId, serverName, selected = false) => {
   let elemServer = document.createElement('div');
   elemServer.classList.add('server');
   if (selected) elemServer.classList.add('server--selected');
   elemServer.setAttribute('data-id', serverId);
   elemServer.textContent = '- ' + serverName;
   return elemServer;
};

document.addEventListener('DOMContentLoaded', function () {
   document.body.onclick = function (e) {
      e = e.target;
      if (e.className && e.className.indexOf('server') != -1) {
         let id = e.getAttribute('data-id');
         bg.changeServer(id);

         document.getElementsByClassName('server--selected')[0].classList.remove('server--selected');
         e.classList.add('server--selected');
      }
   };

   let divContent = document.getElementById('content');
   for (let [key, servers] of Object.entries(bg.per_country)) {
      for (let i = 0; i < servers.length; i++) {
         if (i == 0) {
            let elemCountry = newCountry(bg.countries[key.replace(/^([a-zA-Z]+).*$/, '$1')]);
            divContent.insertAdjacentElement('beforeend', elemCountry);
         }
         let elemServer = newServer(servers[i], bg.replacements[servers[i]][1], bg.using == servers[i]);
         divContent.insertAdjacentElement('beforeend', elemServer);
      }
   }
});

// Addresses from earlier versions of the site open the matching dashboard screen.
(function () {
  var k = location.pathname.replace(/\.html$/, '').replace(/\/$/, '').slice(1).toLowerCase();
  var to = {
    about: 'about', work: 'projects', projects: 'projects', stats: 'stats', finder: 'projects', settings: 'settings',
    achievements: 'achievements', games: 'hobbies', hobbies: 'hobbies', movies: 'hobbies', films: 'favs', social: 'social',
    contact: 'compose', message: 'compose', education: 'education', valorant: 'valorant',
  }[k];
  var home = ['guestbook', 'draw', 'terminal', 'arcade', 'play', 'type', 'wyr', 'review', 'index', 'doom', 'home'].indexOf(k) >= 0;
  if (to || home) location.replace(to ? '/#' + to : '/');
})();
// Enter or Space goes home, like A on the pad.
addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') location.href = '/'; });

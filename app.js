import './core/LoremIpsum.js';
import './core/theme.js';
import './ui/loadingScreen.js';
import './ui/router.js';
import './ui/home.js';
import './ui/about.js';

$(() => {

  $loadingScreen.open('under construction');

  $theme.setTheme('flatly');
  //$router.go('/');

  setTimeout(() => {
    $theme.setTheme('darkly');
  }, 350);

  $loadingScreen.close(2500);

  $router.update();

});

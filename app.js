import './core/theme.js';
import './ui/loadingScreen.js';

$(()=>{

  $loadingScreen.open('under construction');
  
  $theme.setTheme('flatly');
  
  //$loadingScreen.close(2500);
  
});

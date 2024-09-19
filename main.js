import { OffCanvas } from './src/offCanvas'

// Demo of OffCanvas component
document.getElementById('openOffCanvas').addEventListener('click', () => {
    const offCanvasMenu = new OffCanvas(document.body, {
      title: 'Responsive Menu',
      content: `
        <ul class="list-group">
          <li class="list-group-item"><a href="#">Home</a></li>
          <li class="list-group-item"><a href="#">About</a></li>
          <li class="list-group-item"><a href="#">Services</a></li>
          <li class="list-group-item"><a href="#">Contact</a></li>
        </ul>
      `,
      position: 'start',
    });
    offCanvasMenu.render();
  });
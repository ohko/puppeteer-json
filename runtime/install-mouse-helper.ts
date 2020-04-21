// This injects a box into the page that moves with the mouse;
// Useful for debugging
async function installMouseHelper(page) {
  await page.evaluateOnNewDocument(() => {
    // Install mouse helper only for top-level frame.
    if (window !== window.parent) return;

    window.addEventListener('DOMContentLoaded', () => {
      const tag = "tag" + (new Date()).getTime()
      const zIndex = Math.round(Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000)
      const box = document.createElement(tag);
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        ${tag} {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: ${zIndex};
          left: 0;
          width: 20px;
          height: 20px;
          background: rgba(0,0,0,.4);
          border: 1px solid white;
          border-radius: 10px;
          margin: -10px 0 0 -10px;
          padding: 0;
          transition: background .2s, border-radius .2s, border-color .2s;
        }
        ${tag}.button-1 {transition: none;background: rgba(0,0,0,0.9);}
        ${tag}.button-2 {transition: none;border-color: rgba(0,0,255,0.9);}
        ${tag}.button-3 {transition: none;border-radius: 4px;}
        ${tag}.button-4 {transition: none;border-color: rgba(255,0,0,0.9);}
        ${tag}.button-5 {transition: none;border-color: rgba(0,255,0,0.9);}
      `;
      document.head.appendChild(styleElement);
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => {
        box.style.left = event.pageX + 'px';
        box.style.top = event.pageY + 'px';
        updateButtons(event.buttons);
      }, true);
      document.addEventListener('mousedown', event => {
        updateButtons(event.buttons);
        box.classList.add('button-' + event.which);
      }, true);
      document.addEventListener('mouseup', event => {
        updateButtons(event.buttons);
        box.classList.remove('button-' + event.which);
      }, true);
      function updateButtons(buttons: number) {
        for (let i = 0; i < 5; i++)
          box.classList.toggle("button-" + i, (buttons & (1 << i)) != 0);
      }
    }, false);
  });
};

export default installMouseHelper;
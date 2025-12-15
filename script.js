// Autoplay the video that's mostly in view and pause others
const reels = Array.from(document.querySelectorAll('.reel'));
const videos = Array.from(document.querySelectorAll('.reel-video'));

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const vid = entry.target.querySelector('video');
    if(!vid) return;
    if(entry.intersectionRatio > 0.6){
      vid.play().catch(()=>{});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  });
},{threshold:[0.0,0.25,0.5,0.75,1]});

reels.forEach(r=>observer.observe(r));

// Keyboard navigation and simple wheel-to-snap
function goTo(index){
  const target = reels[index];
  if(!target) return;
  target.scrollIntoView({behavior:'smooth'});
}

let current = 0;
function updateCurrent(){
  reels.forEach((r,i)=>{
    const rect = r.getBoundingClientRect();
    if(rect.top >= -50 && rect.top <= 50){ current = i; }
  })
}

window.addEventListener('scroll',()=>{
  updateCurrent();
});

window.addEventListener('keydown',(e)=>{
  if(e.key === 'ArrowDown' || e.key === 'PageDown'){
    e.preventDefault();
    goTo(Math.min(reels.length-1,current+1));
  } else if(e.key === 'ArrowUp' || e.key === 'PageUp'){
    e.preventDefault();
    goTo(Math.max(0,current-1));
  }
});

// Optional: click to toggle mute/play
videos.forEach(v=>{
  v.addEventListener('click',()=>{
    if(v.paused) v.play(); else v.pause();
  });
});

// scripts.js — simple in-browser product image editor (saves to localStorage)
(function(){
  const STORAGE_PREFIX = 'bakery-img-';

  function setImageFromDataUrl(imgEl, dataUrl){
    if(!imgEl) return;
    imgEl.src = dataUrl;
  }

  function loadSavedImages(){
    document.querySelectorAll('.product-item[data-product]').forEach(li => {
      const id = li.dataset.product;
      const key = STORAGE_PREFIX + id;
      const saved = localStorage.getItem(key);
      const img = li.querySelector('img');
      if(saved && img){
        setImageFromDataUrl(img, saved);
      }
    });
  }

  function onChangeFile(input, imgEl, id){
    const file = input.files && input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      const dataUrl = e.target.result;
      setImageFromDataUrl(imgEl, dataUrl);
      try{
        localStorage.setItem(STORAGE_PREFIX + id, dataUrl);
      }catch(e){
        console.warn('Could not save image to localStorage', e);
        alert('Unable to save image in this browser (storage full or blocked).');
      }
    };
    reader.readAsDataURL(file);
  }

  function resetToDefault(imgEl, id){
    const def = imgEl.getAttribute('data-default-src');
    if(def){
      imgEl.src = def;
      localStorage.removeItem(STORAGE_PREFIX + id);
    }
  }

  function setupControls(){
    document.querySelectorAll('.product-item[data-product]').forEach(li => {
      const id = li.dataset.product;
      const input = li.querySelector('.img-uploader');
      const changeBtn = li.querySelector('.change-btn');
      const resetBtn = li.querySelector('.reset-btn');
      const img = li.querySelector('img');
      if(changeBtn && input){
        changeBtn.addEventListener('click', ()=> input.click());
        input.addEventListener('change', ()=> onChangeFile(input, img, id));
      }
      if(resetBtn){
        resetBtn.addEventListener('click', ()=> resetToDefault(img, id));
      }
    });

    const toggle = document.getElementById('toggle-edit-images');
    if(toggle){
      toggle.addEventListener('click', ()=>{
        document.body.classList.toggle('edit-mode');
        const on = document.body.classList.contains('edit-mode');
        toggle.textContent = on? 'Exit edit' : 'Edit images';
      });
    }
  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    loadSavedImages();
    setupControls();
  });
})();

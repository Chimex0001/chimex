/* image-gallery.js
   Simple client-side gallery per product. Stores arrays of data-URLs in localStorage.
   Key format: foodexport-gallery-<product-id>
*/
(function(){
  const KEY_PREFIX = 'foodexport-gallery-';

  function readStorage(id){
    try{
      const raw = localStorage.getItem(KEY_PREFIX + id);
      return raw? JSON.parse(raw) : null;
    }catch(e){return null}
  }
  function writeStorage(id, arr){
    try{ localStorage.setItem(KEY_PREFIX + id, JSON.stringify(arr)); }catch(e){console.warn('Storage failed', e)}
  }

  function renderThumbs(li, images){
    const thumbs = li.querySelector('.thumbs');
    const main = li.querySelector('.gallery-main');
    thumbs.innerHTML = '';
    if(!images || images.length===0) return;
    
    // Use DocumentFragment for batch DOM insertion
    const fragment = document.createDocumentFragment();
    images.forEach((src, i)=>{
      const t = document.createElement('img');
      t.src = src; t.dataset.index = i;
      t.alt = '';
      t.addEventListener('click', ()=> main.src = src);
      fragment.appendChild(t);
    });
    thumbs.appendChild(fragment);
  }

  function loadAll(){
    // Cache DOM query
    const items = document.querySelectorAll('.product-item[data-product]');
    items.forEach(li=>{
      const id = li.dataset.product;
      const stored = readStorage(id);
      const main = li.querySelector('.gallery-main');
      if(stored && stored.length){
        // use first as main and render thumbs
        main.src = stored[0];
        renderThumbs(li, stored);
      } else {
        // no stored: leave default main image and no thumbs
      }
    });
  }

  function handleFiles(files, li, id){
    if(!files || files.length===0) return;
    const arr = [];
    let loaded = 0;
    const totalFiles = files.length;
    
    // Pre-read existing data to avoid reading it multiple times
    const existing = readStorage(id) || [];
    const mainImg = li.querySelector('.gallery-main');
    
    // Use Array.from for better performance with FileList
    Array.from(files).forEach(f => {
      if(!f.type.startsWith('image/')){ 
        loaded++; 
        if(loaded === totalFiles) finishLoading();
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e){
        arr.push(e.target.result);
        loaded++;
        if(loaded === totalFiles){
          finishLoading();
        }
      };
      reader.readAsDataURL(f);
    });
    
    function finishLoading(){
      const combined = existing.concat(arr);
      writeStorage(id, combined);
      renderThumbs(li, combined);
      mainImg.src = combined[0] || mainImg.src;
    }
  }

  function setup(){
    // Cache DOM query
    const items = document.querySelectorAll('.product-item[data-product]');
    items.forEach(li=>{
      const id = li.dataset.product;
      const input = li.querySelector('.gallery-input');
      const clearBtn = li.querySelector('.clear-gallery');
      const mainImg = li.querySelector('.gallery-main');
      const thumbsEl = li.querySelector('.thumbs');
      
      if(input){
        input.addEventListener('change', (e)=>{
          handleFiles(e.target.files, li, id);
          // reset input so same file can be reselected later
          e.target.value = '';
        });
      }
      if(clearBtn){
        clearBtn.addEventListener('click', ()=>{
          localStorage.removeItem(KEY_PREFIX + id);
          // reset to original default image (from initial HTML)
          const defaultSrc = mainImg.getAttribute('src');
          mainImg.src = defaultSrc;
          thumbsEl.innerHTML = '';
        });
      }
    });

    loadAll();
  }

  document.addEventListener('DOMContentLoaded', setup);
})();

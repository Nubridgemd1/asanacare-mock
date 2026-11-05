/* Asana Care & Mental Wellness — shared-content sync (Supabase)
   Makes admin edits permanent and visible on every device WHEN configured.
   Leave SB_URL / SB_KEY blank to run in local/demo mode (this browser only),
   which keeps the site showing the built-in Asana defaults. To go live and
   shared, create a free Supabase project, add a `site_content` table + a
   `site-photos` storage bucket, then paste the Project URL + publishable
   (anon) key below. The publishable key is safe for the browser; writes are
   governed by Row Level Security policies on the Supabase side. */
(function(){
  var SB_URL = '';   /* e.g. https://xxxx.supabase.co  (blank = local/demo) */
  var SB_KEY = '';   /* publishable / anon key */
  var LIVE = !!(SB_URL && SB_KEY);
  var T = SB_URL + '/rest/v1/site_content';
  var H = { apikey: SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };

  function get(key){
    if(!LIVE) return Promise.resolve(null);
    return fetch(T + '?key=eq.' + encodeURIComponent(key) + '&select=value', { headers: H })
      .then(function(r){ return r.ok ? r.json() : []; })
      .then(function(a){ return (a && a[0]) ? a[0].value : null; })
      .catch(function(){ return null; });
  }
  function set(key, value){
    if(!LIVE) return Promise.resolve(false);
    return fetch(T + '?on_conflict=key', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal' }, H),
      body: JSON.stringify({ key: key, value: value, updated_at: new Date().toISOString() })
    }).then(function(r){ return r.ok; }).catch(function(){ return false; });
  }

  /* Update any contact elements present on a page from a config object. */
  function applyContactIds(c){
    if(!c) return;
    var fe = document.getElementById('footEmail');
    if(fe && c.email){ fe.textContent = '✉ ' + c.email; fe.setAttribute('href','mailto:' + c.email); }
    var fp = document.getElementById('footPhone');
    if(fp && c.phone){ fp.textContent = '📞 ' + c.phone; fp.setAttribute('href','tel:' + c.phone.replace(/[^0-9+]/g,'')); }
    var cb = document.getElementById('callBtn');
    if(cb && c.phone){ cb.textContent = 'Call ' + c.phone; if(cb.getAttribute('href') && cb.getAttribute('href').indexOf('tel:')===0) cb.setAttribute('href','tel:' + c.phone.replace(/[^0-9+]/g,'')); }
  }

  var BUCKET = 'site-photos';
  /* Upload an image File to Supabase Storage; resolves to its public URL (or null). */
  function uploadPhoto(path, file){
    if(!LIVE) return Promise.resolve(null);
    return fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: Object.assign({ 'x-upsert': 'true',
        'Content-Type': (file && file.type) || 'application/octet-stream',
        'Cache-Control': '3600' }, H),
      body: file
    }).then(function(r){
      return r.ok ? (SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + path) : null;
    }).catch(function(){ return null; });
  }

  window.OasisSync = {
    url: SB_URL, live: LIVE,
    get: get, set: set,
    getConfig: function(){ return get('config'); },
    setConfig: function(v){ return set('config', v); },
    getImages: function(){ return get('images'); },
    setImages: function(v){ return set('images', v); },
    uploadPhoto: uploadPhoto,
    applyContactIds: applyContactIds
  };
})();

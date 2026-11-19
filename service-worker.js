const V='deficit-v4';
const FILES=['./','index.html','manifest.json','icon.svg','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return;
  e.respondWith((async()=>{
    try{
      const r=await fetch(req);
      if(r.status===200){const c=await caches.open(V);c.put(req,r.clone())}
      return r;
    }catch(err){
      const m=await caches.match(req,{ignoreSearch:true});
      if(m)return m;
      if(req.mode==='navigate'){const i=await caches.match('index.html');if(i)return i}
      return Response.error();
    }
  })());
});

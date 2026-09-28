// Connects MsgGen to your Messenger server. Sends work offline: they queue on the device and flush when back online.
(function(){
  var CFG='msggen_link',BOX='msggen_outbox';
  var $=function(i){return document.getElementById(i)};
  var cfg=function(){try{return JSON.parse(localStorage.getItem(CFG))||{}}catch(e){return{}}};
  var box=function(){try{return JSON.parse(localStorage.getItem(BOX))||[]}catch(e){return[]}};
  var setBox=function(b){try{localStorage.setItem(BOX,JSON.stringify(b))}catch(e){}};
  var toast=function(m){(window.showToast||alert)(m)};
  var busy=false;

  var btn=document.createElement('button');btn.className='btn-primary';btn.id='sendMsgr';btn.style.cssText='margin-top:8px;background:#7c3aed';
  var cog=document.createElement('button');cog.className='btn-secondary';cog.textContent='Messenger settings';
  var panel=document.createElement('div');panel.style.display='none';panel.innerHTML=
    '<label style="margin-top:10px">Messenger server URL (https)</label><input id="mUrl" type="url" placeholder="https://chat.example.com">'+
    '<label>Bot token</label><input id="mTok" type="password" placeholder="from POST /api/bots">'+
    '<button class="btn-primary" id="mSave">Save</button>';
  var anchor=$('copyBtn');anchor.parentNode.insertBefore(btn,anchor);anchor.parentNode.appendChild(cog);anchor.parentNode.appendChild(panel);

  function label(){var n=box().length;btn.textContent='Send to Messenger'+(n?' ('+n+' queued)':'')}
  cog.onclick=function(){var c=cfg();$('mUrl').value=c.url||'';$('mTok').value=c.token||'';panel.style.display=panel.style.display==='none'?'block':'none'};
  panel.querySelector('#mSave').onclick=function(){
    var u=$('mUrl').value.trim().replace(/\/+$/,''),t=$('mTok').value.trim();
    if(u&&!/^https?:\/\//.test(u))return toast('URL must start with https://');
    localStorage.setItem(CFG,JSON.stringify({url:u,token:t}));panel.style.display='none';toast('Saved');flush()};

  async function flush(){
    var c=cfg();if(busy||!c.url||!c.token)return;busy=true;
    try{
      var b=box();
      while(b.length){
        var it=b[0];
        var r=await fetch(c.url+'/hook/'+c.token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:it.text,id:it.id})});
        if(!r.ok){toast(r.status===404?'Messenger: bot token not recognised':'Messenger rejected a message');break}
        b.shift();setBox(b);
      }
    }catch(e){/* offline or server down: keep queue, retry later */}
    busy=false;label();
  }

  btn.onclick=function(){
    var text=$('output').textContent;
    if(!text||text.indexOf('Fill in')===0)return toast('Generate a message first');
    var c=cfg();if(!c.url||!c.token){panel.style.display='block';return toast('Add your Messenger URL and token first')}
    var b=box();b.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:text});setBox(b);label();
    toast(navigator.onLine?'Sending…':'Offline — queued, will send when online');flush();
  };

  window.addEventListener('online',flush);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)flush()});
  setInterval(flush,30000);label();flush();
})();

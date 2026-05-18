(function(){
const script=document.currentScript;
let cfg={};
try{cfg=JSON.parse(script.getAttribute('data-config')||'{}');}catch(e){}
const bizName=cfg.bizName||'Our Business';
const accentColor=cfg.accentColor||'#3b82f6';
const faq=cfg.faq||'We are a local business. Please contact us for more information.';
const tone=cfg.tone||'Friendly, professional and concise.';
const industry=cfg.industry||'General';
const greeting=cfg.greeting||`Hi there! 👋 Welcome to ${bizName}. I can answer questions, share pricing, or help you get in touch. What can I help you with?`;
const quickReplies=cfg.quickReplies||['Hours & location','Pricing info','Book / enquire'];

// ── Proxy URL (Cloudflare Worker — API key stays hidden) ─────────────────────
const PROXY_URL='https://velox-proxy.veloxai-account.workers.dev';

const style=document.createElement('style');
style.textContent=`
#vlx-root *,#vlx-root *::before,#vlx-root *::after{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,'Segoe UI',sans-serif;}
#vlx-fab{position:fixed;bottom:24px;right:24px;z-index:99999;width:56px;height:56px;border-radius:50%;background:${accentColor};border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;transition:transform 0.2s,box-shadow 0.2s;}
#vlx-fab:hover{transform:scale(1.08);box-shadow:0 8px 28px rgba(0,0,0,0.3);}
#vlx-fab svg{width:24px;height:24px;fill:white;transition:opacity 0.2s;}
#vlx-fab .vlx-close{display:none;}
#vlx-fab.open .vlx-chat{display:none;}
#vlx-fab.open .vlx-close{display:block;}
#vlx-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;border:2px solid #fff;}
#vlx-badge.visible{display:flex;}
#vlx-window{position:fixed;bottom:92px;right:24px;z-index:99998;width:360px;max-width:calc(100vw - 32px);background:#ffffff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06);display:flex;flex-direction:column;overflow:hidden;transform:scale(0.92) translateY(16px);opacity:0;pointer-events:none;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.2s;max-height:540px;}
#vlx-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}
#vlx-header{padding:14px 16px;display:flex;align-items:center;gap:10px;background:${accentColor};color:white;flex-shrink:0;}
#vlx-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
#vlx-header-info{flex:1;}
#vlx-biz-name{font-size:14px;font-weight:600;}
#vlx-status{font-size:11px;opacity:0.85;display:flex;align-items:center;gap:5px;}
#vlx-status::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;}
#vlx-close-btn{background:rgba(255,255,255,0.2);border:none;border-radius:8px;cursor:pointer;color:white;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:16px;transition:background 0.2s;}
#vlx-close-btn:hover{background:rgba(255,255,255,0.3);}
#vlx-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:220px;max-height:300px;background:#f8f9fb;}
#vlx-messages::-webkit-scrollbar{width:3px;}
#vlx-messages::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px;}
.vlx-msg{display:flex;gap:8px;max-width:88%;animation:vlxFadeUp 0.22s ease;}
@keyframes vlxFadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.vlx-msg.user{align-self:flex-end;flex-direction:row-reverse;}
.vlx-msg-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;align-self:flex-end;background:${accentColor};}
.vlx-msg.user .vlx-msg-av{background:#e5e7eb;}
.vlx-bubble{padding:9px 13px;border-radius:16px;font-size:13px;line-height:1.55;white-space:pre-wrap;}
.vlx-msg.bot .vlx-bubble{background:#fff;color:#111;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.07);}
.vlx-msg.user .vlx-bubble{background:${accentColor};color:#fff;border-bottom-right-radius:4px;}
.vlx-typing{padding:8px 12px;display:flex;align-items:center;gap:5px;}
.vlx-typing span{width:7px;height:7px;border-radius:50%;background:#bbb;animation:vlxBounce 1.2s infinite;}
.vlx-typing span:nth-child(2){animation-delay:.2s}.vlx-typing span:nth-child(3){animation-delay:.4s}
@keyframes vlxBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
#vlx-quick-replies{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 2px;background:#f8f9fb;flex-shrink:0;}
.vlx-qr{background:#fff;border:1px solid #e5e7eb;border-radius:14px;color:#444;font-size:12px;padding:5px 12px;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
.vlx-qr:hover{border-color:${accentColor};color:${accentColor};}
#vlx-lead-form{padding:12px 14px;background:#fff;border-top:1px solid #f0f0f0;flex-shrink:0;}
.vlx-lf-title{font-size:12px;font-weight:600;color:${accentColor};margin-bottom:8px;}
.vlx-lf-input{width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:8px 11px;font-size:13px;outline:none;transition:border-color 0.2s;margin-bottom:6px;color:#111;}
.vlx-lf-input:focus{border-color:${accentColor};}
.vlx-lf-submit{width:100%;background:${accentColor};border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:600;padding:9px;cursor:pointer;transition:opacity 0.2s;}
.vlx-lf-submit:hover{opacity:0.88;}
#vlx-input-bar{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:8px;align-items:center;background:#fff;flex-shrink:0;}
#vlx-text-input{flex:1;border:1px solid #e5e7eb;border-radius:10px;padding:9px 13px;font-size:13px;outline:none;resize:none;transition:border-color 0.2s;line-height:1.4;max-height:80px;overflow-y:auto;color:#111;}
#vlx-text-input:focus{border-color:${accentColor};}
#vlx-text-input::placeholder{color:#aaa;}
#vlx-send-btn{background:${accentColor};border:none;border-radius:10px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity 0.2s;}
#vlx-send-btn:hover{opacity:0.88;}
#vlx-send-btn:disabled{background:#ccc;cursor:not-allowed;}
#vlx-send-btn svg{width:15px;height:15px;fill:white;}
#vlx-footer{padding:5px 14px 8px;text-align:center;font-size:10px;color:#bbb;background:#fff;}
#vlx-footer a{color:#bbb;text-decoration:none;}
`;
document.head.appendChild(style);

const root=document.createElement('div');
root.id='vlx-root';
root.innerHTML=`
<button id="vlx-fab" aria-label="Open chat">
<svg class="vlx-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
<svg class="vlx-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
<div class="vlx-badge" id="vlx-badge">1</div>
</button>
<div id="vlx-window" role="dialog">
<div id="vlx-header">
<div id="vlx-avatar">🤖</div>
<div id="vlx-header-info">
<div id="vlx-biz-name">${bizName}</div>
<div id="vlx-status">Online · Replies instantly</div>
</div>
<button id="vlx-close-btn">✕</button>
</div>
<div id="vlx-messages"></div>
<div id="vlx-quick-replies"></div>
<div id="vlx-lead-form" style="display:none">
<div class="vlx-lf-title">📋 Leave your details and we'll be in touch</div>
<input class="vlx-lf-input" id="vlx-lf-name" placeholder="Your name"/>
<input class="vlx-lf-input" id="vlx-lf-contact" placeholder="Email or phone"/>
<input class="vlx-lf-input" id="vlx-lf-note" placeholder="Anything specific? (optional)"/>
<button class="vlx-lf-submit" id="vlx-lf-btn">Send enquiry →</button>
</div>
<div id="vlx-input-bar">
<textarea id="vlx-text-input" placeholder="Type a message…" rows="1"></textarea>
<button id="vlx-send-btn"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
</div>
<div id="vlx-footer">Powered by <a href="#" target="_blank">Velox AI</a></div>
</div>`;
document.body.appendChild(root);

let isOpen=false,isBusy=false,history=[];
const fab=root.querySelector('#vlx-fab');
const win=root.querySelector('#vlx-window');
const msgs=root.querySelector('#vlx-messages');
const qrBox=root.querySelector('#vlx-quick-replies');
const leadForm=root.querySelector('#vlx-lead-form');
const textInput=root.querySelector('#vlx-text-input');
const sendBtn=root.querySelector('#vlx-send-btn');
const badge=root.querySelector('#vlx-badge');
const closeBtn=root.querySelector('#vlx-close-btn');

function toggleChat(){
isOpen=!isOpen;
fab.classList.toggle('open',isOpen);
win.classList.toggle('open',isOpen);
badge.classList.remove('visible');
if(isOpen&&history.length===0)initChat();
if(isOpen)setTimeout(()=>textInput.focus(),300);
}
fab.addEventListener('click',toggleChat);
closeBtn.addEventListener('click',toggleChat);
setTimeout(()=>{if(!isOpen)badge.classList.add('visible');},4000);

function initChat(){
msgs.innerHTML='';history=[];
addBot(greeting.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>'));
renderQR();
}

function renderQR(){
qrBox.innerHTML=quickReplies.map(r=>`<button class="vlx-qr">${r}</button>`).join('');
qrBox.querySelectorAll('.vlx-qr').forEach(b=>b.addEventListener('click',()=>send(b.textContent)));
}

function addBot(html){
const d=document.createElement('div');
d.className='vlx-msg bot';
d.innerHTML=`<div class="vlx-msg-av">🤖</div><div class="vlx-bubble">${html}</div>`;
msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}

function addUser(text){
const d=document.createElement('div');
d.className='vlx-msg user';
d.innerHTML=`<div class="vlx-msg-av" style="background:#e5e7eb;color:#555">👤</div><div class="vlx-bubble">${text}</div>`;
msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}

function showTyping(){
const d=document.createElement('div');
d.className='vlx-msg bot';d.id='vlx-typing';
d.innerHTML=`<div class="vlx-msg-av">🤖</div><div class="vlx-bubble"><div class="vlx-typing"><span></span><span></span><span></span></div></div>`;
msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=root.querySelector('#vlx-typing');if(t)t.remove();}

function showLeadForm(){
qrBox.innerHTML='';
leadForm.style.display='block';
root.querySelector('#vlx-input-bar').style.display='none';
}

root.querySelector('#vlx-lf-btn').addEventListener('click',()=>{
const name=root.querySelector('#vlx-lf-name').value.trim();
const contact=root.querySelector('#vlx-lf-contact').value.trim();
const note=root.querySelector('#vlx-lf-note').value.trim();
if(!name||!contact){
root.querySelector('#vlx-lf-name').style.borderColor='#ef4444';
root.querySelector('#vlx-lf-contact').style.borderColor='#ef4444';
return;
}
leadForm.style.display='none';
root.querySelector('#vlx-input-bar').style.display='flex';
addBot(`Thanks <strong>${name}</strong>! ✅ Someone will be in touch soon. Anything else I can help with?`);
history.push({role:'assistant',content:`Lead captured for ${name} (${contact})`});
renderQR();
console.log('[Velox AI] Lead:',{name,contact,note,business:bizName,ts:new Date().toISOString()});
});

async function send(text){
if(isBusy||!text.trim())return;
qrBox.innerHTML='';
addUser(text);
history.push({role:'user',content:text});
isBusy=true;sendBtn.disabled=true;
textInput.value='';autoResize();
showTyping();
const sys=`You are a helpful AI assistant for "${bizName}", a ${industry} business.\nTone: ${tone}\nBusiness info:\n${faq}\nRules:\n- Keep replies SHORT (2-4 sentences).\n- If someone wants to book, enquire or get a quote, output exactly: [COLLECT_LEAD]\n- If you don't know something, say you'll get someone to follow up, then output: [COLLECT_LEAD]\n- Never make up info not provided.\n- Stay in character as a representative of ${bizName}.`;
try{
const res=await fetch(PROXY_URL,{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
model:'claude-sonnet-4-20250514',
max_tokens:1000,
system:sys,
messages:history
})
});
const data=await res.json();
const reply=data.content?.[0]?.text||"Sorry, I couldn't process that right now.";
removeTyping();
if(reply.includes('[COLLECT_LEAD]')){
const clean=reply.replace('[COLLECT_LEAD]','').trim();
if(clean){addBot(clean);history.push({role:'assistant',content:clean});}
showLeadForm();
}else{
addBot(reply.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>'));
history.push({role:'assistant',content:reply});
renderQR();
}
}catch(e){
removeTyping();
addBot("Sorry, something went wrong. Please try again.");
}
isBusy=false;sendBtn.disabled=false;
}

sendBtn.addEventListener('click',()=>send(textInput.value.trim()));
textInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(textInput.value.trim());}});
function autoResize(){textInput.style.height='auto';textInput.style.height=Math.min(textInput.scrollHeight,80)+'px';}
textInput.addEventListener('input',autoResize);
})();

(()=>{
const V=window.BASIC_VOCAB,G=window.BASIC_GRAMMAR,all=[...V,...G],$=s=>document.querySelector(s);
const key='teacher-mikesl-year5-basics-v1',read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
let saved=read(),support=false,slow=false,spanish=false,current=null,questions=[],index=0,correct=0,answered=false,clip=null;
const clean=s=>String(s).toLowerCase().replace(/[’‘]/g,"'").replace(/[.?!]/g,'').replace(/\s+/g,' ').trim();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const card=t=>`<button class="basics-topic-card" data-topic="${t.id}" type="button"><span class="basics-topic-icon">${t.icon}</span><span><strong>${esc(t.name)}</strong><small>${saved[t.id]?'✓ Practised':'Explore and practise'}</small></span><span aria-hidden="true">›</span></button>`;
function renderCatalog(){
 $('#vocab-list').innerHTML=V.map(card).join('');$('#grammar-list').innerHTML=G.map(card).join('');
 const n=all.filter(t=>saved[t.id]).length;$('#progress-count').textContent=`${n} of ${all.length} topics practised`;$('#progress-bar').style.width=`${n/all.length*100}%`;
}
function play(path,button){if(clip){clip.pause();clip.currentTime=0}clip=new Audio(path);clip.playbackRate=slow?.78:1;clip.onended=()=>button?.classList.remove('playing');button?.classList.add('playing');clip.play().catch(()=>{button?.classList.remove('playing');showAudioError()})}
function showAudioError(){let el=$('#audio-error');if(el)el.textContent='Audio could not play. Try again or check your sound settings.'}
const vocabFile=(topic,i)=>`audio/basic_v_${topic.id}_${i}.wav?v=10`,grammarFile=(topic,i)=>`audio/basic_g_${topic.id}_${i}.wav?v=10`;
function openTopic(id){
 current=all.find(t=>t.id===id);if(!current)return;
 const vocab=V.includes(current),t=current;
 let html=`<div class="basic-panel-head"><div><span class="kicker ${vocab?'orange':'purple'}">${vocab?'VOCABULARY':'GRAMMAR'}</span><h2>${t.icon} ${esc(t.name)}</h2></div><button class="basics-close" type="button" aria-label="Close topic">×</button></div>
 <div class="basic-theory"><div><h3>Learn and remember 💡</h3><p>${esc(t.intro)}</p><p class="basic-rule">${esc(t.rule)}</p></div><div><h3>Hear it in a sentence 🎧</h3>${t.examples.map((e,i)=>`<div class="basic-example"><span>${esc(e)}</span><button class="basic-audio" data-audio="${t.examplesAudio?.[i]||grammarFile(t,i)}" type="button" aria-label="Play example ${i+1}">▶</button></div>`).join('')}</div></div>`;
 if(vocab){const wordCard=(w,i)=>`<button class="basic-word" data-audio="${w.audio||vocabFile(t,i)}" type="button"><span>${w.emoji}</span><strong>${esc(w.word)}</strong>${w.hint?`<small>${w.hint}</small>`:''}<b>▶</b></button>`;
 html+=`<h3 class="basic-subhead">Word cards 🔊</h3>`+(t.id==='numbers'?
 [[0,20,'1–20'],[20,50,'21–50'],[50,100,'51–100']].map(([from,to,label],k)=>`<details class="basic-number-group" ${k===0?'open':''}><summary>Numbers ${label}</summary><div class="basic-word-grid">${t.items.slice(from,to).map((w,i)=>wordCard(w,from+i)).join('')}</div></details>`).join(''):
 `<div class="basic-word-grid">${t.items.map(wordCard).join('')}</div>`);
 html+=extraGame(t)}
 if(t.id==='past-simple')html+=`<div class="basic-mini"><h3>Match base and past forms 🕰️</h3><p>Choose the past form. Get feedback after each choice.</p><div class="basic-special" data-kind="past"></div></div>`;
 html+=`<div class="basic-practice"><h3>Try it! 🎯</h3><p>Get instant feedback. You can try again as often as you like.</p><p class="basic-es" hidden></p><button class="button primary basic-start" type="button">Start practice</button><div id="basic-question" hidden></div></div><p id="audio-error" role="status"></p>`;
 const panel=$('#topic-panel');panel.innerHTML=html;$$('.basic-mini>p').forEach(el=>el.insertAdjacentHTML('afterend','<small class="basic-es" lang="es" hidden>Completa el juego y comprueba tus respuestas.</small>'));panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'});updateSpanish();
}
function extraGame(t){
 if(['days','months','routines'].includes(t.id))return`<div class="basic-mini"><h3>${esc(t.game)} 🧩</h3><p>Tap the words in the correct order.</p><div class="basic-order-pool"></div><div class="basic-order-answer" aria-live="polite"></div><button class="basics-text-button basic-order-reset" type="button">Try again</button></div>`;
 if(t.id==='sports')return`<div class="basic-mini"><h3>Go + activity ⚽</h3><p>Choose the verb for each sport.</p><div class="basic-special" data-kind="sports"></div></div>`;
 if(t.id==='countries')return`<div class="basic-mini"><h3>Country match 🌍</h3><p>Match countries to nationalities.</p><div class="basic-special" data-kind="countries"></div></div>`;
 if(t.id==='animals')return`<div class="basic-mini"><h3>Animal detective 🐾</h3><p>Match each clue to an animal.</p><div class="basic-special" data-kind="animals"></div></div>`;
 if(t.id==='food')return`<div class="basic-mini"><h3>Food groups 🍽️</h3><p>Choose the right group for each food.</p><div class="basic-special" data-kind="food"></div></div>`;
 if(t.id==='weather')return`<div class="basic-mini"><h3>Weather reporter ☀️</h3><p>Read the clue and report the weather.</p><div class="basic-special" data-kind="weather"></div></div>`;
 if(t.id==='numbers')return`<div class="basic-mini"><h3>Number builder 🔢</h3><p>Write the number in words. Remember the hyphen.</p><div class="basic-special" data-kind="numbers"></div></div>`;
 return '';
}
let order=[],specialIndex=0,pastQueue=null,pastWrong=new Set();
const special={
 sports:[['rock climbing','go'],['rafting','go'],['surfing','go'],['snowboarding','go'],['skateboarding','go'],['zip-lining','go']],
 countries:[['Spain','Spanish'],['France','French'],['Italy','Italian'],['the United Kingdom','British'],['the United States','American'],['Japan','Japanese']],
 animals:[['has got wings','eagle'],['has got fins','dolphin'],['has got a hump','camel'],['has got thick fur','polar bear'],['has got scales','crocodile'],['can run very fast','cheetah']],
 food:[['apple','fruit'],['carrot','vegetables'],['wholegrain bread','whole grains'],['egg','protein'],['water','water']],
 weather:[['The sun is shining.','sunny'],['The sky is full of clouds.','cloudy'],['Water is falling from clouds.','rainy'],['The air is moving strongly.','windy'],['Snow is falling.','snowy'],['You can hear thunder.','stormy'],['You cannot see far.','foggy']],
 numbers:[['21','twenty-one'],['32','thirty-two'],['40','forty'],['45','forty-five'],['58','fifty-eight'],['67','sixty-seven'],['74','seventy-four'],['86','eighty-six'],['99','ninety-nine'],['100','one hundred']],
 past:[['play','played'],['visit','visited'],['watch','watched'],['go','went'],['eat','ate'],['see','saw'],['have','had']]
};
function initGame(){
 if($('.basic-order-pool')){order=[];let words=current.items.map(w=>w.word);$('.basic-order-pool').innerHTML=shuffle(words).map(w=>`<button type="button" class="basic-chip" data-word="${esc(w)}">${esc(w)}</button>`).join('');$('.basic-order-answer').textContent='';}
 specialIndex=0;pastQueue=special.past.map((_,i)=>i);pastWrong.clear();renderSpecial();
}
function renderSpecial(){
 const box=$('.basic-special');if(!box)return;const kind=box.dataset.kind,rows=special[kind],row=rows[kind==='past'?pastQueue[specialIndex]:specialIndex];
 if(!row){box.innerHTML='<p class="basic-success">Brilliant! You finished this game. ⭐</p>'+(kind==='past'&&pastWrong.size?`<button type="button" class="button secondary retry-past">Retry only the ${pastWrong.size} forms you missed</button>`:'');return}
 let opts=kind==='sports'?['play','go','do']:shuffle([row[1],...shuffle(rows.map(r=>r[1]).filter(x=>x!==row[1])).slice(0,2)]);
 box.innerHTML=`<strong>${specialIndex+1} / ${rows.length}: ${kind==='numbers'?row[0]:esc(row[0])}</strong><div class="basic-special-options">${kind==='numbers'&&!support?'<input aria-label="Write the number in words" autocomplete="off"><button type="button" class="button secondary basic-special-check">Check</button>':opts.map(o=>`<button type="button" class="basic-choice" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div><p class="basic-special-feedback" role="status"></p>`;
}
function specialAnswer(value){const kind=$('.basic-special').dataset.kind,row=special[kind][kind==='past'?pastQueue[specialIndex]:specialIndex],el=$('.basic-special-feedback');if(clean(value)===clean(row[1])){el.textContent='Correct! ⭐';el.className='basic-special-feedback good';setTimeout(()=>{specialIndex++;renderSpecial()},650)}else{if(kind==='past')pastWrong.add(pastQueue[specialIndex]);el.textContent=`Try again. The answer is ${row[1]}.`;el.className='basic-special-feedback bad'}}
function makeQuestions(){
 if(G.includes(current))return shuffle(current.questions).slice(0,support?5:current.questions.length);
 const items=shuffle(current.items).slice(0,support?7:current.id==='numbers'?15:Math.min(12,current.items.length));
 return items.map((w,i)=>{const j=current.items.indexOf(w),others=shuffle(current.items.filter(x=>x.word!==w.word)).slice(0,2).map(x=>x.word);
  return {prompt:current.id==='numbers'?`How do you write ${w.hint}?`:(i%2===0?'Listen. Which word do you hear?':`Choose the word for ${w.emoji}`),answer:w.word,options:shuffle([w.word,...others]),kind:i%3===2?'write':'choice',audio:i%2===0?(w.audio||vocabFile(current,j)):null};
 });
}
function start(){questions=makeQuestions();index=0;correct=0;answered=false;$('.basic-start').hidden=true;$('#basic-question').hidden=false;renderQuestion()}
function renderQuestion(){
 const box=$('#basic-question');if(index>=questions.length){saved[current.id]=true;try{localStorage.setItem(key,JSON.stringify(saved))}catch{}renderCatalog();box.innerHTML=`<div class="basic-finished"><span>🎉</span><h4>Practice complete!</h4><p>You got ${correct} of ${questions.length} correct. You can practise this topic again at any time.</p><button class="button secondary basic-restart" type="button">Try again</button><button class="basics-text-button basics-close" type="button">Choose another topic</button></div>`;return}
 const x=questions[index],useChoice=support||x.kind!=='write';answered=false;
 box.innerHTML=`<div class="basic-qhead"><span>Question ${index+1} of ${questions.length}</span><span>${correct} correct ⭐</span></div><div class="basic-qtrack"><span style="width:${index/questions.length*100}%"></span></div><h4>${esc(x.prompt)}</h4>${x.audio?`<button type="button" class="button secondary basic-qaudio" data-audio="${x.audio}">▶ Play audio</button>`:''}<p class="basic-es" ${spanish?'':'hidden'}>${spanish?'Elige o escribe la respuesta correcta.':' '}</p>${useChoice?`<div class="basic-options">${shuffle(x.options).map(o=>`<button type="button" class="basic-choice" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>`:`<div class="basic-write"><input id="basic-written" aria-label="Your answer" autocomplete="off" spellcheck="false"><button type="button" class="button secondary basic-check">Check</button></div>`}<p id="basic-feedback" role="status"></p><button type="button" class="button primary basic-next" hidden>${index+1===questions.length?'See result':'Next question'}</button>`;
}
function submit(value){if(answered||!clean(value))return;const x=questions[index],ok=clean(value)===clean(x.answer),f=$('#basic-feedback');answered=true;if(ok)correct++;f.textContent=ok?'Correct! Great work. ⭐':`Good try. The answer is: ${x.answer}`;f.className=ok?'good':'bad';$('.basic-next').hidden=false;$$('.basic-choice').forEach(b=>{b.disabled=true;if(clean(b.dataset.answer)===clean(x.answer))b.classList.add('right');else if(clean(b.dataset.answer)===clean(value))b.classList.add('wrong')});$('.basic-check')?.setAttribute('disabled','')}
const $$=s=>[...document.querySelectorAll(s)];
function updateSpanish(){$('#spanish-help').textContent=`Help in Spanish: ${spanish?'on':'off'}`;$('#spanish-help').setAttribute('aria-pressed',String(spanish));$$('.basic-es').forEach(el=>{el.hidden=!spanish;if(el.matches('.basic-practice>.basic-es'))el.textContent='Practica y comprueba tus respuestas. Puedes volver a intentarlo.'})}
document.addEventListener('click',e=>{
 const topic=e.target.closest('[data-topic]');if(topic){openTopic(topic.dataset.topic);initGame();return}
 const audio=e.target.closest('[data-audio]');if(audio){play(audio.dataset.audio,audio);return}
 if(e.target.closest('.basics-close')){$('#topic-panel').hidden=true;$('#topic-panel').innerHTML='';$('#vocab-title').scrollIntoView({behavior:'smooth'});return}
 if(e.target.closest('.basic-start')||e.target.closest('.basic-restart')){start();return}
 if(e.target.closest('.basic-choice')){const b=e.target.closest('.basic-choice');if(b.closest('.basic-special'))specialAnswer(b.dataset.answer);else submit(b.dataset.answer);return}
 if(e.target.closest('.basic-check')){submit($('#basic-written').value);return}
 if(e.target.closest('.basic-next')){index++;renderQuestion();return}
 if(e.target.closest('.basic-special-check')){specialAnswer($('.basic-special input').value);return}
 if(e.target.closest('.retry-past')){pastQueue=[...pastWrong];pastWrong.clear();specialIndex=0;renderSpecial();return}
 if(e.target.closest('.basic-order-reset')){initGame();return}
 const chip=e.target.closest('.basic-chip');if(chip){const expected=current.items[order.length].word;if(chip.dataset.word===expected){order.push(expected);chip.disabled=true;chip.classList.add('chosen');$('.basic-order-answer').textContent=order.join(' → ')+(order.length===current.items.length?' 🎉':'')}else{$('.basic-order-answer').textContent='Try another word. The next one comes after '+(order.at(-1)||'the beginning')+'.'}return}
});
$('#support-mode').addEventListener('change',e=>{support=e.target.checked;if(current){renderSpecial();if(!$('#basic-question').hidden&&index<questions.length)renderQuestion()}});
$('#slow-audio').addEventListener('change',e=>{slow=e.target.checked;if(clip)clip.playbackRate=slow?.78:1});
$('#spanish-help').addEventListener('click',()=>{spanish=!spanish;updateSpanish();if(current&&$('#basic-question')&&!$('#basic-question').hidden&&index<questions.length)renderQuestion()});
$('#reset-progress').addEventListener('click',()=>{saved={};try{localStorage.removeItem(key)}catch{}renderCatalog();$('#progress-count').textContent=`0 of ${all.length} topics practised`});
[['text-size','large-text'],['line-space','spaced-text'],['high-contrast','high-contrast']].forEach(([id,cls])=>{let button=$('#'+id),active=false;try{active=localStorage.getItem('year5-'+cls)==='1'}catch{};document.body.classList.toggle(cls,active);button.setAttribute('aria-pressed',String(active));button.addEventListener('click',()=>{active=!active;document.body.classList.toggle(cls,active);button.setAttribute('aria-pressed',String(active));try{localStorage.setItem('year5-'+cls,active?'1':'0')}catch{}})});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='basic-written')submit(e.target.value);if(e.key==='Enter'&&e.target.closest('.basic-special input'))specialAnswer(e.target.value)});
renderCatalog();
})();

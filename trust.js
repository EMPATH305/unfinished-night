/* 空白信託: author text only. No player answer collection, state mutation or storage. */
(function(root){'use strict';
const letters=[
{id:1,title:'帶著痛苦，仍是我',question:'如果有一天，你發現自己最深的痛苦是你人格的一部分—甚至是你最強大的那部分—那麼你還願意把它治好嗎？',answers:[{label:'林萱渝的白紙原文',text:'我願意—不擇手段地。縱使我心知肚明這將會是長久以及艱難的戰鬥，而對手是我自己。痛苦與強大並存，我必須拆開最深層的傷疤。我想正是因為這份軟肋讓我更加堅堅強。治好是很好，接受與包容才是核心。倘若無法改變，仍然—這就是我。為何不能帶著強大的痛苦存活在世界上呢？無奈我何。'}],
 scene:['索恩將修補紀錄放到鐘下。那些裂痕曾讓他知道自己有用，也曾使他不敢鬆手。','你問墨，少了一道傷，會不會也少了一部分自己。','「我不知道。」牠說，「但這次，紙在你那邊。」'],site:'迴星鎮・守夜人回訪'},
{id:2,title:'傷口之外留下的意義',question:'我真正害怕失去的是傷口，還是傷口帶來的意義？',answers:[{label:'版本一・種子流派',text:'我怕傷口帶來的意義。會有人希望擁有傷口嗎？思索片刻，我察覺有時痛苦就這麼出現在你（妳）家門口對著你（妳）打招呼。治療傷口的期間，「意義」也悄悄種了種子在心底。它可以是好，也能是其他。我不擔心傷口失去，而是如果我忘記了為何它對我來說很重要，會很空虛吧。'},{label:'版本二・勇氣流派',text:'當最深層的痛苦被自己治癒，而我是否依然強大？我想「勇氣」是最好的解答，直面地往絕對真實的自我洞悉與覺察。隨時機成熟後，就算不是當時帶著強大並痛苦的自己。重新開始，一步步踏實地。總會在「某一天」，我將會成為更有力量的存在。'}],
 scene:['米珂不再需要用名字續借，卻沒有立刻換一個名字。母親曾用它叫他回家。','墨站在不稱巷的桌邊。「同一個名字，可以留下不只一件事。」','風掀起紙角。「你不必在這裡選一種流派。這兩段話，都有人曾經寫過。」'],site:'赤赭鹽市・米珂回訪'},
{id:3,title:'走廊裡沒有落款',question:'如果有一天，你不再以痛苦來定義自己，你還剩下什麼？',answers:[{label:'林萱渝的白紙原文',text:'能定義自己的元素有許多。我不定義自己失去「痛苦」以外後，我會一無所有。說不定正是因為失去，反而獲得其他更具意義的東西。值得思索的是，以「痛苦」定義自我有什麼問題嗎？我想這沒有標準答案，遑論「二分法」。'}],
 scene:['候歸之室的門已經有了把手。門外的走廊褪成很淡的白，沒有替你掛上新的名字。','「是不是一定要留下什麼，才可以走？」你問。','墨停在門檻上。「不寫，也能過去。門不是用答案打開的。」'],site:'候歸之室・出口與空白海之間'},
{id:4,title:'第二扇窗的此刻',question:'如果有一天，你突然不再感到痛苦，你會用什麼方式辨認自己依然是「你」？',answers:[{label:'林萱渝的白紙原文',text:'我會回首看向當時的我，即便是「過去」。這僅是第一步。再來，我會回到當下並聆聽心聲—深沈、緩慢地。「這就是我呀......。」如果我的過去沒有痛苦，我還能辨認現在的自己嗎？我「想」，所有的「你」就在彼岸存在著。'}],
 scene:['安妲將毛線放回膝上。兩扇窗看見的雪不同，桌上的水仍在今天慢慢變涼。','你問墨，哪一扇窗裡的人才算自己。','「先聽你現在站的地方。」牠說，「至於彼岸，我們還沒有走到。」'],site:'雪鈴城・安妲回訪'},
{id:5,title:'沒有痛，也可以相信',question:'如果痛苦讓你覺得「真實」—那麼沒有痛苦，還能相信自己的情感嗎？',answers:[{label:'林萱渝的白紙原文',text:'能，讓我覺得「真實」不只有痛苦。狂喜、感動到流淚、平靜......等，這些足夠讓我去相信自己的情感，它們絕不是虛假，而是真切地在我心裡。那如果我不相信我的情感，我會成為毫無意義的空殼吧。痛苦與否和「相信」有確切的連結嗎？我不這麼認為。擁有信念就不怕被動搖。'}],
 scene:['墨不再把所有人的名字扛在一根羽毛上。你們坐了一會兒，沒有新的裂口要求立刻修好。','「現在很安靜。」你說。','「嗯。」墨說，「這一刻，也可以留在紙上。不必先證明它夠痛。」'],site:'空白海・墨的回訪／玻璃潮汐・艾汀回訪'}
];
function at(state,node,revisited){if(!revisited)return [];const c=state.chapter,f=state.flags||{},chosen=state.choices||{};
 if(c===0&&node==='keeper'&&chosen.c1)return [1];
 if(c===5&&node==='witness'&&chosen.c6)return [2];
 if(c===3&&node==='door'&&chosen.c4&&(state.contentVersion===1||f.c4_after))return [3];
 if(c===6&&node==='witness'&&chosen.c7)return [4];
 if((c===4&&node==='ink'&&f.c5_promise)||(c===7&&node==='witness'&&chosen.c8))return [5];
 return [];
}
function open(id){const doc=root.document,dialog=doc.getElementById('trust-dialog');
 const make=(tag,text,cls)=>{const e=doc.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
 const button=(text,run,cls='secondary')=>{const b=make('button',text,cls);b.type='button';b.onclick=run;return b;};
 function frame(title){dialog.replaceChildren();const top=make('div',null,'dialog-top');top.append(make('span','空白信託 · 自願開啟','eyebrow'),button('關閉空白信託',()=>dialog.close(),'text-btn'));const h=make('h2',title);h.id='trust-heading';dialog.append(top,h);dialog.scrollTop=0;return dialog;}
 function index(){frame('創作者的五封白紙');dialog.classList.remove('trust-corridor');dialog.append(make('p','以下回應由林萱渝親筆寫下。它們是創作者的文字，不是烏鴉的答案，也不是玩家需要同意的結論。'),make('p','你可以只讀、在實體白紙上寫，也可以今天不寫。六至十封留待創作者親自完成。','fine'));const list=make('div',null,'trust-actions');letters.forEach(l=>list.append(button('第'+l.id+'封 · '+l.title,()=>letter(l.id))));dialog.append(list,button('今天不寫，回到原處',()=>dialog.close(),'text-btn'));}
 function letter(number){const l=letters.find(l=>l.id===number);if(!l){index();return;}
 frame('第'+l.id+'封 · '+l.title);dialog.classList.toggle('trust-corridor',number===3);dialog.append(make('p',l.site,'fine'));
 const intro=make('div',null,'trust-scene');l.scene.forEach(t=>intro.append(make('p',t)));dialog.append(intro);
 dialog.append(make('p','如果願意，拿一張 A6 白紙（105 × 148 mm；A4 四等分即可）、一支筆和一個實體信封。沒有合適的紙，可用手邊白紙或改日再來。','trust-preparation'));
 const question=make('blockquote',l.question,'trust-question');question.hidden=true;question.id='trust-question';question.setAttribute('aria-live','polite');question.setAttribute('aria-atomic','true');
 const reveal=button('讓問題顯現',()=>{question.hidden=false;question.classList.add('ink-arriving');reveal.hidden=true;immediate.hidden=false;question.scrollIntoView({block:'nearest'});});reveal.setAttribute('aria-controls','trust-question');
 const immediate=button('立即顯示全文',()=>{question.classList.remove('ink-arriving');immediate.hidden=true;},'text-btn');immediate.hidden=true;
 const original=make('details',null,'trust-original');original.append(make('summary','閱讀林萱渝的白紙原文'));
 original.append(make('p','作者：林萱渝。以下保留提供的原文與標點；新增的場景引言由 AI 協作撰寫。','fine'));
 l.answers.forEach(a=>{original.append(make('h3',a.label),make('p',a.text,'trust-letter-text'));});
 const instructions=make('p','寫下你願意留下的部分，封入實體信封，留在自己手裡。這裡沒有上傳、輸入或交卷的位置，也不會詢問你是否寫完。','trust-preparation');
 const end=make('div',null,'trust-actions');end.append(button('回到原處',()=>dialog.close()),button('閱讀其他四封',index,'text-btn'));
 dialog.append(reveal,immediate,question,original,instructions,make('p','系統不記錄你開過哪封、是否書寫或紙上的回應。重新開啟時，問題會重新等候。','fine'),end);
 }
 if(id)letter(id);else index();if(!dialog.open)dialog.showModal();dialog.querySelector('button').focus({preventScroll:true});
}
root.NightTrust={letters,at,open};if(typeof module!=='undefined')module.exports=root.NightTrust;
})(typeof globalThis!=='undefined'?globalThis:this);

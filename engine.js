(function(root){'use strict';
const Story=root.NightStory||(typeof require==='function'?require('./story.js'):null);
const Journey=root.NightJourney||(typeof require==='function'?require('./journey.js'):null);
Journey.install(Story);
const Second=root.NightSecond||(typeof require==='function'?require('./second.js'):null);
Second.install(Story);
const Resonance=root.NightResonance||(typeof require==='function'?require('./resonance.js'):null);
const SAVE_VERSION=2;
// Schema migrations are separate from story progression. Never mutate an import.
const migrations={1:raw=>({...raw,version:2,contentVersion:raw.contentVersion??1,region:raw.region??0})};
const initial=()=>({version:SAVE_VERSION,contentVersion:2,region:0,chapter:0,blank_trust_stage:0,started:false,finished:false,flags:{},choices:{},pigments:[],memories:[],position:{x:50,y:82}});
const say=(id,label,run,detail)=>({id,label,run,detail});
class Game{
 constructor(state){this.state=state?Game.validate(state):initial();this.actions=new Map();this.view=null;this.puzzle=null;}
 static migrate(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||!Number.isInteger(raw.version)||raw.version<1)throw Error('這不是相容的旅程存檔。');
  if(raw.version>SAVE_VERSION)throw Error('這份存檔來自較新的遊戲版本。請更新遊戲後再匯入；原存檔仍可保留。');
  let migrated={...raw};
  while(migrated.version<SAVE_VERSION){const upgrade=migrations[migrated.version];if(!upgrade)throw Error('缺少這份存檔的升級方式。');migrated=upgrade(migrated)}
  return migrated;
 }
 static validate(raw){
  raw=Game.migrate(raw);
  const stage=raw.blank_trust_stage===undefined?0:raw.blank_trust_stage;
  if(!Number.isInteger(stage)||stage<0||stage>6)throw Error('封信階段資料無效。');
  if(!Number.isInteger(raw.chapter)||raw.chapter<0||raw.chapter>7||typeof raw.started!=='boolean'||typeof raw.finished!=='boolean')throw Error('這不是相容的旅程存檔。');
  if(!raw.flags||typeof raw.flags!=='object'||Array.isArray(raw.flags)||Object.keys(raw.flags).length>250)throw Error('存檔的事件資料不完整。');
  if(Object.entries(raw.flags).some(([k,v])=>!/^c[1-8]_[a-z_]+$/.test(k)||typeof v!=='boolean'))throw Error('存檔含有無效事件。');
  if(!Array.isArray(raw.memories)||raw.memories.length>Object.keys(Story.memories).length||raw.memories.some(k=>!Object.hasOwn(Story.memories,k))||new Set(raw.memories).size!==raw.memories.length)throw Error('存檔的記憶資料無效。');
  if(!Array.isArray(raw.pigments)||raw.pigments.some(c=>!['yellow','blue','green'].includes(c))||new Set(raw.pigments).size!==raw.pigments.length)throw Error('存檔的顏色資料無效。');
  const sets=[['night','dawn'],['letter','beacon'],['seasons','consent'],['rest','release'],['restore','open','share'],['commons','passage'],['reopen','fieldwork'],['shortwatch','shorework']];
  if(!raw.choices||typeof raw.choices!=='object'||Array.isArray(raw.choices)||Object.entries(raw.choices).some(([k,v])=>!/^c[1-8]$/.test(k)||!sets[Number(k[1])-1].includes(v)))throw Error('存檔的選擇資料無效。');
  for(let i=0;i<raw.chapter;i++)if(!raw.choices['c'+(i+1)])throw Error('存檔缺少前一章的結局。');
  if(raw.finished&&!((raw.chapter===4&&raw.choices.c5)||(raw.chapter===7&&raw.choices.c8&&raw.flags.c8_after&&raw.flags.c8_witness_after&&raw.flags.c8_returned)))throw Error('結局資料不完整。');
  if(!raw.position||!Number.isFinite(raw.position.x)||!Number.isFinite(raw.position.y)||raw.position.x<0||raw.position.x>100||raw.position.y<0||raw.position.y>100)throw Error('存檔的位置無效。');
  if(![1,2,3].includes(raw.contentVersion)||(raw.chapter>=5&&raw.contentVersion!==3)||(raw.chapter<5&&raw.contentVersion===3))throw Error('這份存檔來自不支援的故事版本。');
  if(!Number.isInteger(raw.region)||raw.region<0||raw.region>1)throw Error('探索區域資料無效。');
  return {version:SAVE_VERSION,blank_trust_stage:stage,contentVersion:raw.contentVersion,region:raw.contentVersion>=2?raw.region:0,chapter:raw.chapter,started:raw.started,finished:raw.finished,flags:{...raw.flags},choices:{...raw.choices},pigments:[...raw.pigments],memories:[...raw.memories],position:{...raw.position}};
 }
 sealTrust(expected){if(expected!==this.state.blank_trust_stage||expected>=6||(expected===5&&this.state.chapter<6))return false;this.state.blank_trust_stage++;return true;}
 memoryText(key){return this.state.chapter>=5?Second.memoryText(this,key,Journey.memoryText(this,key,Story.memories[key].text)):Journey.memoryText(this,key,Story.memories[key].text)}
 get chapter(){return Story.chapters[this.state.chapter]}
 get expanded(){return this.state.contentVersion>=2}
 get regions(){return this.expanded?this.chapter.regions:[{name:'原有旅程',ids:this.chapter.nodes.map(n=>n[0])}]}
 get allNodes(){return this.expanded?[...this.chapter.nodes,...this.chapter.expansionNodes]:this.chapter.nodes}
 regionFor(id){return this.regions.findIndex(r=>r.ids.includes(id))}
 get mapNodes(){
  if(!this.expanded)return this.chapter.nodes;
  const coordinates=[[22,37],[75,37],[47,54],[22,73],[78,73]];
  return this.regions[this.state.region].ids.map((id,i)=>{const n=this.allNodes.find(n=>n[0]===id);return [n[0],n[1],...coordinates[i],n[4]]});
 }
 setRegion(index){if(!Number.isInteger(index)||index<0||index>=this.regions.length)throw Error('這個探索區域不存在。');this.state.region=index;this.state.position={x:50,y:85};this.actions.clear();this.puzzle=null;this.view=null;return this.regions[index].name}
 get goal(){return this.state.chapter>=5?Second.goal(this):Journey.goal(this)}
 has(k){return !!this.state.flags[k]}
 flag(k){this.state.flags[k]=true}
 remember(k){if(!this.state.memories.includes(k))this.state.memories.push(k)}
 carries(c){return this.state.pigments.includes(c)}
 take(c){if(!this.carries(c))this.state.pigments.push(c)}
 use(c){this.state.pigments=this.state.pigments.filter(x=>x!==c)}
 show(speaker,text,options=[],puzzle=null){this.actions=new Map(options.map(o=>[o.id,o.run]));this.puzzle=puzzle;this.view={speaker,text:Array.isArray(text)?text:[text],choices:options.map(({run,...o})=>o),puzzle};return this.view}
 choose(id){if(!this.actions.has(id))throw Error('這個選擇目前不可使用。');const run=this.actions.get(id);return run()}
 start(){this.state.started=true;return this.intro()}
 intro(){return this.show('第'+['一','二','三','四','五','六','七','八'][this.state.chapter]+'章 · '+this.chapter.title,(this.state.chapter>=5?this.chapter.intro:Journey.intro(this)),[say('explore','開始探索',()=>null)])}
 decide(key,value,text){this.state.choices[key]=value;this.flag(key+'_done');return this.show('選擇留下的痕跡',text,[say('back','回到畫境，看看改變',()=>null)])}
 advance(){if(!this.state.choices['c'+(this.state.chapter+1)]||(this.state.chapter===4||this.state.chapter>=7))throw Error('這一章的故事還沒有結束。');if(!(this.state.chapter>=5?Second.ready(this):Journey.readyToLeave(this)))throw Error(this.goal.text);this.state.chapter++;this.state.contentVersion=this.state.chapter>=5?3:2;this.state.region=0;this.state.pigments=[];this.state.position={x:50,y:84};return this.intro()}
 interact(id){
  const revisited=this.has('c'+(this.state.chapter+1)+'_visited_'+id);
  const view=this.interactBase(id);
  this.view=Resonance.decorate(this.state,id,revisited,view);return this.view;
 }
 interactBase(id){
  if(!this.mapNodes.some(n=>n[0]===id))throw Error('這裡沒有那個地標。');
  this.flag('c'+(this.state.chapter+1)+'_visited_'+id);
  if(this.state.chapter>=5)return Second.event(this,id);
  const chapterEvent=Journey.event(this,id);if(chapterEvent)return chapterEvent;
  return [this.one,this.two,this.three,this.four,this.five][this.state.chapter].call(this,id);
 }
 one(id){const s=this.state,c=s.choices.c1;
  if(id==='lamp'){
   if(c)return this.show('製燈人 · 亞恩',c==='dawn'?['他把掛在門邊的燈收進屋裡，摸索著拉開第一道窗簾。','「她看到的早晨，也是這種顏色嗎？」你說不知道。這次，他沒有要求一個保證。']:['他在燈下攤開你帶回的信，開始抄錄小鎮裡每個人的名字。','「等我們準備好，就一起轉動那座鐘。」他知道這不是永久的辦法，但他終於參與了決定。']);
   if(this.has('c1_yellow'))return this.show('製燈人 · 亞恩',['借走金色後，門前暗了一些。他把椅子移近鄰居的窗。','「我女兒留了一封信。紙上的字都不見了。你能把光借給那封信嗎？」']);
   return this.show('製燈人 · 亞恩',['「我女兒去了麥田。她說明天回信。」他停了一下。「這裡很久沒有明天了。」','墨碰了碰你的手。「把燈裡的一點黃借過來。顏色能移動，但不會憑空增加。用完，要記得歸還。」'],[say('borrow-yellow','借取燈中的黃色',()=>{this.flag('c1_yellow');this.take('yellow');return this.show('你借到了一點黃色','燈暗了。手心的金色卻仍然溫熱。去看看路邊那封褪色的信。')},'燈會暫時暗下來。')]);
  }
  if(id==='well'){
   if(this.has('c1_blue'))return this.show('靜藍井','井水映不出天空了。借來的藍能使鐘樓外那道流動的裂縫凝止。');
   return this.show('墨',['「這口井借給你藍，就暫時失去倒影。別把失去顏色的地方，當成原本就空無一物。」'],[say('borrow-blue','借取井中的藍色',()=>{this.flag('c1_blue');this.take('blue');return this.show('凝止之藍','井裡的星光消失了。你獲得暫時凝止流動之物的能力。')})]);
  }
  if(id==='letter'){
   if(this.has('c1_letter'))return this.show('褪色的信',this.memoryText('letter'));
   if(!this.carries('yellow'))return this.show('褪色的信','信紙上只剩一個「爸」。需要一點黃色，才能照見消失的墨跡。製燈人或許願意借你一點光。');
   return this.show('褪色的信','你把手心靠近紙張。金色沿著原本的筆跡緩緩移動。',[say('reveal','用黃色照亮信件',()=>{this.flag('c1_letter');this.use('yellow');this.remember('letter');return this.show('艾菈留下的話',[this.memoryText('letter'),'讀完後，你將借來的黃色沿著燈線送回。製燈人的窗重新亮了。'])})]);
  }
  if(id==='keeper'){
   if(this.has('c1_keeper'))return this.show('守夜人 · 索恩',c?['他從鐘樓走了下來。這次，居民能直接問他問題。','墨小聲說：「把高處的決定，帶回人群裡。這也算一種修復。」']:this.memoryText('clock'));
   if(!this.carries('blue'))return this.show('流動的裂縫','鐘樓外的裂痕像河水流動，切斷了道路。先從靜藍井借取藍色，才能讓你安全通過。');
   return this.show('鐘樓外',[ '裂縫裡傳來無數個同一天的鐘聲。你可以借藍色，讓它暫時停下。'],[say('freeze','凝止裂縫，走進鐘樓',()=>{this.use('blue');this.flag('c1_keeper');this.remember('clock');return this.show('守夜人 · 索恩',[this.memoryText('clock'),'「我救過他們。」他緊握鐘錘。「如果放手後又失去誰，我要怎麼承受？」','你離開時取回凝止裂縫的藍，送回井中。道路仍危險；現在你知道鐘樓裡住著誰。'])})]);
  }
  if(id==='star'){
   if(c)return this.show('星辰',c==='dawn'?'星星終於完成了一次旋轉。遠處的天空，開始有很淡的金色。':'星空維持緩慢的循環。鐘樓下多了一張公開記錄：每次修補，都必須讓居民知道。');
   if(!this.has('c1_letter')||!this.has('c1_keeper'))return this.show('失速的星辰',['三枚星鐘刻著燈、月、星的圖案。墨擋住你的手。','「先讀那封信，也聽聽守夜人的說法。修復之前，總得知道你在改變誰的生活。」']);
   if(!this.has('c1_tuned'))return this.show('星鐘的次序',this.expanded?'把信裡的半句筆記與索恩記得的規則合在一起，推得三種光的先後。可在手記分別重讀兩份證詞。':'依照信裡的提示，喚醒三枚星鐘。順序可以在旅人手記裡重讀。',[],{kind:'sequence',id:'stars',items:['星','燈','月','鐘'],length:3});
   return this.show('星空等待你的回答',['索恩召集居民，說出了循環的代價。有人害怕黎明，有人已經不願再過同一天。','兩條路都需要持續照顧。你能做的是先幫他們準備，而不是替他們保證永遠安全。'],[say('night','知情地延續星夜',()=>this.decide('c1','night',['居民決定暫留在星夜裡，輪流記錄名字與修補的代價。','你協助索恩建立公開的星鐘記錄。製燈人第一次讀懂女兒留下的信。去和他說說話，再踏上麥田小徑。']),'暫時維持小鎮，但停止隱瞞循環的磨損。'),say('dawn','一起準備，迎接黎明',()=>this.decide('c1','dawn',['你與居民加固屋簷，把借來的顏色歸還。索恩鬆開鐘錘。','第一縷晨光裡，製燈人收起了燈。去看看他的回應，再踏上麥田小徑。']),'結束循環，小鎮開始學習面對未知。')]);
  }
  if(id==='gate')return c?this.show('麥田小徑',['墨最後數了一次窗裡的人。「都還在。現在我們去找那個自己走出去的人。」'],[say('next','走向岔路麥原',()=>this.advance())]):this.show('麥田小徑','星鐘還沒得到回答。先查清信件與鐘樓的祕密，完成小鎮的選擇。');
 }
 two(id){
  if(id==='traveler'){this.flag('c2_traveler');return this.show('沒有影子的旅人',['「我在這裡等那個沒有選錯的自己。」旅人說。他的鞋底很乾淨，像從未走過路。','墨繞過他。「一直比較沒有走過的路，就很難看見腳下的泥。」','旅人指出溪邊的藍泥：艾菈的鞋上也有。他不肯陪你走，卻終於低頭看了看自己的腳。'])}
  if(id==='sign')return this.show('三面路牌',['左邊寫著「最安全」，右邊寫著「最快到」，中間沒有字。路牌每次轉動，承諾就換一個方向。','牌柱背面刻著一句話：「不要依照承諾找路。沿著她留下的次序走。」']);
  if(id==='feather'){this.flag('c2_feather');this.remember('footprints');return this.show('羽毛裡的路記',[Story.memories.footprints.text,'墨用喙輕碰羽毛。你聽見女孩的聲音：「我要看見真的遠方，即使沒有最好的一條路。」'])}
  if(id==='brook'){this.flag('c2_brook');return this.show('溪水與倒影',['溪底是一串往遠山走的腳印。倒影裡卻映出你返回修復室、從未走進畫裡的生活。','那個你看起來很平靜。你無從知道是否幸福。墨把一粒石頭丟進水裡，倒影散開。','「少看兩眼。倒影不必付出生活的代價。」'])}
  if(id==='path'){
   if(this.has('c2_path'))return this.show('固定下來的道路','路暫時不再分岔。遠行者的營火就在前方；她的故事應由她自己說。');
   if(!this.has('c2_feather'))return this.show('會移動的岔路','路一直在改變。先找到沾泥的羽毛，確認艾菈留下的路記。');
   return this.show('走過的人留下的次序','依照路記選擇三個地標。猜錯只會回到原地，不會失去記憶。',[],{kind:'sequence',id:'roads',items:['遠山','舊鐘','溪水','路牌'],length:3});
  }
  if(id==='daughter'){
   if(!this.has('c2_path'))return this.show('隔著麥浪的營火','你看得到火，卻始終走不到。先解開岔路的次序。');
   this.flag('c2_daughter');this.remember('daughter');
   if(this.state.choices.c2)return this.show('遠行者 · 艾菈',this.state.choices.c2==='letter'?['「謝謝你沒有替我答應回家。」艾菈把信交給一隻願意送信的烏鴉。','她在信末添上：我很好。我也想你。這兩件事，可以一起是真的。']:['艾菈把路標釘牢，寫下自己的名字與下一站。','「路修好了，我會回去看看。但那會是我的選擇。」']);
   return this.show('遠行者 · 艾菈',['女孩坐在營火邊，正替另一隻烏鴉包紮翅膀。她不是被困住的人。','「我想他。但想念不等於我應該一直待在那裡。」她問你，能不能帶回一個不會變成新枷鎖的消息。'],[say('send-letter','替她寄回真實的信',()=>this.decide('c2','letter',['你沒有替艾菈承諾歸期。她寫下目前的位置、平安的消息，以及還想走遠一些的願望。','墨叫來送信的同伴。「我們可以送信，不負責替別人改信。」'])),say('build-beacon','一起修復往返路標',()=>this.decide('c2','beacon',['你們用遺落的石塊建立可辨認的路標。路的兩端都保留選擇：可以前來，也可以不走。','墨記下每個地標。「比起替人決定目的地，我比較喜歡幫忙把路留下。」']))]);
  }
  if(id==='gate')return this.state.choices.c2?this.show('花園邊界','籬笆後的向日葵沒有朝向太陽，而是朝著一座人造的燈塔。',[say('next','走進日葵庭',()=>this.advance())]):this.show('花園邊界','先穿過岔路，聽艾菈說完自己的故事。');
 }
 three(id){
  if(id==='gardener'){this.flag('c3_gardener');return this.show('守庭人 · 瑟芙',this.state.choices.c3==='seasons'?['她收起長夏的時刻表，開始詢問老人如何照顧冬天的土壤。','「我還是怕花會死。」她說。「但也許我能學。」']:this.state.choices.c3==='consent'?['她在入口改掛一張告示：可以拒絕、可以撤回、也可以只來坐坐。','新的制度尚待檢驗。你提醒她，明亮不能只靠同一群人一直付出。']:['「記憶不是稅，是為了大家。」瑟芙說。她的袖口縫著許多年份，卻想不起自己第一次看見花開的樣子。','她不是沒有付出的人。正因如此，她很難接受別人拒絕。','「如果不再收取記憶，這裡真的能活下去嗎？」先去看帳簿，才有辦法回答。'])}
  if(id==='child'){this.flag('c3_child');return this.show('孩子 · 路恩',['他緊握一個有雨聲的玻璃瓶。「裡面有媽媽。我不想交出去。」','「那不是你唯一的快樂吧？」守庭人問。孩子搖頭，卻無法解釋這份快樂為何也會痛。','墨把翅膀擋在瓶子前。「先讓他有權說不。再問你們想問的事。」'])}
  if(id==='archive'){this.flag('c3_ledger');this.remember('ledger');return this.show('光的帳簿',[Story.memories.ledger.text,'帳簿上的「長夏」與「維生」被寫在同一欄，像是兩者從來不能分開。你用筆在中間畫了一條線。'])}
  if(id==='cistern'){
   if(this.has('c3_light'))return this.show('蓄光池',this.has('c3_balanced')?'六份光已分送到三座必要的燈。蓄光池只保留不再抽取記憶的管線。':'六份光已在分光器中等候。先依帳簿的需要分配，不能憑空增加。');
   return this.show('蓄光池','這裡有六份現存的光。移動它們可以維持生活，不必立刻取走孩子的記憶。',[say('collect-light','把六份光導入分光器',()=>{this.flag('c3_light');return this.show('光開始流動','六份光進入分光器。請前往三座分光燈，依帳簿分配。')})]);
  }
  if(id==='crow'){this.flag('c3_rain');this.remember('rain');return this.show('藏雨的烏鴉',[Story.memories.rain.text,'牠交出藏著雨聲的羽毛，翅膀輕了些。「我們記得住一陣子。別把一陣子誤會成永遠。」'])}
  if(id==='lamps'){
   if(!this.has('c3_ledger')||!this.has('c3_light'))return this.show('三座分光燈','需要先閱讀光的帳簿，並把蓄光池的六份光導入分光器。');
   if(!this.has('c3_balanced'))return this.show('六份光，要如何安放？','三處需要恰好足夠的光。帳簿記錄：育苗 2、住屋 3、道路 1。讓總數保持為 6。',[],{kind:'allocation',id:'lights',items:['育苗燈','住屋燈','路燈'],total:6});
   if(this.state.choices.c3)return this.show('三座分光燈',this.state.choices.c3==='seasons'?'第一次入秋的風穿過花園。路燈仍亮著，居民開始學習種不同季節的植物。':'長夏仍在，但記憶的交付有了撤回的權利。夜裡有人選擇關燈，也有人替鄰居多留一盞。');
   if(!this.has('c3_child')||!this.has('c3_rain'))return this.show('光已足夠，問題還沒結束','日常生活已恢復。去聽孩子與藏雨烏鴉的故事，再與居民討論長夏的未來。');
   return this.show('居民的夜間集會',['有些人希望保留長夏，有些人再也不願交出記憶。你展示帳簿：維持生活和維持永恆的夏天，是兩項不同的支出。','瑟芙第一次坐在人群裡，沒有站在分光器前。'],[say('seasons','讓四季重新到來',()=>this.decide('c3','seasons',['居民拆除永久長夏的管線，保留必要照明。轉季需要時間，也需要重新學習照顧作物。','路恩打開瓶子，讓雨聲回到空氣裡。瑟芙沒有叫他停下。']),'停止額外收取記憶，適應四季。'),say('consent','保留長夏，建立自願輪值',()=>this.decide('c3','consent',['居民制定可拒絕、可撤回的輪值制度；當光不足時，接受長夏暫停。','這不是一次就完成的公正。瑟芙答應公開帳簿，讓制度持續接受檢查。']),'讓選擇與代價公開，允許夏天暫停。')]);
  }
  if(id==='gate')return this.state.choices.c3?this.show('藍色門扉','花園深處有一扇門，門把的溫度讓你想起一個已經很久沒有回去的地方。',[say('next','推開藍色的門',()=>this.advance())]):this.show('藍色門扉','先完成光的分配，讓居民決定長夏的未來。');
 }
 four(id){
  if(id==='desk'){this.flag('c4_desk');return this.show('沒有寄出的信',['紙上寫著：「只要你一直等，我就會回來。」落款卻空白。','你讀第二遍，字變成：「只要你不離開，這裡就不會失去你。」','房間正在迎合你的願望。它很溫柔，也很擅長替你決定什麼才算安全。'])}
  if(id==='bed'){this.flag('c4_draft');this.remember('draft');return this.show('床下的底稿',[Story.memories.draft.text,'你摸到一個被劃去的名字。墨在窗外忽然停止說話。'])}
  if(id==='mirror'){
   if(this.has('c4_blue'))return this.show('借來的鏡子','藍色已凝止鏡中的假象。請去重疊的三幅畫，依底稿找回事件真正的次序。');
   return this.show('借來的鏡子','鏡中的房間比這裡更明亮，卻沒有窗。你可以借取鏡面的藍，凝止它正在改寫的回憶。',[say('borrow-mirror','借取鏡中的藍',()=>{this.flag('c4_blue');this.take('blue');return this.show('假象停止了一瞬','鏡面暗下來。三幅畫的底稿短暫顯露，等待你將它們放回原來的次序。')})]);
  }
  if(id==='wall'){
   if(this.has('c4_order'))return this.show('重疊的三幅畫','受傷的烏鴉、誕生的畫境、離開的畫者。你不再把先後誤認成一個永遠等待的命令。去窗邊回答墨。');
   if(!this.has('c4_draft')||!this.carries('blue'))return this.show('重疊的三幅畫','表面畫像一直改變。需要床下的底稿作為證據，以及鏡中的藍來凝止假象。');
   return this.show('把往事放回次序','按發生先後排列事件。床下的底稿已收入手記。',[],{kind:'sequence',id:'memories',items:['畫者離開','救下烏鴉','畫境誕生','永遠等待'],length:3});
  }
  if(id==='window'){
   if(!this.has('c4_order'))return this.show('窗外的墨',['牠敲了三次。「我還在。先去看底稿，別讓房間替你安排我們的過去。」','你回答牠，窗上的霧散開一小塊。']);
   this.flag('c4_name');this.remember('name');return this.show('墨',[Story.memories.name.text,'「我曾以為，只要一直記得，那個人就不算離開。」牠低頭整理羽毛。「但我也想知道，不等的時候，我會是誰。」','你沒有替牠決定名字，只再叫了一次：「墨。」牠抬起頭。']);
  }
  if(id==='door'){
   if(this.state.choices.c4)return this.show('有了把手的門','門外傳來潮汐的聲音。墨先飛出去，又回頭確認你是否跟上。',[say('next','前往空白海',()=>this.advance())]);
   if(!this.has('c4_name'))return this.show('消失的出口','門沒有把手。先釐清三幅畫的次序，再到窗邊聽墨說完。');
   return this.show('房間最後的挽留',['床鋪仍然溫暖。你不需要恨這個地方，才能離開它。','這次你知道，房間可以提供休息，卻無法替你承諾永遠。'],[say('rest','休息一晚，帶著記憶離開',()=>this.decide('c4','rest',['你與房間約定一個離開的時刻。醒來時，杯子已經涼了，門卻有了把手。','墨睡在窗沿。「有準時。我本來準備敲得很難聽。」'])),say('release','放下房間準備的過去',()=>this.decide('c4','release',['你把空白落款的信留在桌上，沒有替它寫下任何人的名字。','房間逐漸回到原本的藍。墨落在你的肩上，你們一起向出口走去。']))]);
  }
 }
 five(id){
  if(id==='frame'){this.flag('c5_frame');this.remember('painter');return this.show('最初的畫架',[Story.memories.painter.text,'畫架背後留著修復次序：「先以藍凝止崩解，再以綠接合裂口，最後以黃照見彼此。」','墨看著空白。「原來沒有誰替我們畫好下一頁。」'])}
  const sources={yellow:['yellow','失落的金色','你曾在燈、信與花園裡見過的光。它並不屬於你，願意暫借給世界。'],blue:['blue','凝止的潮汐','潮汐裡有所有曾經被迫停下的時刻。借走一點藍，就能替修復爭取時間。'],green:['green','未完成的枝芽','一棵樹還沒被畫完，就開始伸向另一塊畫布。它的綠能接合原本分離的地方。']};
  if(sources[id]){const [color,title,desc]=sources[id];if(this.has('c5_'+color))return this.show(title,this.has('c5_woven')?'顏色已融入修補的結構，在新的地方繼續存在。':'這份顏色已在你手裡。把它帶到世界的裂口。');return this.show(title,desc,[say('borrow-'+color,'借取這份顏色',()=>{this.flag('c5_'+color);this.take(color);return this.show(title,'顏色進入你的掌心。它的來源暫時暗下來，等待你把它安放到需要的地方。')})])}
  if(id==='weave'){
   if(this.has('c5_woven'))return this.show('暫時接合的世界','裂口已經穩定，但世界的規則仍等待居民決定。先聽墨最後想說的話，再去畫架前落下最後一筆。');
   if(!this.has('c5_frame')||!['yellow','blue','green'].every(c=>this.carries(c)))return this.show('世界的裂口','需要先閱讀最初的畫架，並借齊黃、藍、綠三色。三色都在這片海上，不必回去奪走居民的光。');
   return this.show('修補的最後次序','先讓崩解停下，接合它，最後讓人們看見彼此。依畫架的說明使用三色。',[],{kind:'sequence',id:'weave',items:['黃','綠','藍'],length:3});
  }
  if(id==='ink'){
   if(!this.has('c5_woven'))return this.show('墨',['牠的羽毛在脫落。「先修好裂口。我還能記得一會兒。」','你想說別怕，卻先陪牠數了一遍漂浮的房屋。這次，換你記住數字。']);
   this.flag('c5_promise');this.remember('promise');return this.show('墨與你',[Story.memories.promise.text,'你接過一根羽毛，說出製燈人、艾菈、路恩與瑟芙的名字。墨慢慢收攏翅膀。','「你看，」牠說，「不是只有我記得了。」']);
  }
  if(id==='ending'){
   if(this.state.finished)return this.ending();
   if(!this.has('c5_promise'))return this.show('最後一筆','先修補裂口，並與墨完成你們的約定。結局應該帶著一路上聽見的故事。');
   return this.show('你將把畫筆交給誰？',['畫境暫時穩定了。你沒有辦法保證任何選擇永遠正確，但你已經知道：住在裡面的人必須有發言的位置。','墨停在畫架上，等待你的最後一筆。'],[say('restore','修補畫框，建立共同守護',()=>this.finish('restore'),'保留邊界，由居民公開檢查與修訂維持世界的規則。'),say('open','打開邊界，讓居民自由往返',()=>this.finish('open'),'建立可返回的通道，讓願意探索的人先行，留下的人也受照顧。'),say('share','把畫筆交給居民',()=>this.finish('share'),'分散改寫世界的權力，建立協商與修復被改壞之處的方法。')]);
  }
 }
 solve(input){
  if(!this.puzzle)throw Error('目前沒有等待解開的謎題。');if(this.state.chapter>=5)return Second.solve(this,input);const expandedResult=Journey.solve(this,input);if(expandedResult)return expandedResult;const p=this.puzzle;
  const answers={stars:['燈','月','星'],roads:['溪水','舊鐘','遠山'],memories:['救下烏鴉','畫境誕生','畫者離開'],weave:['藍','綠','黃'],lights:[2,3,1]};
  const answer=answers[p.id];if(!answer)throw Error('目前沒有等待解開的謎題。');
  if(p.id==='lights'){
   if(!Array.isArray(input)||input.length!==3||input.some(v=>!Number.isInteger(v)||v<0))return {ok:false,message:'份數必須是零或正整數。'};
   const total=input.reduce((a,b)=>a+b,0);
   if(total!==6)return {ok:false,message:'六份光要剛好分完：目前分出去 '+total+' 份，'+(total<6?'還差 '+(6-total)+' 份。':'多分了 '+(total-6)+' 份。')};
   if(input.some((v,i)=>v!==answer[i])){
    const labels=['育苗燈','住屋燈','路燈'];
    const notes=input.map((v,i)=>v===answer[i]?null:labels[i]+(v>answer[i]?'多了 '+(v-answer[i])+' 份':'少了 '+(answer[i]-v)+' 份')).filter(Boolean);
    return {ok:false,message:'還沒安放好：'+notes.join('，')+'。'};
   }
  } else {
   if(!Array.isArray(input)||input.length!==answer.length)return {ok:false,message:'還需要選滿三項，才能送出。'};
   const matched=input.filter((v,i)=>v===answer[i]).length;
   if(matched<answer.length)return {ok:false,message:matched===0?'沒有一項接上。墨說：「先看看手記裡的次序，猜錯沒關係，線索還在。」':'有 '+matched+' 項已經接上了，其餘的再排排看。'};
  }
  const flag={stars:'c1_tuned',roads:'c2_path',lights:'c3_balanced',memories:'c4_order',weave:'c5_woven'}[p.id];this.flag(flag);
  if(p.id==='memories')this.use('blue');if(p.id==='weave')this.state.pigments=[];
  const texts={stars:['星鐘開始回應','燈、月、星依次亮起。再靠近失速的星辰，與居民決定小鎮的未來。'],roads:['路終於有了方向','麥穗往兩旁退開。遠行者的營火已能抵達，去聽聽艾菈的說法。'],lights:['六份光，各得其所','育苗、住屋與道路重新亮起。維持生活不必拿走孩子的記憶；聽過孩子與藏雨烏鴉的故事後，再回來討論長夏。'],memories:['底稿與表面分開了','你把鏡中的藍歸還。房間不再替過去改寫次序。墨正在窗外等你。'],weave:['世界暫時接合','三色融入裂口，沒有消失，只是換了一個位置。海面終於平靜下來。去陪墨說完最後一段話。']}[p.id];
  return {ok:true,view:this.show(texts[0],texts[1])};
 }
 finish(value){this.state.choices.c5=value;this.state.finished=true;this.flag('c5_done');return this.ending()}
 startSecond(){if(this.state.chapter!==4||!this.state.finished||!this.state.choices.c5)throw Error('先完成第一部，再從結局繼續遠行。');this.state.chapter=5;this.state.contentVersion=3;this.state.finished=false;this.state.region=0;this.state.pigments=[];this.state.position={x:50,y:84};return this.intro()}
 ending(){if(this.state.chapter>=5)return Second.ending(this);const c=this.state.choices;const titles={restore:'結局 · 有窗的畫框',open:'結局 · 往返之岸',share:'結局 · 眾人的筆觸'};const opening={restore:'你修補畫框，並在每個畫境留下可以打開的議事窗。邊界仍在，卻不再只有一個高處的人決定世界如何運作。',open:'你在畫框上開出第一道可往返的門。有人踏出去，有人選擇留下；回家的路被仔細標記，未知沒有被假裝成安全。',share:'你把畫筆分給願意參與的居民。第一天，他們就為天空的顏色爭論。你們先約定：改動會影響別人的地方，要一起商量，也要能修回來。'};
  return this.show(titles[c.c5],Journey.ending(this,[opening[c.c5],c.c1==='dawn'?'迴星鎮有了第二個早晨。索恩在鐘樓下學著修一張普通的椅子。':'迴星鎮還在星夜裡，但每次循環的代價都公開記錄。亞恩加入了決定下一個明天的集會。',c.c2==='letter'?'製燈人收到艾菈的信。他沒有等到歸期，卻不再把沉默誤認成她的意願。':'麥原兩端的路標仍然清晰。艾菈沿著自己選擇的路回去探望，也再次自由離開。',c.c3==='seasons'?'日葵庭第一次入冬。瑟芙向老居民學習護根，路恩知道明年還可能再開花。':'日葵庭有幾天不再明亮。居民學著接受有人拒絕，並反覆修改輪值制度。',c.c4==='rest'?'藍色房間仍提供歇腳的地方。門旁添了一面鐘，窗戶永遠留一條縫。':'藍色房間不再替住客安排過去。桌上那封沒有落款的信，終於只是一張紙。','墨落在你的肩上。「今天有幾個人？」牠問。你開始數，牠安靜地聽。','畫布還沒有乾。這一次，未完成也可以是一種希望。']),[say('continue-second','繼續遠行 · 前往赤赭鹽市',()=>this.startSecond()),say('epilogue-close','留在畫境，翻閱旅人手記',()=>null)],{kind:'ending',id:c.c5});
 }
 objective(){if(this.goal)return this.goal.text;const f=k=>this.has(k),c=this.state.choices;
 switch(this.state.chapter){case 0:if(c.c1)return '看看製燈人的回應，再前往麥田小徑。';if(!f('c1_letter'))return f('c1_yellow')?'用黃色照亮褪色的信。':'向製燈人借一點黃色。';if(!f('c1_keeper'))return f('c1_blue')?'用藍色穿過裂縫，見守夜人。':'向靜藍井借藍，前往鐘樓。';return f('c1_tuned')?'回到星辰，決定小鎮的未來。':'依信的提示喚醒星鐘。';
 case 1:if(c.c2)return '穿過花園邊界。';if(!f('c2_feather'))return '尋找沾泥的羽毛，查明路記。';return f('c2_path')?'前往營火，聽艾菈的故事。':'依羽毛裡的路記穿過岔路。';
 case 2:if(c.c3)return '看看守庭人的回應，再推開藍色門。';if(!f('c3_ledger'))return '閱讀光的帳簿，查明真正需求。';if(!f('c3_light'))return '將蓄光池的六份光導入分光器。';if(!f('c3_balanced'))return '在三座分光燈分配六份光。';if(!f('c3_child')||!f('c3_rain'))return '聽孩子與藏雨烏鴉的故事。';return '回分光燈，與居民決定長夏的未來。';
 case 3:if(c.c4)return '通過有了把手的門。';if(!f('c4_draft'))return '看看床下藏了什麼底稿。';if(!f('c4_blue'))return '借取鏡中的藍，凝止假象。';if(!f('c4_order'))return '排列重疊三幅畫的真正次序。';return f('c4_name')?'走向出口，決定如何告別。':'去窗邊，回答墨的敲擊。';
 case 4:if(this.state.finished)return '五章已完成。記得下載你的旅程存檔。';if(!f('c5_frame'))return '閱讀最初的畫架。';if(!f('c5_woven'))return ['yellow','blue','green'].every(x=>this.carries(x))?'依次使用三色，修補世界裂口。':'向海上的光、潮汐與枝芽借齊三色。';return f('c5_promise')?'落下最後一筆。':'陪墨完成輪流記住的約定。';}
 }
}
root.NightGame=Game;if(typeof module!=='undefined')module.exports=Game;
})(typeof globalThis!=='undefined'?globalThis:this);




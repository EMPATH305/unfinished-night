/* Chapter expansion: events, preparation puzzles, aftermaths and cross-chapter echoes.
 * The original engine remains responsible for the five core puzzles and decisions.
 * No browser dependency: this module is also exercised by progression tests.
 */
(function(root){'use strict';
const option=(id,label,run,detail)=>({id,label,run,detail});
const done=(g,flag,memory,title,text)=>{g.flag(flag);if(memory)g.remember(memory);return g.show(title,text)};
const regions=[
 [{name:'鎮街與星鐘',ids:['lamp','letter','square','star']},{name:'河岸與鐘樓',ids:['well','keeper','workshop','gate']}],
 [{name:'麥浪岔口',ids:['traveler','sign','feather','brook','path']},{name:'遠行者的岸',ids:['markers','daughter','post','gate']}],
 [{name:'長夏庭院',ids:['gardener','child','archive','cistern']},{name:'背光的花圃',ids:['lamps','crow','board','seedlings','gate']}],
 [{name:'房間的表面',ids:['desk','bed','mirror','bag']},{name:'窗外與底稿',ids:['wall','window','clock','door']}],
 [{name:'漂流的畫布',ids:['frame','yellow','blue','green','weave']},{name:'尚未命名的岸',ids:['ink','council','ferry','ending']}]
];
const extraNodes=[
 [['square','名字廣場',30,50,'≡'],['workshop','河岸工坊',65,60,'⌘']],
 [['markers','倒下的路樁',30,50,'⌘'],['post','回信站',65,60,'≡']],
 [['board','輪值看板',30,50,'≡'],['seedlings','育苗棚',65,60,'⌁']],
 [['bag','旅人的行李',30,50,'◇'],['clock','門邊的鐘',65,60,'⌘']],
 [['council','漂流信站',30,50,'≡'],['ferry','無主的渡船',65,60,'⌘']]
];
const memories={
roll:{chapter:0,title:'一張還記得手勢的名冊',text:'瑪拉忘了母親的名字，卻記得她分麵包的手勢。名字廣場上，刮痕不是少數個人的健忘：每次循環都在拿走一些聯繫。記錄由居民共同保管，不由修復者獨自決定誰值得留下。'},
repairs:{chapter:0,title:'黎明以前也要照顧屋簷',text:'工坊的準備清單：木梁撐住屋簷、繩索固定橋面、遮光燈標出集合點。無論延續星夜或迎接黎明，具體的照護都不能省略。'},
town_after:{chapter:0,title:'第一場有異議的集會',text:'守夜人第一次坐在人群中。居民沒有一致同意未來，但同意留下異議、公開每次修補的代價。瑪拉在名冊邊畫了一雙分麵包的手，等名字回來之前，也先承認她曾經存在。'},
anchors:{chapter:1,title:'讓回頭也有路可走',text:'藍泥與舊鐘金粉可相互核對，路牌的承諾與水中的理想人生不能。路樁沿著已經走過的路固定，並朝兩個方向刻記號。探索自由，需要返程的條件。'},
reply:{chapter:1,title:'一封沒有替人答應的回信',text:'艾菈與亞恩隔著麥原各自說話。消息只包含本人同意寄出的內容；思念、平安與繼續遠行能同時存在。信沒有替收信人抹去失落，也沒有替寄信人訂下歸期。'},
traveler_note:{chapter:1,title:'旅人把腳放進了泥裡',text:'沒有影子的旅人叫費恩。他等待一個不會後悔的自己太久，忘了自己的鞋原本可以弄髒。他願意走到下一根路樁，還沒有答應更遠的事。'},
compact:{chapter:2,title:'誰有權關掉長夏',text:'新約定必須同時容許退出而不失去基本照明，並每週公開光的收支。自願不是交付一次後永遠不能取回；出力最多的人也不能免於檢查。'},
seedlings:{chapter:2,title:'改變以後的第一夜',text:'制度改變後，照護仍然要做：降溫時替幼苗搭棚，輪值不足時調低非必要照明。瑟芙開始請求協助，路恩可以保留母親的雨聲，也自願幫忙看一小段夜。'},
gardener_past:{chapter:2,title:'守庭人不記得的花',text:'瑟芙曾交出女兒第一次送花的快樂。她保留了乾花，卻想不起當時的感覺。付出是真實的，但她的付出不會自動變成別人欠下的債。'},
baggage:{chapter:3,title:'修復學徒留下的空白',text:'你曾把一份修復紀錄缺失的姓名補成猜測，因為空白看起來像失職。行李裡的舊標籤提醒你：漂亮而無法證實的答案，也會遮住別人的生活。這次可以留下註記，而非編造完整。'},
clock_evidence:{chapter:3,title:'承諾、證據與此刻',text:'沒有署名的信是無法核實的承諾；床下底稿是可交叉檢查的往事；窗外的三聲敲擊來自現在願意等待你回應的同行者。三者都能引發感情，卻不是同一種證據。'},
room_after:{chapter:3,title:'帶走的不是整個房間',text:'你整理行李，只取回自己的修復手稿，讓房間替你準備的空白承諾留在桌上。休息或離開由你決定；離開的行動，使這個決定真正發生。'},
voices:{chapter:4,title:'畫框另一端的四個回答',text:'亞恩要求留下記錄與知情的權利；艾菈要求能回頭的道路；瑟芙要求維持最低限度照護；墨要求記憶能由多人分擔。沒有人把選擇全交給旅人。'},
ferry_plan:{chapter:4,title:'七塊木板的用途',text:'渡船拆下七塊可用木板：三塊補承重甲板、兩塊刻返航標記、兩塊作各地可共同抄錄的紀錄板。開放邊界之前，先確保留下與返回都不是空話。'},
shared_names:{chapter:4,title:'這次由誰數人',text:'你與墨把名字分送到四個畫境，各地各留一份，不讓某一根羽毛成為世界唯一的記憶。修改記錄必須留下原因；共同記住，也需要容許更正。'}
};
const puzzles={
 repairs:{kind:'assignment',id:'repairs',items:['遮光燈','木梁','繩索'],rows:['撐住屋簷','固定橋面','標示集合點'],answer:[1,2,0],hint:'看看材料能承受什麼，不要用會熄滅的光代替支撐。',clue:'木梁撐屋簷、繩索固定橋面、遮光燈標示集合點。'},
 anchors:{kind:'selection',id:'anchors',items:['鞋底的藍泥','羽毛上的舊鐘金粉','路牌寫著最安全','溪水映出的理想人生'],count:2,answer:[0,1],hint:'選可以在兩個地方相互核對的痕跡。',clue:'藍泥與金粉是走過路留下的物證；承諾和倒影沒有記錄實際路徑。'},
 compact:{kind:'selection',id:'compact',items:['退出後仍保有基本照明','每週公開光的收支','交付後不能撤回','付出最多的人免於檢查'],count:2,answer:[0,1],hint:'孩子說不之後還能不能生活？守庭人的付出能不能接受檢查？',clue:'留下退出後的基本照明，以及每週公開收支。永久交付或豁免檢查都不能保障同意。'},
 clock:{kind:'assignment',id:'clock',items:['此刻的同行者','無法核實的承諾','可核對的往事'],rows:['沒有署名的信','床下的底稿','窗外三次敲擊'],answer:[1,2,0],hint:'把想相信的事，和能檢查的事分開來看。',clue:'信是未核實的承諾，底稿是可核對的往事，敲窗來自此刻的同行者。'},
 ferry:{kind:'allocation',id:'ferry',items:['承重甲板','返航標記','共同紀錄板'],total:7,answer:[3,2,2],hint:'信站裡的三項需求都要有位置。先看渡船的工匠刻下的數量。',clue:'甲板需三塊，返航標記兩塊，共同紀錄板兩塊，總共七塊。'}
};
function install(Story){
 Object.assign(Story.memories,memories);
 Story.chapters.forEach((chapter,i)=>{chapter.regions=regions[i];chapter.expansionNodes=extraNodes[i];});
}
function askPuzzle(g,id,title,text){const {answer,...p}=puzzles[id];return g.show(title,text,[],p)}
function intro(g){
 if(g.state.contentVersion<2)return g.chapter.intro;
 if(g.state.chapter===0)return [
  '修復室的最後一盞燈熄滅以前，你還在替畫布上的裂痕做紀錄。筆尖碰到藍色，顏料竟沿著手指流成一條路。',
  '你跌進尚未乾透的石街。天空的星星像被誰推了一下，轉到一半，又停住了。松節油的氣味慢慢變成晚風。',
  '烏鴉站在路牌上，數到第十七扇窗時重新開始。你問牠叫什麼。牠說：「那個名字已經很久沒人叫了。」',
  '你看著牠羽毛深處混雜的顏色，試著叫牠「墨」。牠沒有反對，只提醒你別踩路邊一筆剛畫好的石階。',
  '製燈人從門口招手。每座鐘都停在十一點五十九分。你還不知道自己能修好什麼，但可以先問問這裡的人，正在失去什麼。'
 ];
 const c=g.state.choices;
 const echoes={
  1:c.c1==='dawn'?'你離開時，迴星鎮正在學習第二種天色。瑪拉給你一塊形狀不太成功的麵包，說那是第一個早晨的味道。':'星夜仍在身後緩慢轉動。亞恩交給你一截燈芯，請你找到艾菈時，先聽她說話，不要替他要求她回來。',
  2:c.c2==='letter'?'艾菈的回信剛剛飛越麥田。她將一個能收信的地點寫在你的手稿邊，然後繼續往自己的方向走。':'費恩正在替路樁補第二個箭頭。你回頭時仍然找得到營火；去路和來路，終於同時留在地面上。',
  3:c.c3==='seasons'?'離開日葵庭時，你聞到一點潮濕的泥土味。瑟芙沒有要求太陽再亮些，而是彎下腰，看看幼苗的根。':'日葵庭的觀賞燈暗了一排，住屋與路燈仍然明亮。瑟芙第一次沒有把空缺的輪值全部填成自己的名字。',
  4:c.c4==='rest'?'你按約定離開房間。手稿收好了，杯子留在桌上，窗外的墨沒有再多敲一次。':'房間依然溫暖，你仍然走出了門。你沒有替未署名的信補一個落款，而是把自己的手稿帶往海邊。'
 };
 return [echoes[g.state.chapter],...g.chapter.intro];
}
function goal(g){
 if(g.state.contentVersion<2)return null;
 const f=k=>g.has(k),c=g.state.choices;const at=(stage,node,text)=>({stage,node,text});
 switch(g.state.chapter){
 case 0:
  if(!f('c1_letter'))return at('一 · 借來的光',f('c1_yellow')?'letter':'lamp',f('c1_yellow')?'照亮褪色的信。':'和製燈人談談，借一點黃色。');
  if(!f('c1_keeper'))return at('二 · 保存的代價',f('c1_blue')?'keeper':'well','借藍穿過裂縫，聽守夜人說明。');
  if(!f('c1_roll'))return at('二 · 保存的代價','square','到名字廣場看看被磨去的生活。');
  if(!f('c1_prepared'))return at('三 · 決定之前','workshop','為居民準備屋簷、橋面與集合點。');
  if(!f('c1_assembly'))return at('三 · 決定之前','square','把證據帶回廣場，聽居民的異議。');
  if(!f('c1_tuned')||!c.c1)return at('三 · 決定之前','star','喚醒星鐘，與居民決定時間的去向。');
  if(!f('c1_after'))return at('四 · 留在街上的痕跡','square','回廣場，完成決定後的第一件事。');
  return at('四 · 留在街上的痕跡','gate','從河岸小徑前往麥原。');
 case 1:
  if(!f('c2_feather'))return at('一 · 不可靠的承諾','feather','尋找沾泥的羽毛。');
  if(!f('c2_traveler'))return at('一 · 不可靠的承諾','traveler','聽聽沒有影子的旅人為何停下。');
  if(!f('c2_brook'))return at('二 · 腳印與倒影','brook','在溪邊核對艾菈的腳印。');
  if(!f('c2_path'))return at('二 · 腳印與倒影','path','依路記穿過會移動的岔路。');
  if(!f('c2_anchors'))return at('三 · 回頭的條件','markers','用能核對的痕跡，固定雙向路樁。');
  if(!c.c2)return at('三 · 回頭的條件','daughter','去營火旁，讓艾菈決定自己的消息。');
  if(!f('c2_dispatch'))return at('四 · 收信的人','post','到回信站，聽路另一端的回答。');
  return at('四 · 收信的人','gate','從花園邊界繼續旅行。');
 case 2:
  if(!f('c3_ledger'))return at('一 · 長夏的帳單','archive','閱讀光的帳簿。');
  if(!f('c3_gardener'))return at('一 · 長夏的帳單','gardener','問守庭人，她曾經付出什麼。');
  if(!f('c3_light'))return at('二 · 光足夠，誰仍在哭','cistern','將六份光導入分光器。');
  if(!f('c3_balanced'))return at('二 · 光足夠，誰仍在哭','lamps','按實際需求分配六份光。');
  if(!f('c3_child'))return at('二 · 光足夠，誰仍在哭','child','聽孩子說完想保留的記憶。');
  if(!f('c3_rain'))return at('二 · 光足夠，誰仍在哭','crow','找到藏雨的烏鴉。');
  if(!f('c3_compact'))return at('三 · 能夠說不的約定','board','在輪值看板留下兩項必要保障。');
  if(!c.c3)return at('三 · 能夠說不的約定','lamps','回到分光燈，與居民決定長夏的未來。');
  if(!f('c3_after'))return at('四 · 改變以後的第一夜','seedlings','到育苗棚完成第一夜的照護。');
  return at('四 · 改變以後的第一夜','gate','從藍色門扉離開。');
 case 3:
  if(!f('c4_desk'))return at('一 · 太熟悉的陌生地方','desk','讀桌上沒有署名的信。');
  if(!f('c4_baggage'))return at('一 · 太熟悉的陌生地方','bag','打開自己的行李，找回修復學徒的往事。');
  if(!f('c4_draft'))return at('二 · 底稿會留下什麼','bed','查看床下的底稿。');
  if(!f('c4_blue'))return at('二 · 底稿會留下什麼','mirror','借鏡中的藍，凝止假象。');
  if(!f('c4_order'))return at('二 · 底稿會留下什麼','wall','還原三幅畫的次序。');
  if(!f('c4_name'))return at('三 · 誰正在叫你的名字','window','在窗邊聽墨說出自己的名字。');
  if(!f('c4_clock'))return at('三 · 誰正在叫你的名字','clock','區分信、底稿與敲窗的聲音。');
  if(!c.c4)return at('三 · 誰正在叫你的名字','door','決定如何告別這間房間。');
  if(!f('c4_after'))return at('四 · 真正出發的動作','bag','整理行李，取回屬於自己的手稿。');
  return at('四 · 真正出發的動作','door','推門走向空白海。');
 case 4:
  if(g.state.finished)return at('終 · 畫布仍未乾透','ending','重讀結局，或下載這一次的旅程。');
  if(!f('c5_frame'))return at('一 · 畫者沒有寫下的答案','frame','閱讀最初的畫架。');
  if(!f('c5_woven')){const color=['yellow','blue','green'].find(x=>!g.carries(x));return at('二 · 先使世界能夠呼吸',color||'weave',color?'借齊黃、藍、綠三色。':'依次使用三色，暫時接合裂口。');}
  if(!f('c5_promise'))return at('二 · 先使世界能夠呼吸','ink','和墨約定輪流記住。');
  if(!f('c5_council'))return at('三 · 聽見畫框的另一端','council','聽完四方的回答，再共同留下紀錄。');
  if(!f('c5_ferry'))return at('三 · 聽見畫框的另一端','ferry','用七塊木板準備修補、返程與記錄。');
  return at('四 · 最後一筆屬於誰','ending','帶著各方的條件，完成最後的選擇。');
 }
}
function readyToLeave(g){return g.state.contentVersion<2||g.has(['c1_after','c2_dispatch','c3_after','c4_after','c5_ferry'][g.state.chapter]);}
function event(g,id){
 if(g.state.contentVersion<2)return null;
 const f=k=>g.has(k),c=g.state.choices;const wait=(speaker,text)=>g.show(speaker,text);
 if(['gate','door'].includes(id)&&c['c'+(g.state.chapter+1)]&&!readyToLeave(g))return wait('墨在離開之前停下',goal(g).text+'「選擇不會自己長出後果。先陪他們做完眼前這件事。」');
 switch(g.state.chapter){
 case 0:
  if(id==='square'){
   if(c.c1){if(f('c1_after'))return wait('廣場上的新名冊',c.c1==='dawn'?'日光落在紙上，瑪拉慢慢辨認自己的字。她還沒找回母親的名字，但分麵包時終於不再獨自站著。':'名冊旁多了一張輪班表。下一次循環前，每戶人家會和鄰居核對一次名字，索恩也要在表上簽名。');
    return g.show('瑪拉的第一個早晨',[c.c1==='dawn'?'天亮後，麵包發酵的速度和從前不一樣。瑪拉看著塌下去的麵團，半笑半哭：「沒人教過我這個。」':'鐘聲又回到了原來的位置。瑪拉沒有假裝什麼都沒發生；她在名冊上畫了一條線，標記這次被大家知道的循環。','你們不能在一夜之間把所有失去的東西找回來。她先把筆交給你，請你寫下今天真正看見的事。'],[option('record-town','和居民一起留下第一份記錄',()=>done(g,'c1_after','town_after','名字旁的手勢',['你沒有替空白猜一個名字，而是記下「她分麵包時會先折掉最硬的邊」。瑪拉認出了那個動作。','索恩將修補鐘錘的鑰匙放到桌上。他還是害怕，但現在必須學會在害怕時回答別人的問題。','墨數完人數，把原本含在嘴裡的一枚鈕扣還給瑪拉。「你媽媽外套上的。我記不住那麼多了，你收著。」']))]);
   }
   if(!f('c1_roll'))return done(g,'c1_roll','roll','瑪拉與空白的一行',['廣場名冊上，有一行紙薄得幾乎透光。瑪拉用指腹描過那裡：「昨天還是兩個字。」','她記得母親從不把最硬的麵包邊分給孩子，卻叫不出母親的名字。旁邊的人說，每家都少了一點這樣的東西。','墨用翅膀遮住風吹來的灰。「我可以替她記一陣子。可是一整座城，不能只寄存在一隻鳥身上。」','你把名冊攤平。接下來先聽守夜人的說法，再去河岸工坊，把任何選擇都需要的照護準備好。']);
   if(!f('c1_prepared')||!f('c1_keeper'))return wait('尚未開始的集會','瑪拉說：「先別要我們決定。橋還在晃，屋簷也快撐不住。」去鐘樓了解原因，再到河岸工坊完成準備。');
   if(f('c1_assembly'))return wait('有不同聲音的廣場','麵包師想見黎明，搬不動家的老住戶想多一點時間。居民同意不再隱瞞循環的磨損，卻沒有同意把所有害怕都叫作軟弱。星鐘現在可以得到回答。');
   return g.show('索恩坐進人群裡',['「如果早晨讓橋塌了，誰負責？」一名老住戶問。瑪拉反問：「如果永遠沒有早晨，名字不見了，又是誰負責？」','索恩沒有再說「相信我」。你將信、名冊與工坊的準備清單放在同一張桌上。','你決定先把哪一個問題問清楚？'],[option('hear-fear','問留下的人需要什麼準備',()=>assembly(g,'屋子裡還有搬不動的床，也有不認得夜路的孩子。你們把工坊的集合點安排改到最近的一戶人家。')),option('hear-loss','問消失的名字如何被共同保存',()=>assembly(g,'每戶不只記自己的名字，也替鄰居抄一份。瑪拉要求把不知道的地方留白，不再用好聽的猜測填滿。'))]);
  }
  if(id==='workshop'){
   if(f('c1_prepared'))return wait('河岸工坊','木梁、繩索與遮光燈各在需要的地方。準備沒有消除全部危險，但居民終於有了能檢查的東西。回名字廣場，聽大家如何看待選擇。');
   if(!f('c1_keeper')||!f('c1_letter'))return wait('河岸工坊','工匠不肯先拆屋簷。「你得知道裂縫為什麼流動，也得聽那封信說什麼。修復不是看哪裡醜就補哪裡。」先調查信與鐘樓。');
   return askPuzzle(g,'repairs','把準備安放在真正需要的地方',['工匠只有一根木梁、一卷繩索、一盞遮光燈。木梁承重、繩索固定、燈只能指引，不能代替結構。','把三種材料分配給屋簷、橋面與集合點。這份準備對兩種時間選擇都有效。']);
  }
  if(id==='star'&&f('c1_tuned')&&!c.c1&&!f('c1_assembly'))return wait('星鐘停在你的手前','鐘聲已能轉動，但居民還沒參與。'+goal(g).text);
  break;
 case 1:
  if(id==='markers'){
   if(f('c2_anchors'))return wait('朝兩個方向刻記號的路樁','路樁上的箭頭朝向營火，也朝向來時的麥田。費恩坐在旁邊，第一次把鞋底放進溪泥裡。');
   if(!f('c2_path')||!f('c2_brook')||!f('c2_traveler'))return wait('倒下的路樁','只釘一個方向，路就會在身後消失。先聽旅人的話、在溪邊核對腳印，並穿過岔路，才知道哪一條是走過的路。');
   return askPuzzle(g,'anchors','哪些痕跡能替下一個人作證？',['費恩終於說出名字。他試過把路牌釘死，可是「最安全」三個字每晚都移到別處。','你有四項線索，選出兩項可以相互核對的物證，作為固定雙向路樁的依據。']);
  }
  if(id==='daughter'&&f('c2_path')&&!f('c2_anchors')&&!c.c2)return wait('營火已經很近','女孩的聲音穿過麥穗：「先固定來時的路。每個走到這裡的人，都應該還有回頭的機會。」請查看倒下的路樁。');
  if(id==='post'){
   if(!c.c2)return wait('尚未封口的信袋','送信的烏鴉不肯替女孩寫話。先到營火，讓艾菈決定她願意寄出的內容。');
   if(f('c2_dispatch'))return wait('兩端的回聲',c.c2==='letter'?'亞恩的回信被艾菈收在靠近心口的口袋。她仍要遠行，卻不必再用完全消失來證明自己自由。':'一根路樁上刻著亞恩的燈，另一根刻著艾菈的火。兩個方向都有人維護，不必由任何一方永遠走完全部距離。');
   return g.show('回信站的兩把椅子',[c.c2==='letter'?'墨的同伴帶回一張折得很小的紙。亞恩寫道：「我很想你，也有一點生氣。我會學著分清楚，那不是你欠我的歸期。」':'亞恩沿著你們留下的路標寄來修燈用的金屬片。「拿去加固路樁吧。我想她，也希望她回頭時找得到路。」','艾菈讀完沒有立刻笑。「他以前很少說自己生氣。」她翻到紙背，開始寫下一個能收信的地點。','費恩問還有沒有多一張紙。他不承諾走到花園，只願意先替下一根路樁描清箭頭。'],[option('deliver','把本人同意的消息送往兩端',()=>done(g,'c2_dispatch','reply','回覆終於完成',['你核對寄信人的名字與願意分享的位置，沒有把旁聽到的猶豫一併塞進信袋。','艾菈向費恩道謝，因為他願意替還沒看見的人留下路。墨看了看那雙沾泥的鞋，沒再挖苦他。','麥原依然會長出新岔路，但這條路的兩端，開始有人彼此回答。']))]);
  }
  break;
 case 2:
  if(id==='gardener'&&!c.c3&&!f('c3_gardener_story')){g.flag('c3_gardener');return done(g,'c3_gardener_story','gardener_past','瑟芙保存的一朵乾花',['瑟芙從帳簿裡取出一朵乾花。「我女兒第一次送我的。我知道應該很快樂，可是那種感覺已經交出去了。」','她望向不肯交瓶子的孩子。「如果我都付出了，他為什麼不行？」','墨沒有碰那朵花。「因為妳的失去是真的。可那不表示下一個人也必須失去，才能證明妳值得。」','瑟芙把乾花放回帳簿，還沒有被說服。但她同意先算清楚，維持生活究竟要多少光。']);}
  if(id==='board'){
   if(f('c3_compact'))return wait('能撤回的名字','看板沒有自動使每個人都同意，但每個人都知道如何拒絕、如何檢查記錄。長夏是否繼續，可以回到分光燈前討論。');
   if(!f('c3_balanced')||!f('c3_child')||!f('c3_rain')||!f('c3_gardener'))return wait('被改了很多次的輪值表','光的分配、孩子的瓶子、烏鴉藏的雨與瑟芙交出的花，都是約定要面對的事。先完成這些調查，再來修訂看板。');
   return askPuzzle(g,'compact','留下能夠說不的條件',['瑟芙同意討論新制度。路恩卻問：「如果我不同意，回家的路還會有燈嗎？」','藏雨的烏鴉追問：「如果把記憶交出去後想拿回來，你們會記錄這次改動嗎？」','從四條草案選出兩項必要保障。這些保障適用於恢復四季，也適用於自願維持長夏。']);
  }
  if(id==='lamps'&&f('c3_balanced')&&!c.c3&&!f('c3_compact'))return wait('光亮起以後','光已足夠，但制度還沒有讓拒絕的人安心。'+goal(g).text);
  if(id==='seedlings'){
   if(!c.c3)return wait('等待安排的幼苗','棚裡有來自不同季節的種子。老園丁說，先讓居民決定要面對怎樣的季節，再做相應的照護。');
   if(f('c3_after'))return wait('幼苗旁的椅子',c.c3==='seasons'?'棚頂開始凝結露水。瑟芙記下溫度，請老園丁教她看根部，而不是只看花有沒有開。':'輪值缺了一班，路燈卻沒有熄滅。居民調低觀賞燈的亮度，容許夏天短暫休息。');
   return g.show('改變以後的第一夜',[c.c3==='seasons'?'第一陣冷風到來，幾株幼苗垂下葉子。瑟芙握著燈，幾乎想把舊管線接回去。「如果花死了呢？」':'有人撤回了自己的輪值，觀賞花圃開始暗下來。瑟芙下意識想補上自己的名字，卻發現自己已想不起還能交出哪段快樂。','路恩抱著雨聲的瓶子來到棚口。「我可以幫忙看一會兒。不是因為我欠大家。」','你們今晚先做哪件具體的事？'],[option('care','和居民完成眼前的照護',()=>done(g,'c3_after','seedlings','一小段可以交班的夜',[c.c3==='seasons'?'你們用舊遮布搭出護苗棚，將必要的光留給最怕冷的苗。老園丁指出有一株應該休眠，不能因為害怕就一直催它開花。':'你們調低非必要的觀賞照明，確認住屋、路燈與育苗燈仍足夠。瑟芙把自己的名字擦掉，接受別人接班。','路恩把瓶子放在窗臺，讓雨聲陪著幼苗。他母親的記憶仍然屬於他，而他也能選擇讓別人靠近一點。']))]);
  }
  break;
 case 3:
  if(id==='bag'){
   if(c.c4){if(f('c4_after'))return wait('已經收好的行李','修復手稿回到你身邊。桌上那封沒有署名的信還在，你沒有把它塞進行李充當未來的保證。門外的墨正等你。');
    return g.show('出發之前，要帶走什麼？',[c.c4==='rest'?'你按約定休息了一晚。醒來後，房間沒有替你把杯子重新加熱，窗外的墨打了個很不體面的呵欠。':'你沒有等房間變得難看才離開。它依然溫暖，只是不再替你決定明天。','行李裡的修復手稿是真的，桌上那封會變字的信則沒有可核實的寄信人。你把兩者分開。'],[option('pack','收起自己的手稿，留下未署名的承諾',()=>done(g,'c4_after','room_after','門把在你的掌心裡',['你在手稿空白處寫下：「未知，等待更多證據。」這次，空白沒有讓你覺得自己失職。','墨看見你走到門邊，才終於飛下窗沿。你不必帶走整間房間，才能承認曾在這裡被安慰。']))]);
   }
   if(f('c4_baggage'))return wait('標籤上的註記',f('c4_margin')?'你在猜測的姓名旁保留更正註記，說明為何暫時不能確定。未來的人能看見你改過什麼。':'你保留姓名的空白，另記下可核實的物件和日期。暫時不知道，也能是一份誠實的紀錄。');
   return g.show('那一次，你補上了誰的名字？',['行李裡躺著修復室的舊標籤。你曾把缺失的姓名補成最像的答案，老師稱讚記錄整齊，你卻一直記得那只是猜測。','房間把標籤變得潔白，像是只要沒人看出來，那次改動就不曾發生。','墨隔窗問：「這次要怎麼寫？」'],[option('margin','保留更正註記與不確定的原因',()=>{g.flag('c4_margin');return done(g,'c4_baggage','baggage','留下一條可追查的痕跡','你劃掉猜測，保留改動的日期和原因。後來的人可以繼續查，而不是只能相信你的字跡。')}),option('blank','讓姓名暫時留白，記下可核實的事',()=>done(g,'c4_baggage','baggage','一個誠實的空格','你留下空白，另記物件的位置與日期。缺少答案的地方，開始容得下尚未到來的證據。'))]);
  }
  if(id==='clock'){
   if(f('c4_clock'))return wait('開始走動的鐘','指針不再隨信上的承諾倒轉。門外沒有保證一切會好，但有人正在等你自己的回答。');
   if(!f('c4_desk')||!f('c4_baggage')||!f('c4_name'))return wait('門邊的鐘','鐘把信上的承諾、床下的往事與窗外的聲音混成同一刻。先讀信、查看自己的行李，並聽完墨的故事。');
   return askPuzzle(g,'clock','它們讓你感動，但能證明同一件事嗎？',['鐘面有三個位置。你要把沒有署名的信、床下的底稿與窗外的敲擊，放在各自能支持的事情上。','這不是選擇哪一份感情比較重要，而是辨認：哪個是承諾，哪個可查證，哪個正在此刻發生。']);
  }
  if(id==='door'&&!c.c4&&f('c4_name')&&!f('c4_clock'))return wait('門旁還有一面鐘','門已經出現，但你還沒分清房間給你的聲音。'+goal(g).text);
  break;
 case 4:
  if(id==='council')return council(g);
  if(id==='ferry'){
   if(f('c5_ferry'))return wait('能載人回來的船','甲板已能承重，岸邊有返程標記，各地也有可以共同抄錄的板子。船還沒決定駛向哪裡，但不再只能單向離開。');
   if(!f('c5_council'))return wait('無主的渡船','渡船拆下七塊可用木板。工匠留的刻字說：甲板三塊、返航標記兩塊、共同紀錄兩塊。先聽各方為何需要它們，再動手分配。');
   return askPuzzle(g,'ferry','在開放之前，先讓返回成為可能',['居民提供七塊木板。承重甲板需三塊，返航標記需兩塊，共同紀錄板需兩塊。無論最後保留、打開或共同改寫畫框，這三項準備都不能省略。','光可以照亮一艘船，卻不能代替能站人的甲板。請將木板分配到需要的地方。']);
  }
  if(id==='ending'&&f('c5_promise')&&!g.state.finished&&!f('c5_ferry'))return wait('畫筆還沒有交到你手上','你已經能改動世界，但還沒有聽完住在裡面的人。'+goal(g).text);
  break;
 }
 return null;
}
function assembly(g,text){return done(g,'c1_assembly',null,'沒有被要求一致同意的居民',[text,'大家同意先公開代價，也留下反對的聲音。索恩不再握著唯一的鑰匙。','現在前往星鐘，完成時間的選擇。決定之後，請回到廣場看看今天會怎麼過。']);}
function council(g){
 if(!g.has('c5_promise'))return g.show('漂流信站','空白海上的信仍在漂流。先修補裂口，和墨約定輪流記住，才能讓不同畫境的聲音在這裡相遇。');
 const c=g.state.choices;
 const voices=[
 ['town','亞恩與索恩',c.c1==='dawn'?'「第二個早晨來了，我還不會做所有事。」亞恩寫道。索恩加了一行：請保留公開更正修補記錄的方法，不要讓我們又把害怕藏在鐘樓裡。':'亞恩寫道：「我們暫時留下，但沒有把下一次選擇交出去。」索恩同意每輪公開磨損，並讓居民能重新討論循環。'],
 ['road','艾菈與費恩',c.c2==='letter'?'艾菈把亞恩的回信夾在信裡。「我需要能自己決定什麼時候回答，也需要回答能抵達。」費恩補上路樁的位置。':'艾菈寄來雙向路標的拓印。「不要只畫出去的門。回頭也必須有路。」費恩已經替第二根路樁描完箭頭。'],
 ['garden','瑟芙與路恩',c.c3==='seasons'?'「幼苗不是每天都開花。」瑟芙的字比從前慢。她要求把最低限度的照護留給最脆弱的地方，不能拿未來的宏願換掉今晚的住屋燈。':'瑟芙把缺班的輪值表一併寄來，不再只展示滿格的日子。路恩寫道：拒絕以後，我還是有燈回家。這條請留下。'],
 ['crow','墨的同伴們','四根羽毛落到桌上。拾遺者要求每份記錄至少有另一處抄本，並標出更正的原因。「我們願意幫忙記，但請不要再把唯一的一份都放在我們身上。」']
 ];
 const pending=voices.filter(([id])=>!g.has('c5_voice_'+id));
 if(g.has('c5_council'))return g.show('四方留下的條件',['紀錄、返回、照護、共同記憶。它們沒有替世界選定一種未來，卻約束了任何未來都不能省略的責任。','去看看無主的渡船，把七塊木板安放到能實際承擔這些責任的地方。']);
 const options=pending.map(([id,name,text])=>option('voice-'+id,'聽 '+name+' 的回答',()=>{g.flag('c5_voice_'+id);return g.show(name,[text,'墨將這段話抄到另一塊浮木上。「再回信站聽下一個。我們不要只收集同意自己的聲音。」'],[option('return-council','繼續聽其他人的回答',()=>council(g))]);}));
 if(!pending.length)options.push(option('council-agree','共同保留四方的條件與更正方法',()=>{g.remember('shared_names');return done(g,'c5_council','voices','畫筆旁有了四張椅子',['你把四項條件放在畫架旁，沒有把其中一項寫成所有人的答案。','墨請同伴各帶一份抄本回去。你也留下自己的名字，讓未來的人知道這一筆曾由誰參與。','渡船還有七塊木板。現在去讓這些話真正承得住人的重量。']);}));
 return g.show('漂流信站 · '+(4-pending.length)+' / 4',['信沒有要求你替所有人選一個最漂亮的答案。每封信只堅持一件很具體的事。','選擇一方聽取回覆；聽完四方後，才能整理共同的條件。'],options);
}
function solve(g,input){
 const p=g.puzzle,def=p&&puzzles[p.id];if(!def)return null;
 if(!Array.isArray(input)||input.length!==def.answer.length||input.some(v=>!Number.isInteger(v)||v<0))return {ok:false,message:'請完成每一項，再交給墨核對。'};
 let values=[...input];if(def.kind==='selection'){if(new Set(values).size!==values.length)return {ok:false,message:'同一項線索不能算兩次。'};values.sort((a,b)=>a-b);}
 if(def.kind==='allocation'&&values.reduce((a,b)=>a+b,0)!==def.total)return {ok:false,message:'只有七塊可用木板，請剛好分完；不用削減任何必要用途。'};
 if(values.some((v,i)=>v!==def.answer[i]))return {ok:false,message:def.kind==='allocation'?'分配還沒符合船上的刻記。再核對甲板、返航與紀錄各需要多少。':'有些安排還沒有證據支持。可以再讀一次線索；材料和記憶都還在。'};
 const outcomes={
 repairs:['c1_prepared','repairs','準備不是一個保證',['木梁撐住了屋簷，繩索固定了橋面，遮光燈標出集合點。工匠把使用的材料寫進公開清單。','瑪拉帶著麵包來到河岸。「至少這次，我們知道你做了什麼。」回到名字廣場，讓大家一起討論。']],
 anchors:['c2_anchors','anchors','雙向的路開始存在',['你以藍泥與金粉核對位置，沒有把「最安全」當成證據。每根路樁都刻上來路與去路。','費恩捲起褲管，走到下一根路樁旁。他的影子很淡，但已經落在自己的腳邊。艾菈的營火現在能安心抵達。']],
 compact:['c3_compact','compact','拒絕不再等於失去生活',['看板留下兩條可檢查的保障：退出後仍有基本照明，每週公開收支。撤回也必須留下記錄，避免有人偷偷替別人改名字。','瑟芙簽在大家旁邊，沒有把自己的名字放在檢查之外。回到分光燈，討論季節真正要怎麼走。']],
 clock:['c4_clock','clock_evidence','鐘開始數眼前的時間',['你沒有因為一封信很動人，就讓它代替可查證的往事；也沒有因為過去很重要，就聽不見此刻的敲門聲。','指針往前走了一格。出口仍然是你自己的選擇，而不是房間替你安排好的結論。']],
 ferry:['c5_ferry','ferry_plan','能讓人站上去的約定',['三塊木板補好甲板，兩塊刻出返航標記，兩塊成為各地共同抄錄的紀錄板。','墨先跳到船沿，又回頭看你。「這次，我知道我們要怎麼回來。」現在走向最後一筆，完成世界的選擇。']]
 };
 const [flag,memory,title,text]=outcomes[p.id];if(p.id==='anchors')g.remember('traveler_note');return {ok:true,view:done(g,flag,memory,title,text)};
}
function ending(g,text){if(g.state.contentVersion<2)return text;const result=[...text];result.splice(result.length-1,0,g.has('c4_margin')?'你的更正註記也留在共同紀錄裡。多年以後，有人沿著那條註記找到新的證據，能繼續修改你的答案。':'你的修復手稿仍有空白。後來的人在旁邊補上新證據，沒有因此刪掉你當時承認不知道的那一行。','費恩維護著麥原的一根路樁；瑪拉將母親分麵包的手勢教給下一個人。世界沒有被一次修好，卻開始容得下更多接手的人。');return result;}
root.NightJourney={install,regions,extraNodes,intro,goal,event,solve,readyToLeave,ending};if(typeof module!=='undefined')module.exports=root.NightJourney;
})(typeof globalThis!=='undefined'?globalThis:this);

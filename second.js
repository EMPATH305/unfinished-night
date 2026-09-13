/* Playable second part. Pure data and state transitions, shared by browser and tests. */
(function(root){'use strict';
const option=(id,label,run,detail)=>({id,label,run,detail});
const regions=[
 {title:'赤赭鹽市',subtitle:'名字不能替人站一輩子',roman:'VI',image:'salt.jpg',question:'答應以前，是否真的有拒絕的路？',line:'先別擦掉名字。也許那是他唯一留下的證據。',
 areas:['垂布階與不稱巷','還色渠與承重門'],labels:['廚灶的借色燈','米珂的水碗','兩面的代名牌','門背的銅扣','並排的證據','還色渠工坊','十三槽信匣','缺水第九日','未完成的貨樣','鐘路渡口'],color:'yellow',sourceName:'共用廚灶的燈',
 intro:['第五章留下的渡口沒有替你選定終點。第一艘載鹽的小船靠岸，船工請你先讀運單背面的返程安排。','赤赭色的城沿海堆起。水由上城搬下，鹽由下城搬上，兩支隊伍在同一道石階錯身。','墨停在一面寫滿名字的牆前。「這些人去哪裡了？」攤販指向正在抬水的人：「都還在。」','還色渠的綠即將到期。保證行願意替十三戶續借，交換他們領水與簽工的代理權。米珂問你，可不可以先替他看一張牌。'],
 witness:['米珂把水碗放到窗沿。「印是我自己按的。那天水票被退回，孩子還在等。」','他容許你核對代名牌，不願公開孩子的事情。墨沒有替他擴大這份同意。','「如果能拿回名字，我也許還會用。母親喊過。」你先把允許查證的範圍寫在手記。'],
 source:['廚灶願意短借一點黃，讓修工看清還色渠的新裂口。借出以後，爐火仍熱，切菜的刀緣卻不再清楚。','廚工先收起刀具，改做不需切割的備餐。她請你完成檢查就歸還；這不是可以帶往遠方的禮物。'],
 records:[
 ['兩面的代名牌','米珂的指印與蘇芮的早期拓本吻合，背面的期限卻被新漆覆過。水票簿記下同日的退件。','已知：條款版本不同，簽約同日失去水票。未知：管事是否預先策劃。公開範圍僅含契約與去識別日期，不含孩子的私事。'],
 ['承重門背的銅扣','銅扣磨平的一側承受過拉力，救濟冊記錄三條街的人沿改道生還。缺頁隊冊只寫一人未返。','已知：開門曾救人。未知：銅扣主人與索恩老師的去向。墨沒有可以補出事故結尾的記憶。'],
 ['十三槽的舊信匣','白鹽與纖維可與部分舊信的包裝比對，運費簿顯示這間郵運間曾轉送信匣。寄件欄沒有名字。','已知：此處是可追查的轉運站。未知：寄件人、收件人與十三圈的含義。保持信封完整，先查公共運輸紀錄。']
 ],
 inquiry:{kind:'assignment',id:'salt_evidence',rows:['代名牌與早期拓本','銅扣、改道圖與救濟冊','信匣、包裝與運費簿'],items:['可追查轉運，不能確認寄件人','證明救援，不能確認失蹤者去向','證明條款更改，不足以推定策劃者','證明持有人完全自由同意'],answer:[2,1,0],hint:'將每份物件能支持的結論，和你希望知道的事分開。',clue:'代名牌支持條款更改；門與冊支持救援；信匣支持轉運。三者都不能替缺席者補完動機。'},
 work:['赫妲把借色來源與蓄水槽畫在同一張紙上：「綠要還給根岸，槽也不能立刻垮。」','工坊只剩六根可用木料。舊槽有兩個缺口，每處都要一對支柱；臨時引渠兩端各需一根固定。新牌樓可以延後。','你借來的黃照出裂口，赫妲願意在木撐立好後承接值班。先把有限材料分到必要之處。'],
 repair:{kind:'allocation',id:'salt_support',items:['蓄水槽木撐','引渠固定','新牌樓'],total:6,unit:'根木料',answer:[4,2,0],hint:'槽有兩處缺口，各要一對。另兩根留給引渠兩端。',clue:'槽的木撐四根，引渠兩根，新牌樓零根。六根不能多，也不能把裝飾當支撐。'},
 council:['木撐立好，借來的黃已回到廚灶。十三戶暫時不必用名字續借，仍要決定怎麼度過接下來的缺水期。','赫妲提供共同供水與輪值，但要公開工時；汀禾確認外港床位、照護與返程後，才提出自願渡送。蘇芮保留原契，由當事人決定公開範圍。','米珂不讓你替十三戶簽名。你能承擔的是先協助哪一項工作，讓兩種選項都能由居民自行選擇。'],
 choices:[['commons','先完成共同供水輪值','你與赫妲把水票和輪值分開，不出工的病人仍保有飲水。工坊先停建牌樓，騰出修槽的人。','供水維持了。有人抱怨少了一天收入，赫妲把這筆損失寫入下次分攤，不再稱它為大家應該付出。'],['passage','先落實自願渡送與返程','汀禾逐戶核對接收地址與照護需求，留下的人仍能領水。渡送由共同基金先付，沒有收走代名牌。','第一批家庭自行選擇上船，米珂這次留下。蘇芮把返程地址交還本人，沒有掛到公牆上。']],
 afterAction:'把支出與撤回窗口留在公用桌上',
 witnessAfter:['「我沒有把名字換掉。」米珂說，「今天有人叫我，我先問了他有什麼事。」','牆上的舊字暫時保留作證，代理權另以撤回紀錄解除。生活還很緊，至少下一次簽字前有地方詢問。'],
 history:['原畫者伊蕾・瑟岱畫了許多出口。她以為能離桌，就是自由。','未完稿《兩隻離開天平的手》裡，一隻手仍壓著水票。她留下半句「出口之外，還須……」，去尋找不用負債也能生活的安排。','草圖不能證明她後來去了哪裡。居民替出口添上供水與住處，也是在繼續作畫。'],
 leave:'核對兩端路況，前往雪鈴城'},
 {title:'雪鈴城',subtitle:'第二扇窗還沒有關',roman:'VII',image:'snow.jpg',question:'沒有說謊，是否就能看見整件事情？',line:'沒有回答的鐘，也不能替人定罪。',
 areas:['雙窗聽證所','低鐘階與暫疑廊'],labels:['裂梁的凝止索','安妲的毛線','窗位圖與舊椅','空場的鐘梁','分開三份紀錄','修鐘人的桌','逾期的更正件','兩份北門證詞','第二扇窗草圖','近岸轉運站'],color:'blue',sourceName:'維持備用鐘梁的藍',
 intro:['鹽市的渡口把返程地址留給每一戶，沒有把他們的名字交給船。你沿鐘路抵達一座建在回聲兩側的城。','上城的雪正在融化，下城的階梯仍結著冰。兩個人都說起今天的天氣，沒有一個人說謊。','安妲說北門整夜封著，運貨人達澄卻看見六袋貨從北門出去。兩人的話都引起見證鐘尾音。','芙岑把一截拆下的鐘梁放在桌上。沒有人陳述，它自己輕輕響了一聲。'],
 witness:['安妲拆著毛衣：「第一次，我說門關著。第三次，我說從我的窗看去，那道門關著。他們覺得我愈來愈退縮。」','她願意指出窗位，不願再反覆描述失去家人的那一夜。達澄同意在現場標出搬貨人的方向。','墨說：「把看不見的地方還回去，不等於收回看見的事。」先記位置，暫不決定誰錯了。'],
 source:['芮衡以藍凝住備用鐘梁的裂口。芙岑先架木楔卸去重量，才同意讓你短借藍，固定檢查桌上的活動接頭。','借出後，備用鐘必須停敲並有人看守。藍能凝止材料，不能凝出當年的真相。'],
 records:[
 ['兩扇窗的視線','兩份窗位圖分別朝向上層北門與下層北拱，居民都簡稱北門。舊椅的磨痕顯示座位曾被搬動。','已知：安妲與達澄可能指向不同的門。未知：袋內物品與最終收貨者。消除語詞歧義不能直接結案。'],
 ['無人說話的尾音','空場記錄與拆下鐘梁的震動相互對照：沒有證人時也會留下尾音，且節奏與上一場相似。','已知：這座鐘的部分響聲不是當下證詞引起。未知：所有鐘是否相同、每份舊判決是否錯誤。停止用響與不響判定人。'],
 ['被排除的更正','信封收件章的裂口與值班簿對得上，更正件在封簿之前已送達，後來卻標成逾期。正文只修正燈滅時點。','已知：程序排除了準時的更正。未知：誰首先下令。寄件人不願公開全文，可先使用去識別的日期證據。']
 ],
 inquiry:{kind:'assignment',id:'snow_evidence',rows:['兩人各自指出不同門口','無人握索仍有回響','收件章早於封簿日'],items:['更正曾準時送達，需重查程序','視角可並存，仍須追查貨物','此鐘尾音不能單獨作為判決','證明整座城的證人都在說謊'],answer:[1,2,0],hint:'空間、工具和收件程序，回答的是三個不同的問題。',clue:'不同門口支持視角並存；空場回響限制鐘的證據效力；日期支持更正準時送達。'},
 work:['芙岑用借來的藍固定接頭，請你替下城安排三項工作。修工已用木楔保住備用梁，測試完成就能還藍。','兩扇窗的可見範圍，要帶著窗位圖在現場標示；鐘的殘響，需要無人陳述時先作空場測試。','至於等待調查的居民，臨時糧票不能等判決才發。這三件事不要互相替代。'],
 repair:{kind:'assignment',id:'snow_hearing',rows:['辨認兩個北門','檢查鐘梁殘響','照顧等待的家庭'],items:['先發臨時糧票','在現場核對窗位','無人陳述時測試','要求再講一次創傷'],answer:[1,2,0],hint:'地形要現場核對，工具要空場校驗，生活不能等結案。',clue:'窗位對門口，空場對鐘梁，糧票對等待者。重述創傷不會修好鐘。'},
 council:['鐘梁已有空場標記，借藍已歸還。糧票先發給等待者，兩個北門也分別標上圖。','芮衡願意重查舊案，但封雪橋還需修工。菈汶可以帶一隊勘查者，也能先把人送到低鐘階輪流受理更正。','貨袋去向仍待查。你們先決定有限人手從哪裡開始，不把尚未查清寫成無事發生。'],
 choices:[['reopen','先重開暫疑廊的更正窗口','歐瑟先登記更正範圍與公開意願，不要求每人從頭重述。菈汶留下送件路線，行動不便者可在家收取回覆。','積案沒有一夜消失。一份更正今天有了收件副本，日期由雙方各留一份，再也不能被簡單寫成未送達。'],['fieldwork','先組成雙窗現場勘查隊','芮衡標出安全的觀察位置，菈汶帶修工與自願見證者分赴兩個門口。不能同行的人以圖和文字補述。','勘查隊找到貨袋曾在下拱轉運的痕跡，仍不知道最後由誰領走。記錄上寫著下一個要查的站，而非匆忙寫下犯人。']],
 afterAction:'留下未定事項與下一次受理日期',
 witnessAfter:['安妲戴著手套收毛線。「這次他們問我看不到哪裡，也把那一格寫下來了。」','她沒有答應再說更多。墨點頭。你們走時，普通送水鈴響了，門邊的壺有人來提。'],
 history:['涅芙・奧蘭曾把一名見證者畫到紀念畫外，後來才知道兩人站在不同橋段。改正畫作，沒有補回那人失去的工作。','《第二扇窗》留下兩個視角，通往第二扇窗的階梯卻尚未完成。居民後來修過它，也曾安排下城聽證。','鐘能讓片段被聽見，不知道世界完整的事實。被聽見以後如何核對，仍是人的工作。'],
 leave:'循沿岸轉運路，前往玻璃潮汐'},
 {title:'玻璃潮汐',subtitle:'願望仍在，航路也要在',roman:'VIII',image:'glass.jpg',question:'真心盼望，是否就能替他人承諾？',line:'他們今天要回家。先把航標的光還回去。',
 areas:['擦鏡埠與候舟坡','窄帆道與背海園'],labels:['檢查匣的凝止藍','艾汀的工屋','磨向岸邊的椅子','返岸借色簿','候景與證據','窄帆道修船臺','沒有歸期的信','定帆協約集會','未定向的帆','可以往返的岸'],color:'blue',sourceName:'工屋檢查匣的藍',
 intro:['近岸轉運船帶你離開雪線。山上的鐘聲慢慢聽不見了，船工改用旗布與繫繩告知下一個停靠點。','海中斜立的玻璃片像折起的天空。左岸工屋晾著舊帆，一個人望著水中揮手的女兒，忘了收回晾衣繩。','他叫艾汀。女兒蕾朵在遠方生活，海上卻每天映出她返家的同一刻。','維持這片候景的借色來自岸上，凝住的水面已伸進窄帆道。最後一班近岸渡船正在等待安排。'],
 witness:['「她每次揮到那裡，都會慢下來。」艾汀抬起手，又放下。','他同意你核對借色簿，也願意稍後讓你看信。他沒有同意把私人信件拿去宣傳。','墨沒有說看不見就不會痛。「我們先查，維持它用了誰的東西。」'],
 source:['寧絮從工屋檢查匣短借藍，用於修船臺上鬆動的繫泊接頭。這與維持整片候景的公共借色分開登記。','借出後，檢查匣暫停使用，未檢查的玻璃件留在架上。修船工以木夾接手後，就能歸還這一份藍。'],
 records:[
 ['轉過方向的觀潮椅','靠工屋一側的扶手磨得發亮，椅底修補記錄跨過多位使用者。鄰人說傳聞中被海帶走的人，後來搬到背海園。','已知：椅子曾朝岸轉動，並非只由一人使用。未知：每道磨痕主人。不能用警世寓言取代一個人實際的生活。'],
 ['固定明天的借色簿','展示的黃與藍分別來自航標、護岸與居民匣。部分續借只沿用舊戶主簽名，還有已送達的撤回件。','已知：部分借色授權已不成立。未知：每個觀看者是否知情。歸還前須安排承接，不能為證明傷害擅自停掉航標。'],
 ['沒有返航日期的雙頁信','艾汀出示兩頁完整的信。第一頁說蕾朵記得家裡的燈，第二頁說她留在遠方的生活。折線與轉運章吻合。','已知：信沒有答應返航，曾公開的第一頁缺少脈絡。未知：她將來是否回來。只記未承諾歸期，不抄錄未獲授權的私事。']
 ],
 inquiry:{kind:'assignment',id:'glass_evidence',rows:['觀潮椅的多次修補','借色簿與撤回件','雙頁信與轉運章'],items:['沒有返航承諾，不等於永不回來','部分續借失去授權，須安排歸還','多人使用，不能拼成一人的消失','海面已替女兒答應返鄉'],answer:[2,1,0],hint:'一件椅子不等於一生，一次同意不等於永久，一封信也不等於終身決定。',clue:'椅子支持多人使用；簿與撤回件支持重查授權；完整信只支持未承諾返航。'},
 work:['禾汐想讓渡船今天就走，烏棠提醒她鏡礁邊還有鬆片。你們先用檢查匣的藍固定繫泊接頭，再由木夾承接。','這輪有五位自願修工：兩個鬆片點各需一人守護；護岸支撐需要兩人共同抬梁。剩下一人引導近岸船。','展示架的拋光可以延後。公共借色的逐步歸還由這支隊伍接手，不把抽走凝止後的危險留給漁戶。'],
 repair:{kind:'allocation',id:'glass_route',items:['鬆片守護','護岸抬梁','近岸引航','展示拋光'],total:5,unit:'位修工',answer:[2,2,1,0],hint:'先照顧兩處鬆片和一根需要兩人抬的梁。剩下的人做什麼，船才能走？',clue:'鬆片兩人、抬梁兩人、引航一人、拋光零人。修工不會因願望而增加。'},
 council:['修工接手，檢查匣的藍已歸還。公共借色的歸還清單也交給來源戶逐筆核對，窄帆道留出安全通路。','艾汀仍會想念女兒。你們不要求他先放下，才有資格參與安排。','烏棠同意不立遮住整片海的高板；寧絮不再要求墨保存每一個候景。居民決定如何保留觀看的空間，且不占用他人的資源。'],
 choices:[['shortwatch','保留短時觀潮與自願輪值','候舟坡留下限時觀看的位置，以現有潮面自然顯現的候景為主，不再長期借用公共色。守望者提醒潮況，任何人都可離席。','艾汀今天看了一會兒，趕在值班結束前起身。候景沒有答應什麼，岸上的渡船已載人回來。'],['shorework','把展示臺改為共同修窗桌','居民先將展示臺改作普通修窗桌，保留安全望海的位置。想記下願望的人可用紙筆，不將它當成他人的承諾。','艾汀把椅子轉向桌面，只轉了一點，足夠讓筆落下。有人帶來壞窗，也有人只是來坐。']],
 afterAction:'歸檔撤回紀錄，留下可更改的安排',
 witnessAfter:['「如果看不見，還是會難過。」艾汀說。墨回答：「嗯。」','他取出一張紙：「先不要替我想她會怎麼回答。」你們把信留給他自己寫，沒有替蕾朵補上歸期。'],
 history:['賽洛・汀曾替離岸肖像附上返航小圖。後來，他發現有人把那張安慰的畫，當成孩子必須回家的承諾。','《未定向的帆》保留不同構圖，卻沒有畫出人人承擔選擇的船與糧食。他留下工屋，去問被畫的人是否願意留下自己的版本。','候景沿記憶與願望拼接，可能碰巧成真，也可能被人主動追求。它不知道缺席者將如何生活。'],
 leave:'與墨收好第二部的手記'}
];
const nodeIds=['source','witness','record_a','record_b','inquiry','workshop','record_c','council','after','gate'];
function install(Story){if(Story.chapters.length>5)return;regions.forEach((d,i)=>{const chapter=i+5,prefix='c'+(i+6);d.records.forEach((r,j)=>Story.memories[prefix+'_evidence_'+['a','b','c'][j]]={chapter,title:r[0],text:r.slice(1).join(' ')});Story.memories[prefix+'_history']={chapter,title:'畫境志 · '+d.title,text:d.history.join(' ')};Story.memories[prefix+'_aftermath']={chapter,title:'回訪 · '+d.title,text:'決定以後仍有工作。當事人的回應與本次安排記錄在這一頁。'};for(const [value,label] of d.choices)Story.choiceNames[value]=label;
Story.chapters.push({...d,nodes:nodeIds.map((id,j)=>[id,d.labels[j],50,50,['◇','○','≡','≡','⌘','⌘','≡','○','⌁','↗'][j]]),expansionNodes:[],regions:d.areas.map((name,j)=>({name,ids:nodeIds.slice(j*5,j*5+5)})),memoryIds:d.records.map((_,j)=>prefix+'_evidence_'+['a','b','c'][j])});});}
const data=g=>regions[g.state.chapter-5];
const key=g=>'c'+(g.state.chapter+1);
const has=(g,s)=>g.has(key(g)+'_'+s);
const flag=(g,s)=>g.flag(key(g)+'_'+s);
function memoryText(g,k,fallback){for(let i=0;i<regions.length;i++){const prefix='c'+(i+6);if(k===prefix+'_aftermath'){const d=regions[i],choice=d.choices.find(c=>c[0]===g.state.choices[prefix]);return choice?choice[3]+' '+d.witnessAfter.join(' '):fallback;}}return fallback;}
function goal(g){const at=(stage,node,text)=>({stage,node,text}),d=data(g);
 if(g.state.finished)return at('第二部 · 仍可重讀','gate','八章旅程已完成。可回訪本地或下載存檔。');
 if(!has(g,'witness'))return at('一 · 先問當事人','witness','聽當事人說明，確認可查證與公開的範圍。');
 for(const suffix of ['a','b','c'])if(!has(g,'evidence_'+suffix))return at('二 · 三份不完整的證據','record_'+suffix,'調查「'+d.labels[nodeIds.indexOf('record_'+suffix)]+'」，將已知與未知分開。');
 if(!has(g,'inquiry'))return at('三 · 核對推論','inquiry','將三份物證與能成立的結論配對。');
 if(!has(g,'borrowed'))return at('四 · 準備與借色','source','與來源協議短借，先安排來源處的替代工作。');
 if(!has(g,'prepared'))return at('四 · 準備與借色','workshop','用有限材料和人手完成安全準備。');
 if(!has(g,'returned'))return at('五 · 歸還再決定','source','回到借色來源，確認承接並歸還顏色。');
 if(!g.state.choices[key(g)])return at('五 · 留下可修改的安排','council','帶著證據與準備，參加居民集會。');
 if(!has(g,'after'))return at('六 · 決定後的工作','after','回到現場，完成這個安排留下的工作。');
 if(!has(g,'witness_after'))return at('六 · 再問一次當事人','witness','回訪當事人，聽見決定後的回應。');
 return at('七 · 往返之路','gate',d.leave+'。');}
function ready(g){return !!g.state.choices[key(g)]&&has(g,'after')&&has(g,'witness_after')&&has(g,'returned')&&!g.state.pigments.length;}
function puzzle(g,p,title,text){const {answer,...view}=p;return g.show(title,text,[],view);}
function event(g,id){const d=data(g),k=key(g),choice=d.choices.find(c=>c[0]===g.state.choices[k]);
 if(id==='witness'){flag(g,'witness');if(choice){flag(g,'witness_after');return g.show(d.labels[1],d.witnessAfter)}return g.show(d.labels[1],d.witness);}
 if(id.startsWith('record_')){if(!has(g,'witness'))return g.show('先詢問公開範圍','先與當事人談談，再核對這份物件。可以查證，不代表能任意公開。');const suffix=id.slice(-1),r=d.records[['a','b','c'].indexOf(suffix)];flag(g,'evidence_'+suffix);g.remember(k+'_evidence_'+suffix);return g.show(r[0],r.slice(1));}
 if(id==='inquiry'){if(!['a','b','c'].every(x=>has(g,'evidence_'+x)))return g.show('仍缺比對資料','三份物證分散在兩個區域。請先收集，再把能證明的事並排。');if(has(g,'inquiry'))return g.show('結論旁邊留下空白','已將證據的效力分開。手記仍保留未知，不用猜測把它補滿。');return puzzle(g,d.inquiry,'物證與推論', '每一列選擇它能支持的結論。你可以在手記重讀三份紀錄，也可以請墨分兩次提示。');}
 if(id==='source'){
 if(has(g,'returned'))return g.show('顏色回到來源',d.sourceName+'恢復原本的用途。借色、歸還與承接都留了紀錄，不將別人的損失當作免費。');
 if(has(g,'borrowed')){if(!has(g,'prepared'))return g.show('來源仍在等候','顏色仍用於這輪準備。先到工坊安排承接，再帶回這份色。');return g.show('承接完成，現在歸還',[d.sourceName+'等著你。修工已用實物支撐接手，你可以收回臨時使用的色。','歸還不代表所有損失自動消失。值班與停用時間也必須記下。'],[option('return-color','歸還借色，核對來源',()=>{g.use(d.color);flag(g,'returned');return g.show('來源重新開始工作','對方核對紀錄，解除暫停安排。現在可以參加集會；這次決定不會留下未說明的借色。')})]);}
 return g.show('短借之前',d.source,[option('borrow-color','同意短借與來源的暫停安排',()=>{flag(g,'borrowed');g.take(d.color);return g.show('借色已登記',d.sourceName+'暫停相應用途。請完成工坊準備，再回這裡歸還。')},'來源會暫時失去作用，不能跨章帶走。')]);}
 if(id==='workshop'){if(!has(g,'inquiry'))return g.show('修復不能先於查證','先核對三份物證。準備必須回應確實查到的需要。');if(!has(g,'borrowed'))return g.show('先安排借色來源','這項檢查需要短借顏色。先到來源，確認暫停與承接安排。');if(has(g,'prepared'))return g.show('工坊已有人承接',has(g,'returned')?'材料和人手都留了紀錄。可以前往集會。':'實物支撐已接手，請回來源歸還借色。');return puzzle(g,d.repair,'有限的準備',d.work);}
 if(id==='council'){if(!has(g,'returned'))return g.show('先完成承接與歸還','先完成調查、工坊準備，回來源歸還借色。集會不能用未處理的損失交換漂亮的決定。');if(choice)return g.show('仍能修改的安排',[choice[2],'請回現場完成工作，也再聽當事人的回應。']);return g.show('居民集會',d.council,d.choices.map(([value,label,text])=>option(value,label,()=>{g.state.choices[k]=value;flag(g,'done');return g.show('決定以後，還要留下來',[text,'到回訪地標完成工作，再向當事人確認。'])},'先承擔這項工作；居民仍保有其他選項。')));}
 if(id==='after'){g.remember(k+'_history');if(!choice)return g.show('畫境志 · '+d.title,d.history);if(has(g,'after'))return g.show('現場留下的工作',choice[3]);return g.show('回訪 · '+d.title,[choice[3],'你把未解決的問題留在紀錄旁。下一次來的人應該知道從哪裡接手。'],[option('record-aftermath',d.afterAction,()=>{flag(g,'after');g.remember(k+'_aftermath');return g.show('工作已交接','安排、未定事項與可撤回的方式都留下了。再去聽聽當事人的回應。')})]);}
 if(id==='gate'){if(!ready(g))return g.show('離開以前',[goal(g).text,'路會等。先把借來的色與未交接的工作留妥。']);if(g.state.chapter<7)return g.show('確認往返路線',[d.leave+'。渡口已核對兩端的接收與返程，不以名字抵押費用。'],[option('next',d.leave,()=>g.advance())]);if(g.state.finished)return ending(g);return g.show('今天換誰數人',['你們沒有讓每個人達成一致，也沒有找到所有失蹤者。有人能領水，有人能更正一個日期，有人等到了今天的船。','墨問你要不要再替海裡的明天找個答案。你們先數清楚岸上的人。'],[option('finish-second','收好手記，完成第二部',()=>{g.state.finished=true;return ending(g)})]);}
 throw Error('這裡沒有可用的事件。');}
function solve(g,input){const p=g.puzzle,d=data(g),spec=[d.inquiry,d.repair].find(x=>x.id===p?.id);if(!spec)throw Error('目前沒有等待核對的安排。');
 if(!Array.isArray(input)||input.length!==spec.answer.length||input.some(x=>!Number.isInteger(x)||x<0))return {ok:false,message:'每一列都需要一項完整安排。線索仍在，請慢慢核對。'};
 if(input.some((x,i)=>x!==spec.answer[i]))return {ok:false,message:spec===d.inquiry?'有些結論超出了物證能支持的範圍。重讀每份紀錄的「已知」與「未知」。':'安排還不能承接現場需要。請核對數量、工作與暫時可以延後的事。'};
 flag(g,spec===d.inquiry?'inquiry':'prepared');return {ok:true,view:g.show(spec===d.inquiry?'證據各有邊界':'準備已有人接手',spec===d.inquiry?'把未知保留在手記。接著處理借色與工坊的實際需要。':'現在回到來源歸還借色。先完成交接，再討論長期安排。')};}
function ending(g){const c=g.state.choices;return g.show('第二部結局 · 仍容得下回答的地方',[
 regions[0].choices.find(x=>x[0]===c.c6)[3],regions[1].choices.find(x=>x[0]===c.c7)[3],regions[2].choices.find(x=>x[0]===c.c8)[3],
 c.c5==='restore'?'第一部的議事窗仍在。三地的新紀錄送回窗邊，讓守護的規則接受遠方的提問。':c.c5==='open'?'第一部的往返道路多了三段路況。新的箭頭旁，寫著接收者同意公開的地址。':'第一部交出的畫筆多了三份修訂。不同筆觸沒有被抹平，旁邊留著修回來的方法。',
 '米珂仍用自己的名字。安妲不必再把整夜說一遍。艾汀寫了信，沒有替蕾朵寫回信。',
 '索恩老師的去向、白鹽信的寄件人與原畫者後來的生活，仍有空白。你們沒有把不知道寫成不存在。',
 '墨停在你的肩上。「今天幾個人？」牠問。這次，岸上的人也加入了數數。',
 '八章的旅程在這裡暫歇。海還在流動，下一頁可以晚一點再寫。'
 ],[option('epilogue-close','留在岸上，重讀與下載手記',()=>null)],{kind:'ending',id:'second'});}
root.NightSecond={install,goal,ready,event,solve,ending,memoryText,regions};if(typeof module!=='undefined')module.exports=root.NightSecond;
})(typeof globalThis!=='undefined'?globalThis:this);

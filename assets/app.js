(()=>{'use strict';
const DB=window.SILLAGE_DATA, PH=window.SILLAGE_PHOTOS||{}, EN=window.LUMO_ENRICH||{notes:{},brands:{},stories:{},sources:{}};
const allowed=['toskovat','nasomatto','orto-parisi','initio','parfums-de-marly','xerjoff','byredo','tom-ford','maison-francis-kurkdjian'];
const brands=DB.brands.filter(b=>allowed.includes(b.id));
let products=DB.products.filter(p=>allowed.includes(p.brand)&&PH[p.brand+'|'+p.name]);
const byId=id=>products.find(p=>p.id===id), brandBy=id=>brands.find(b=>b.id===id);
const $=sel=>document.querySelector(sel), $$=sel=>[...document.querySelectorAll(sel)];
const page=document.body.dataset.page||'index';
const query=new URLSearchParams(location.search);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number(v||0).toLocaleString('ru-RU')+' ₽';
const localPhotos={
 'nasomatto|Black Afgano':'assets/brand-bottles/nasomatto.png',
 'toskovat|Anarchist A_':'assets/product-cutouts/toskovat-anarchist.png',
 'toskovat|Anarchist A':'assets/product-cutouts/toskovat-anarchist.png',
 'tom-ford|Oud Wood':'https://sdcdn.io/tf/tf_sku_T1XG01_2000x2000_0.png',
 'byredo|Bal d’Afrique':'https://www.byredo.com/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/b/y/byr_ecom_26_fragrance_edp_50ml_bda_front_0037.jpg'
};
const galleryPhotos=p=>window.LUMO_PACKSHOTS?.[p.brand+'|'+p.name]||[localPhotos[p.brand+'|'+p.name]||PH[p.brand+'|'+p.name]];
const photo=p=>galleryPhotos(p)[0];
const sourceImage=p=>/\.png(?:[?#]|$)/i.test(photo(p))?'img-transparent':'img-raster';
const link=p=>'product.html?id='+encodeURIComponent(p.id);
const jsonStore=(key,initial)=>{try{return JSON.parse(localStorage.getItem(key))??initial}catch{return initial}};
let wishlist=jsonStore('lumo_favorites_v6',[]), basket=jsonStore('lumo_cart_v6',{});
const save=()=>{try{localStorage.setItem('lumo_favorites_v6',JSON.stringify(wishlist));localStorage.setItem('lumo_cart_v6',JSON.stringify(basket))}catch{}refreshCounts()};
const heart='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>';
const bag='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8.5h15l-1.1 12H5.6l-1.1-12Z"/><path d="M8.4 9V6.2a3.6 3.6 0 0 1 7.2 0V9"/></svg>';
const arr='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h17m-7-7 7 7-7 7"/></svg>';
const plusIcon='<svg class="lumo-control-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const minusIcon='<svg class="lumo-control-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
const upRight='<svg class="lumo-up-right" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M7 5h12v12"/></svg>';
const checkIcon='<svg viewBox="0 0 24 24" class="lumo-check" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg>';
const angle='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const imageFallbacks={
 'tom-ford|Oud Wood':['https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T1XF01_2000x2000_0.png?v=1784719505&width=1200','https://www.tomfordbeauty.com/cdn/shop/files/tf_sku_T1XF01_2000x2000_0_67461176-5023-41b2-9816-1d16ae3925f1.png?v=1790843586&width=1200'],
};
window.LUMO_IMG_FALLBACKS=imageFallbacks;
window.lumoImageError=function(img){const key=img.dataset.photoKey||'',backup=imageFallbacks[key]||[],step=Number(img.dataset.fallbackStep||0);if(step<backup.length){img.dataset.fallbackStep=step+1;img.src=backup[step];return}img.style.visibility='hidden';img.closest('.product-visual,.product-photo-stage,.menu-bottle,.cart-thumb')?.classList.add('image-unavailable');};
const safeImg=(p,cls='',extra='')=>`<img class="${cls} ${sourceImage(p)}  ${p.brand==='toskovat'?'brand-toskovat':''} ${['byredo','nasomatto','toskovat'].includes(p.brand)?'product-photobg':''}" src="${esc(photo(p))}" alt="${esc(p.brandName+' '+p.name)} — изображение флакона" data-photo-key="${esc(p.brand+'|'+p.name)}" decoding="async" loading="lazy" referrerpolicy="no-referrer" onerror="window.lumoImageError(this)" ${extra}>`;

// Public-source note pyramids: manufacturer pages and Scento CC BY 4.0, not synthetic label data.
const notes={
'parfums-de-marly|Layton':[['Яблоко','Бергамот','Кардамон'],['Лаванда','Фиалка','Герань'],['Пачули','Ваниль','Гваяковое дерево','Пралинe']],
'parfums-de-marly|Delina':[['Бергамот','Личи','Ревень'],['Роза','Мускатный орех'],['Кашмеран','Мускус','Ветивер']],
'parfums-de-marly|Delina Exclusif':[['Бергамот','Груша','Личи'],['Турецкая роза','Ладан','Уд'],['Древесные ноты','Амбра','Ваниль']],
'parfums-de-marly|Oriana':[['Мандарин','Лимон','Грейпфрут'],['Флёрдоранж','Жасмин','Крем шантильи'],['Маршмеллоу','Пралине','Мускус']],
'parfums-de-marly|Valaya':[['Бергамот','Мандарин','Персик'],['Цветок апельсина','Белые цветы'],['Мускус','Акигалавуд','Ветивер']],
'parfums-de-marly|Herod':[['Корица','Перец'],['Табак','Ладан','Османтус'],['Ваниль','Мускус','Кедр']],
'parfums-de-marly|Carlisle':[['Яблоко','Мускатный орех','Шафран'],['Бобы тонка','Роза','Османтус'],['Ваниль','Пачули','Опопонакс']],
'parfums-de-marly|Haltane':[['Бергамот','Розовый перец'],['Шафран','Пралине','Лаванда'],['Уд','Пачули','Ветивер','Кожа']],
'parfums-de-marly|Greenley':[['Бергамот','Мандарин','Яблоко'],['Петитгрейн'],['Амброксан','Кедр','Амбровая древесина']],
'parfums-de-marly|Pegasus':[['Анис','Бергамот','Миндаль'],['Кипарис','Лист фиалки','Цветок апельсина'],['Амброксан','Ваниль','Сандал']],
'parfums-de-marly|Oajan':[['Мёд','Корица','Османтус'],['Амбра','Лабданум','Бензоин'],['Ваниль','Бобы тонка','Пачули']],
'parfums-de-marly|Percival':[['Бергамот','Мандарин','Розовый перец'],['Лаванда','Ирис','Кардамон'],['Бальзам пихты','Бобы тонка','Мускус']],
'parfums-de-marly|Delina La Rosée':[['Бергамот','Розовый перец','Личи','Груша'],['Роза','Пион'],['Мускус','Ваниль','Ветивер']],
'parfums-de-marly|Safanad':[['Апельсин','Груша','Петитгрейн'],['Иланг-иланг','Флёрдоранж','Жасмин'],['Ваниль','Сандал']],
'parfums-de-marly|Palatine':[['Мандарин','Бергамот','Груша'],['Фиалка','Лаванда','Жасмин'],['Сандал','Пачули','Мускус']],
'parfums-de-marly|Cassili':[['Красная смородина','Роза'],['Слива','Мимоза','Франжипани'],['Сандал','Бобы тонка','Ваниль']],
'nasomatto|Black Afgano':[['Зелёные ноты'],['Древесные ноты','Смолы','Табак'],['Ладан','Уд']],
'nasomatto|Pardon':[['Магнолия','Цветочные ноты'],['Корица','Бобы тонка','Шоколад'],['Сандал','Уд']],
'nasomatto|Duro':[['Кожа'],['Дым'],['Кожа','Пряности','Древесные ноты']],
'nasomatto|Blamage':[['Белая древесина'],['Кожа'],['Берёза','Мускус']],
'nasomatto|Nudiflorum':[['Цветочные ноты'],['Мускус'],['Мускус']],
'orto-parisi|Megamare':[['Бергамот','Лимон'],['Морские ноты','Водоросли','Гедион'],['Амброксан','Кедр','Мускус']],
'orto-parisi|Terroni':[['Кедр'],['Малина'],['Мускус','Бензоин','Берёза','Гваяковое дерево']],
'orto-parisi|Bergamask':[['Бергамот','Лимон'],['Ландыш','Лаванда','Флёрдоранж'],['Кедр','Мускус','Бобы тонка']],
'orto-parisi|Boccanera':[['Перец','Кокос','Имбирь'],['Жасмин'],['Кожа','Пачули','Ваниль','Кедр']],
'orto-parisi|Viride':[['Полынь','Лаванда'],['Жасмин'],['Кедр','Можжевельник','Пихтовый бальзам','Табак']],
'orto-parisi|Seminalis':[['Гвоздика'],['Ландыш','Малина'],['Кедр','Кожа','Сандал']],
'byredo|Bal d’Afrique':[['Бучу','Календула','Бергамот','Чёрная смородина'],['Цикламен','Жасмин','Фиалка'],['Бобы тонка','Кедр','Мускус','Ветивер']],
'byredo|Gypsy Water':[['Бергамот','Можжевельник','Лимон','Перец'],['Ладан','Ирис','Хвоя'],['Амбра','Сандал','Ваниль']],
'byredo|Blanche':[['Альдегиды','Роза'],['Пион','Фиалка'],['Мускус','Сандал']],
'byredo|Mojave Ghost':[['Амбретта','Саподилла'],['Магнолия','Сандал','Фиалка'],['Кедр','Мускус','Ветивер']],
'byredo|Bibliothèque':[['Слива','Корица'],['Кожа','Фиалка'],['Берёза','Пачули','Ваниль']],
'byredo|Black Saffron':[['Можжевельник','Грейпфрут','Шафран'],['Фиалка','Роза','Кожа'],['Древесные ноты','Малина','Ветивер']],
'byredo|Super Cedar':[['Роза'],['Кедр'],['Мускус','Ветивер']],
'byredo|Animalique':[['Бергамот','Лимон'],['Замша','Фиалка','Мимоза'],['Амбра','Сандал','Табак']],
'byredo|De Los Santos':[['Шалфей','Слива'],['Ирис','Лабданум'],['Мускус','Пало санто','Амброксан']]
};
Object.assign(notes,EN.notes||{});
// Показываем все 102 аромата; неподтверждённые ноты не выдумываем.
const sourceNotes={
'parfums-de-marly|Layton':'https://parfums-de-marly.com/products/layton',
'byredo|Bal d’Afrique':'https://www.byredo.com/eu_en/p/bal-d-afrique-eau-de-parfum',
'initio|Oud for Greatness':'https://initioparfums.com/products/oud-for-greatness'
};
const focus=['initio|Oud for Greatness','parfums-de-marly|Layton','nasomatto|Black Afgano','orto-parisi|Megamare','parfums-de-marly|Delina','toskovat|Inexcusable Evil'];
const picks=focus.map(k=>products.find(p=>p.brand+'|'+p.name===k)).filter(Boolean);
const imageCard=(p,more='')=>`<article class="perfume-card ${more}" data-perfume="${esc(p.id)}"><div class="card-stage"><a href="${link(p)}" class="product-visual" aria-label="Подробнее: ${esc(p.name)}">${safeImg(p,'bottle-img')}</a><button class="fav-button ${wishlist.includes(p.id)?'selected':''}" data-fav="${esc(p.id)}" aria-label="В избранное" title="В избранное">${heart}</button><button class="card-quick" data-cart="${esc(p.id)}" aria-label="В корзину" title="В корзину">${plusIcon}</button></div><div class="card-meta"><span>${esc(p.brandName)}</span><span>${esc(p.volume)}</span></div><a href="${link(p)}" class="card-name">${esc(p.name)}</a><div class="card-bottom"><span>${money(p.price)}</span><span>Демо-цена</span></div></article>`;
const btnLink=(url,txt,cls='')=>`<a class="text-link ${cls}" href="${url}"><span>${txt}</span>${arr}</a>`;
const title=(eyebrow,heading,aside='')=>`<div class="section-head reveal"><div><p class="eyebrow">${eyebrow}</p><h2>${heading}</h2></div>${aside}</div>`;
let brandCurrent=0;
function refreshBrandFocus(){const b=brands[brandCurrent],list=products.filter(p=>p.brand===b.id),p=list.find(p=>({'toskovat':'Inexcusable Evil','nasomatto':'Black Afgano','orto-parisi':'Megamare','initio':'Oud for Greatness','parfums-de-marly':'Layton','xerjoff':'Erba Pura','byredo':'Bal d’Afrique','tom-ford':'Oud Wood','maison-francis-kurkdjian':'Baccarat Rouge 540'})[b.id]===p.name)||list[0];const num=$('#brand-focus-number'),name=$('#brand-focus-name'),d=$('#brand-focus-description'),link=$('#brand-focus-link'),box=$('#brand-focus-bottle');if(!num||!name||!d||!link||!box)return;
 num.textContent=String(brandCurrent+1).padStart(2,'0');name.textContent=b.id==='toskovat'?"Toskovat’":b.name;d.textContent=(EN.brands?.[b.id]?.text||b.caption).slice(0,330);link.href='brand.html?brand='+b.id;box.innerHTML=p?`<img class="focus-bottle normalized-brand" src="assets/brand-bottles/${b.id}.png" alt="Флакон ${esc(p.name)}">`:'';
 box.animate([{opacity:.25,transform:'translateX(13px) scale(.96)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'});
}
function renderHeader(){
 $('#site-header').innerHTML=`<header class="masthead" id="masthead"><div class="header-inner"><button class="icon-button menu-toggle" data-open-menu aria-label="Открыть меню"><i></i><i></i><span>Меню</span></button><nav class="header-links"><a href="catalog.html">Каталог</a><a href="brands.html">Бренды</a><a href="selection.html">Подбор аромата</a></nav><a href="index.html" class="brand-logo" aria-label="Lumo Parfum — главная"><img class="site-logo-img" src="assets/lumo-logo-light.png" alt="Lumo Parfum — фирменный знак"></a><div class="header-actions"><button class="icon-button" data-open-search aria-label="Поиск">${searchIcon}</button><a href="favorites.html" class="icon-button" aria-label="Избранное">${heart}<small data-count-favs></small></a><a href="cart.html" id="cart-icon" class="icon-button" aria-label="Корзина">${bag}<small data-count-cart></small></a></div></div></header>`;
 $('#site-drawer').innerHTML=`<div class="drawer-backdrop" data-close-menu></div><aside class="drawer" id="drawer" aria-hidden="true"><div class="drawer-top"><img class="drawer-actual-logo" src="assets/lumo-logo-light.png" alt="Lumo Parfum"><button class="close-round" data-close-menu aria-label="Закрыть меню"><span class="lumo-close-icon" aria-hidden="true"></span></button></div><div class="drawer-main"><nav class="drawer-nav">${[['Главная','index.html'],['Каталог','catalog.html'],['Бренды','brands.html'],['Подбор по нотам','selection.html'],['О проекте','about.html'],['Избранное','favorites.html'],['Корзина','cart.html']].map(([t,h],i)=>`<a href="${h}" data-preview="${i}" class="drawer-link ${location.pathname.endsWith(h)?'current':''}"><span>${t}</span><span class="drawer-arrow">${arr}</span></a>`).join('')}</nav><div class="drawer-visual"><div class="menu-preview-stage" id="menu-preview">${products.find(p=>p.brand==='nasomatto'&&p.name==='Black Afgano')?safeImg(products.find(p=>p.brand==='nasomatto'&&p.name==='Black Afgano'),'menu-preview-bottle'):''}</div><p class="eyebrow" id="menu-preview-caption">Коллекция редких ароматов</p></div></div><div class="drawer-bottom"><span>Откройте аромат, который останется.</span><span>Selected fragrance collection</span></div></aside>`;
 $('#site-search').innerHTML=`<div class="search-overlay" id="search-overlay" aria-hidden="true"><button class="close-round search-close" data-close-search aria-label="Закрыть"><span class="lumo-close-icon" aria-hidden="true"></span></button><div class="search-wrap"><p class="eyebrow">Поиск по коллекции</p><form id="site-search-form"><input id="site-search-input" type="search" placeholder="Название, бренд или нота…" autocomplete="off" aria-label="Поиск"><button type="submit" aria-label="Искать">${arr}</button></form><div id="search-results" class="search-results"></div></div></div>`;
 $('#site-footer').innerHTML=`<footer class="footer"><div class="footer-top"><p class="eyebrow">Оставайтесь с нами</p><h2>Оставайтесь <i>на связи.</i></h2><p>Редкие ароматы, новые коллекции, истории и вдохновение. Подписка в демоверсии не отправляет данные.</p><form id="newsletter" class="newsletter"><input type="email" placeholder="Ваш e-mail" required aria-label="Электронная почта"><button aria-label="Подписаться">${arr}</button></form></div><div class="footer-mid"><div class="footer-mark"><img src="assets/lumo-logo-light.png" alt="Lumo Parfum"></div><nav><a href="catalog.html">Каталог</a><a href="brands.html">Бренды</a><a href="about.html">О проекте</a><a href="selection.html">Подбор аромата</a></nav><nav><a href="favorites.html">Избранное</a><a href="cart.html">Корзина</a><a href="#" data-demo="Контакты">Контакты</a><a href="#" data-demo="Социальные сети">Следите за нами</a></nav></div><div class="footer-legal"><span>© Lumo Parfum · Демонстрационный сайт</span><span>Фотографии флаконов — из пользовательского PNG-архива; сцены — иллюстративные</span><a href="index.html">Наверх <span class="lumo-inline-arrow">${arr}</span></a></div></footer><div class="toast" id="toast" role="status" aria-live="polite"></div><div class="page-wipe" id="page-wipe" aria-hidden="true"><div class="wipe-grain"></div><div class="wipe-center"><img class="wipe-company-logo" src="assets/lumo-logo-light.png" alt="Lumo Parfum — фирменный логотип"><span class="wipe-selected-brand" id="wipe-selected-brand"></span><img id="wipe-perfume" src="assets/brand-bottles/toskovat.png" alt=""></div></div>`;
 refreshCounts();}
function home(){
 const top=[...picks,...products.filter(p=>p.brand==='toskovat')].filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).slice(0,8);
 const b=brands[0];
 $('#app').innerHTML=`
 <section class="v8-hero v8-fullphoto" aria-label="Lumo Parfum — коллекция ароматов">
   <img class="v8-hero-photo" src="assets/editorial-home.webp" alt="Утверждённая композиция из ароматов на камне" fetchpriority="high">
   <div class="v8-hero-shadow"></div>
   <div class="v8-hero-copy reveal"><h1>Аромат,<br><i>который остаётся.</i></h1><p>Нишевые композиции, редкие истории и запахи, которые узнают без слов.</p><p class="lumo-signature signature-hero" aria-label="Для тех, кто чувствует">Для тех, кто чувствует</p><a class="v8-link light" href="catalog.html">Исследовать ароматы <span class="v10-circle-arr">${arr}</span></a></div>
   <span class="v8-hero-corner" aria-hidden="true">LUMO PARFUM — SELECTED STORIES</span>
 </section>
 <section class="v8-editorial-photo v8-feeling"><img src="assets/scene-heels-flowers.webp" alt="Кожаные туфли, цветы и аромат в выразительной тёмной композиции" loading="lazy"><div class="v8-photo-shade"></div><div class="v8-section-copy v8-align-right reveal"><p class="eyebrow">ПАМЯТЬ / ЧУВСТВА</p><h2>Сначала <i>чувство.</i><br>Потом — слово.</h2><p>И иногда достаточно одной ноты, чтобы вспомнить место, человека или целую жизнь.</p><p class="lumo-signature signature-feeling">написано памятью</p></div></section>
 <section class="v8-note-picker-call section-padded"><div class="v8-note-call-photo"><img src="assets/scene-vanilla-amber.webp" loading="lazy" alt="Ваниль, тёплые янтарные композиции и мягкий свет"></div><div class="v8-note-call-text reveal"><p class="eyebrow dark">YOUR OWN COMPOSITION</p><h2>Найдите аромат<br>по <i>своим нотам.</i></h2><p>Выберите любимые ингредиенты. Мы покажем ароматы, в которых они действительно звучат.</p><a href="selection.html" class="v8-link dark">Создать свой ароматный портрет ${arr}</a></div></section>
 <section class="v8-story-photo"><img src="assets/editorial-story.webp" alt="Композиция нишевых ароматов, включая Toskovat справа, среди шёлка и тёплого камня" loading="lazy"><div class="v8-story-shade"></div><div class="v8-section-copy v8-align-left reveal"><p class="eyebrow">ВОСПОМИНАНИЯ</p><h2>Каждая история<br>имеет <i>свой шлейф.</i></h2><p>Цветы после дождя, прикосновение ткани, тепло дерева — всё может стать началом композиции.</p><p class="lumo-signature signature-story">вечное мгновение</p></div></section>
 <section class="brand-focus-v7 section-padded"><div class="brand-focus-top reveal"><p class="eyebrow dark">ПАРФЮМЕРНЫЕ ДОМА</p><h2>За каждым именем — <i>мир.</i></h2></div><div class="brand-focus-content" id="brand-focus"><div class="brand-focus-text"><div class="brand-focus-counter"><span id="brand-focus-number">01</span><span> / ${String(brands.length).padStart(2,'0')}</span></div><h3 id="brand-focus-name">${esc(b.name)}</h3><p id="brand-focus-description">${esc(b.caption)}</p><a id="brand-focus-link" href="brand.html?brand=${b.id}" class="line-action-v7">Коллекция бренда ${arr}</a></div><div class="brand-focus-image"><div id="brand-focus-bottle" aria-hidden="true"><img class="focus-bottle normalized-brand" src="assets/brand-bottles/toskovat.png" alt="Флакон Toskovat Inexcusable Evil"></div></div></div><div class="brand-focus-navigation"><button type="button" aria-label="Предыдущий бренд" data-brand-prev><span class="lumo-reverse-arrow">${arr}</span></button><span>Листать бренды</span><button type="button" aria-label="Следующий бренд" data-brand-next>${arr}</button><a href="brands.html">Все бренды ${arr}</a></div></section>
 <section class="v8-triple-scenes"><a href="brand.html?brand=tom-ford" class="v8-scenes-tile"><img src="assets/approved-oudwood.png" loading="lazy" alt="Tom Ford Oud Wood среди древесины"><span>Древесные истории ${arr}</span></a><a href="brand.html?brand=toskovat" class="v8-scenes-tile"><img src="assets/approved-anarchist.png" loading="lazy" alt="Toskovat Anarchist на красной ткани"><span>Парфюмерия воспоминаний ${arr}</span></a><a href="brand.html?brand=nasomatto" class="v8-scenes-tile"><img src="assets/approved-sakura.png" loading="lazy" alt="Цветы сакуры за дождевым стеклом"><span>Цветы и воспоминания ${arr}</span></a></section>
 <section class="new-arrivals section-padded v8-products-block">${title('Подборка ароматов','Ближе к <i>себе.</i>',btnLink('catalog.html','Весь каталог'))}<div class="product-grid">${top.slice(0,8).map(imageCard).join('')}</div></section>`;
}
const selMarkup=(key,labels,active)=>`<div class="f-select" data-fselect="${key}"><button type="button" class="f-select-trigger" aria-expanded="false" aria-label="${esc(labels[0][1])}"><span>${esc(labels.find(x=>x[0]===active)?.[1]||labels[0][1])}</span>${angle}</button><div class="f-menu" role="listbox">${labels.map(([v,t])=>`<button type="button" class="f-option ${v===active?'active':''}" data-fvalue="${esc(v)}" role="option" aria-selected="${v===active}">${esc(t)}${v===active?'<span class="lumo-check-svg">${checkIcon}</span>':''}</button>`).join('')}</div></div>`;
let filters={q:query.get('q')||'',brand:query.get('brand')||'',gender:query.get('gender')||'',sort:'popular'},pageSize=16;
function filterCatalog(){let a=products.filter(p=>{const n=notes[p.brand+'|'+p.name]||[];const hay=[p.name,p.brandName,...n.flat()].join(' ').toLowerCase();return (!filters.q||hay.includes(filters.q.toLowerCase()))&&(!filters.brand||p.brand===filters.brand)&&(!filters.gender||p.gender===filters.gender)});if(filters.sort==='name')a.sort((a,b)=>a.name.localeCompare(b.name,'ru'));if(filters.sort==='priceLow')a.sort((a,b)=>a.price-b.price);if(filters.sort==='priceHigh')a.sort((a,b)=>b.price-a.price);return a}
function updateCatalog(){const a=filterCatalog();$('#products-count').textContent=`${a.length} ароматов`;$('#catalog-products').innerHTML=a.slice(0,pageSize).map(imageCard).join('')||'<div class="empty">Ничего не найдено. Попробуйте другой запрос.</div>';$('#show-more').hidden=a.length<=pageSize;reveal();}
function catalog(){const bopts=[['','Все бренды'],...brands.map(b=>[b.id,b.name])];$('#app').innerHTML=`<section class="page-hero"><div class="page-hero-shade"></div><div class="container"><p class="eyebrow">Lumo Parfum / Коллекция</p><h1>Каталог <i>ароматов.</i></h1><p>Собрание уникальных характеров и редких звучаний.</p></div></section><section class="catalog-content section-padded"><div class="catalog-tools"><div class="catalog-search">${searchIcon}<input id="catalog-q" aria-label="Найти аромат" placeholder="Бренд, название или нота…" value="${esc(filters.q)}"></div><div class="filter-toolbar">${selMarkup('brand',bopts,filters.brand)}${selMarkup('gender',[['','Для всех'],['Мужской','Мужские'],['Женский','Женские'],['Унисекс','Унисекс']],filters.gender)}${selMarkup('sort',[['popular','По популярности'],['name','По названию'],['priceLow','Сначала дешевле'],['priceHigh','Сначала дороже']],filters.sort)}<button class="reset-filter" id="reset-filter" title="Сбросить фильтры">Сбросить</button></div></div><div class="catalog-count"><span id="products-count"></span><span>Все товары — демонстрационный ассортимент</span></div><div class="product-grid" id="catalog-products"></div><div class="centered-more"><button id="show-more" class="more-button">Показать ещё ${arr}</button></div></section>`;updateCatalog()}
function brandList(){
 $('#app').innerHTML=`<section class="page-hero"><div class="page-hero-shade"></div><div class="container"><p class="eyebrow">Коллекция / Парфюмерные дома</p><h1>Имена с <i>историей.</i></h1><p>От смелой арт-ниши до современной классики.</p></div></section><section class="brand-directory section-padded">${brands.map((b,i)=>{const p=products.find(p=>p.brand===b.id);return `<a class="brand-directory-row reveal" href="brand.html?brand=${b.id}"><span class="brand-numeral">${String(i+1).padStart(2,'0')}</span><div><h2>${esc(b.name)}</h2><p>${esc(b.caption)}</p></div><span class="brand-directory-photo">${p?`<img class="directory-bottle" src="assets/brand-bottles/${b.id}.png" alt="${esc(b.name)}">`:''}</span><span class="brand-directory-arrow">${arr}</span></a>`}).join('')}</section>`;
}
function brandPage(){const b=brandBy(query.get('brand'))||brands[0];const a=products.filter(p=>p.brand===b.id);const info=(EN.brands||{})[b.id]||{text:b.caption,source:b.site};$('#app').innerHTML=`<section class="page-hero"><div class="page-hero-shade"></div><div class="container"><p class="eyebrow">Коллекции / ${esc(b.origin)}</p><h1>${esc(b.name)}</h1><p>${esc(b.caption)}</p></div></section><section class="brand-intro section-padded brand-story-v6"><div><p class="eyebrow dark">История дома</p><h2>${esc(b.name)}</h2></div><div><p>${esc(info.text)}</p><a class="v6-source" href="${esc(info.source||b.site)}" target="_blank" rel="noopener noreferrer">История на сайте бренда ${upRight}</a></div></section><section class="section-padded brand-products">${title('Коллекция','Ароматы <i>'+esc(b.name)+'.</i>')}<div class="product-grid">${a.map(imageCard).join('')}</div></section>`}
function noteInfo(p){const n=notes[p.brand+'|'+p.name];if(!n)return '<p class="notes-disclaimer">Пирамида не подтверждена.</p>';
return `<div class="pyramid-v6">${['Верхние ноты','Ноты сердца','Базовые ноты'].map((v,i)=>`<div class="pyramid-note-card"><div class="note-photo-frame"><img loading="lazy" src="assets/note-portraits/${encodeURIComponent(p.id)}-${i}.webp" alt="Фотография ингредиентов: ${esc((n[i]||[]).slice(0,3).join(', '))}"></div><p class="eyebrow dark">${v}</p><p class="pyramid-values">${(n[i]||[]).map(esc).join(' · ')}</p></div>`).join('')}</div>`}
function productPage(){const p=byId(query.get('id'))||products[0];const b=brandBy(p.brand),k=p.brand+'|'+p.name;const similarly=products.filter(x=>x.brand===p.brand&&x.id!==p.id).slice(0,4);const n=notes[k];const info=(EN.brands||{})[b.id]||{text:b.caption,source:b.site};
const opening=n?n[0].slice(0,3).join(', ').toLowerCase():'', middle=n?n[1].slice(0,3).join(', ').toLowerCase():'', base=n?n[2].slice(0,3).join(', ').toLowerCase():'';
const prose=n?`${p.name} — аромат с собственным ритмом и настроением. В начале композиции можно различить ${opening}. Первое впечатление задаёт направление, но не раскрывает весь характер: аромат постепенно меняется на коже, оставляя пространство для личных ассоциаций. В сердце звучат ${middle}; именно этот переход придаёт композиции объём и узнаваемость. Позже проявляется база — ${base}. Она соединяет предыдущие аккорды и оставляет более спокойное, глубокое послевкусие. Здесь важен не один ингредиент, а то, как отдельные оттенки постепенно складываются в цельное впечатление.`:`${p.name} — аромат из коллекции ${p.brandName}. Его характер раскрывается индивидуально, а нюансы звучания зависят от кожи, температуры и восприятия. Подробную пирамиду уточняем по официальным материалам парфюмерного дома.`;
const story=(EN.stories||{})[k]||(n?`История ${p.name} строится вокруг сочетания разных состояний. ${n[0].slice(0,2).join(' и ')} формируют первое ощущение; ${n[1].slice(0,2).join(' и ')} добавляют объём и настроение. Завершающие ноты — ${n[2].slice(0,2).join(' и ')} — делают образ сложнее и теплее. Это редакционное прочтение композиции, основанное на её известных нотах; не выдуманная легенда производителя.`:`${p.name} — часть авторской коллекции ${p.brandName}. Знакомство с ним — это повод узнать больше о творческом направлении дома, его подходе к материалам и выразительности ароматов. Мы не приписываем композиции выдуманные ноты или историю.`);
const source=(EN.sources||{})[k]||sourceNotes[k]||info.source||b.site;
$('#app').innerHTML=`<section class="product-page product-v6"><div class="crumb"><a href="catalog.html">Каталог</a><span> / </span><a href="brand.html?brand=${b.id}">${esc(b.name)}</a><span> / </span>${esc(p.name)}</div><div class="product-main"><div class="product-gallery"><div class="product-photo-stage product-visual">${safeImg(p,'product-detail-bottle','loading="eager"')}</div><div class="product-gallery-thumbs" role="group" aria-label="Фотографии флакона">${galleryPhotos(p).map((src,i)=>`<button type="button" class="v10-gallery-thumb ${i===0?'active':''}" data-gallery-src="${esc(src)}" aria-label="Фото ${i+1} — ${esc(p.name)}" aria-pressed="${i===0}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div></div><div class="product-summary"><p class="eyebrow dark">${esc(p.brandName)} / ${esc(p.tier)}</p><h1>${esc(p.name)}</h1><p class="product-essence">${esc(b.caption)}</p><div class="product-description"><p>${esc(prose)}</p></div><p class="p-amount">${money(p.price)} <small>демонстрационная цена</small></p><div class="product-params"><span>Объём</span><span>${esc(p.volume)}</span></div><div class="product-params"><span>Направление</span><span>${esc(p.gender)}</span></div><div class="product-action-buttons"><button class="main-action" data-cart="${p.id}">Добавить в корзину ${arr}</button><button class="product-fav ${wishlist.includes(p.id)?'selected':''}" data-fav="${p.id}" aria-label="В избранное">${heart}</button></div><div class="product-delivery">Демонстрационный магазин. Оплата не подключена.</div></div></div></section>
<section class="product-notes section-padded note-section-v6">${title('Каждая деталь имеет значение','Пирамида <i>аромата.</i>')}<p class="note-intro-v6">Три этапа раскрытия — от первой искры до последнего оттенка шлейфа. Фотографии иллюстрируют ингредиенты и настроение композиции.</p>${noteInfo(p)}<p class="note-sourcing"><a href="${esc(source)}" target="_blank" rel="noopener noreferrer">Подробнее об источнике ${upRight}</a>${p.brand==='initio'?' · У INITIO разделение на этапы может быть редакционной интерпретацией, поскольку дом часто публикует только основные ноты.':''}</p></section>
<section class="story-section-v6 section-padded"><div class="story-intro-v6"><p class="eyebrow dark">О чём рассказывает аромат</p><h2>История <i>${esc(p.name)}.</i></h2><p>${esc(story)}</p><a class="v6-source" href="${esc(source)}" target="_blank" rel="noopener noreferrer">Первоисточник ${upRight}</a></div><div class="story-aside-v7"><p>«Аромат — это невидимая часть личной истории. Он может стать воспоминанием ещё до того, как мы найдём для него слова».</p><span class="story-aside-note">LUMO / EDITORIAL</span></div></section>
<section class="brand-intro section-padded brand-story-on-product"><div><p class="eyebrow dark">Люди и идеи</p><h2>История <i>дома.</i></h2><p class="brand-story-title">${esc(b.name)}</p></div><div><p>${esc(info.text)}</p>${btnLink('brand.html?brand='+b.id,'Другие ароматы бренда')}</div></section>
<section class="section-padded">${title('Продолжить знакомство','Другие <i>характеры.</i>',btnLink('brand.html?brand='+p.brand,'Вся коллекция'))}<div class="product-grid">${similarly.map(imageCard).join('')}</div></section>`;
}
function favorites(){const a=products.filter(p=>wishlist.includes(p.id));$('#app').innerHTML=`<section class="page-hero compact"><div class="container"><p class="eyebrow">Моя коллекция</p><h1>Избранные <i>ароматы.</i></h1></div></section><section class="section-padded"><div class="product-grid">${a.map(imageCard).join('')}</div>${a.length?'':`<div class="empty"><p>Здесь пока ничего нет.</p>${btnLink('catalog.html','Открыть каталог')}</div>`}</section>`;}
function cart(){const rows=Object.entries(basket).map(([id,qty])=>({p:byId(id),qty})).filter(x=>x.p);const total=rows.reduce((n,x)=>n+x.p.price*x.qty,0);$('#app').innerHTML=`<section class="page-hero compact"><div class="container"><p class="eyebrow">Выбранные ароматы</p><h1>Ваша <i>корзина.</i></h1></div></section><section class="cart-layout section-padded"><div class="cart-list">${rows.map(({p,qty})=>`<article class="cart-row"><a class="cart-thumb" href="${link(p)}">${safeImg(p,'cart-bottle')}</a><div class="cart-title"><span class="eyebrow dark">${esc(p.brandName)}</span><a href="${link(p)}">${esc(p.name)}</a><small>${esc(p.volume)}</small></div><div class="qty-control"><button data-qty="-1" data-id="${p.id}" aria-label="Меньше">${minusIcon}</button><span>${qty}</span><button data-qty="1" data-id="${p.id}" aria-label="Больше">${plusIcon}</button></div><span>${money(p.price*qty)}</span><button class="remove-row" data-remove="${p.id}" aria-label="Удалить"><span class="lumo-close-icon" aria-hidden="true"></span></button></article>`).join('')||`<div class="empty"><p>Корзина пока пуста.</p>${btnLink('catalog.html','Перейти в каталог')}</div>`}</div><div class="cart-totals"><p class="eyebrow dark">Ваш заказ</p><div><span>Товаров</span><strong>${rows.reduce((n,x)=>n+x.qty,0)}</strong></div><div class="cart-total"><span>Итого</span><strong>${money(total)}</strong></div><button class="main-action" data-demo="Оформление заказа">Оформить заказ ${arr}</button><small>Это демонстрационный проект. Оплата не производится.</small></div></section>`}
const DISCOVERY_NOTES=['Ваниль','Уд','Роза','Мускус','Бергамот','Кожа','Табак','Сандал','Жасмин','Лаванда','Амбра','Ладан','Ветивер','Шафран','Пачули','Кедр','Малина','Кардамон'];
let selectedNotes=new Set();
const normalNote=x=>String(x||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').trim();
const matchesNote=(productNote,selected)=>{
 const a=normalNote(productNote),b=normalNote(selected);
 const equiv={уд:['уд','агаровое дерево','агарвуд','oud'],амбра:['амбр','amb'],сандал:['сандал'],роза:['роз'],кожа:['кожа','кож','замш'],табак:['табак','тоби','tobacco'],ладан:['ладан','incense'],мускус:['муск'],ветивер:['ветивер'],бергамот:['бергамот'],ваниль:['ваниль'],жасмин:['жасмин'],лаванда:['лаванд'],пачули:['пачули'],кедр:['кедр'],шафран:['шафран'],малина:['малин'],кардамон:['кардамон']};
 return (equiv[b]||[b]).some(x=>a.includes(x));
};
function noteResults(){
 const chosen=[...selectedNotes];
 $('#note-selected-count').textContent=chosen.length?`Выбрано нот: ${chosen.length}`:'Выберите одну или несколько нот';
 $$('.v8-note-chip').forEach(el=>{const yes=selectedNotes.has(el.dataset.note);el.classList.toggle('is-chosen',yes);el.setAttribute('aria-pressed',String(yes));});
 const sorted=products.map(p=>{const all=(notes[p.brand+'|'+p.name]||[]).flat();const hit=chosen.filter(x=>all.some(n=>matchesNote(n,x)));return {p,hit};}).filter(x=>x.hit.length>0).sort((a,b)=>b.hit.length-a.hit.length || b.p.price-a.p.price);
 const result=$('#note-match-results'); if(!result)return;
 if(!chosen.length){result.innerHTML='<div class="v8-note-placeholder">Отметьте любимые ноты — и здесь появятся ароматы из каталога, которые действительно содержат их.</div>';return;}
 if(!sorted.length){result.innerHTML='<div class="v8-note-placeholder">В каталоге пока нет сочетания с выбранными нотами. Попробуйте изменить выбор.</div>';return;}
 result.innerHTML=sorted.slice(0,12).map(({p,hit})=>`<div class="v8-result-card">${imageCard(p)}<p class="v8-note-match">Совпадает: ${esc(hit.join(' · '))}</p><p class="v8-note-match-muted">${hit.length} из ${chosen.length} выбранных нот</p></div>`).join('');reveal();
}
function selection(){
 $('#app').innerHTML=`<section class="v8-notes-hero"><img src="assets/editorial-notes.webp" alt="Благовония в тёмном интерьере" loading="eager"><div class="v8-notes-hero-shade"></div><div class="v8-notes-hero-copy reveal"><p class="eyebrow">LUMO / PERSONAL SELECTION</p><h1>Соберите своё<br><i>звучание.</i></h1><p>Мы подбираем аромат по нотам, которые вы любите, а не по случайным рекомендациям.</p></div></section>
 <section class="v8-note-select-section section-padded"><p class="eyebrow dark">ВАШИ ПРЕДПОЧТЕНИЯ</p><div class="v8-selection-intro"><h2>Какие ноты<br>вам <i>близки?</i></h2><p>Выбирайте сколько угодно: сладкие, дымные, древесные или цветочные. Результаты основаны на пирамидах ароматов этого каталога.</p></div><div class="v8-chip-grid" id="v8-chip-grid">${DISCOVERY_NOTES.map(n=>`<button class="v8-note-chip" type="button" data-note="${n}" aria-pressed="false">${n}<span class="lumo-mini-plus" aria-hidden="true">${plusIcon}</span></button>`).join('')}</div><div class="v8-picker-toolbar"><span id="note-selected-count">Выберите одну или несколько нот</span><button type="button" id="v8-clear-notes">Очистить выбор <span class="lumo-close-icon" aria-hidden="true"></span></button></div></section>
 <section class="v8-note-results section-padded"><div class="section-head"><div><p class="eyebrow dark">СОВПАДЕНИЯ ПО КОМПОЗИЦИИ</p><h2>Ваши <i>ароматы.</i></h2></div></div><div id="note-match-results" class="v8-matches-grid"></div></section>`;
 noteResults();
}
function about(){$('#app').innerHTML=`<section class="about-hero about-hero-v7"><div class="about-background"></div><div class="about-content"><p class="eyebrow">Lumo / наша идея</p><h1>Невидимое <i>искусство.</i></h1><p>Самые интересные истории остаются с нами не на бумаге — на коже.</p><p class="lumo-signature signature-about">внутри каждого</p></div></section><section class="about-editorial section-padded"><p class="eyebrow dark">О проекте</p><div class="about-editorial-grid"><h2>Не всё прекрасное <i>нужно объяснять.</i></h2><div><p>Мы собираем ароматы как произведения искусства: с вниманием к композиции, форме флакона и ощущению, которое остаётся после первого знакомства.</p><p>Lumo Parfum — демонстрация концепции современного парфюмерного бутика. Бренды и фотографии представлены для иллюстрации каталога, а не как предложение официального продавца.</p></div></div></section><section class="about-photo-block"><div class="about-photo-bg"></div><div class="about-photo-caption"><p class="eyebrow">Каждый флакон — история</p><h2>Оставить <i>след.</i></h2>${btnLink('catalog.html','Открыть коллекцию')}</div></section>`}
function refreshCounts(){const f=$('[data-count-favs]'),c=$('[data-count-cart]');if(f)f.textContent=wishlist.length||'';if(c)c.textContent=Object.values(basket).reduce((a,b)=>a+b,0)||''}
let timeoutToast;
function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('visible');clearTimeout(timeoutToast);timeoutToast=setTimeout(()=>el.classList.remove('visible'),2400)}
function animateIntoCart(trigger,p){
 const image=trigger.closest('.perfume-card,.product-main,.cart-row')?.querySelector('.bottle-img,.product-detail-bottle')||trigger.closest('section')?.querySelector('.bottle-img');
 const target=$('#cart-icon'); if(!image||!target||!image.complete||!image.naturalWidth||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const bounds=image.getBoundingClientRect(),cart=target.getBoundingClientRect();
 const size=Math.max(70,Math.min(155,Math.min(bounds.width,bounds.height)));
 const ox=bounds.left+bounds.width/2-size/2,oy=bounds.top+bounds.height/2-size/2;
 const dx=cart.left+cart.width/2-(ox+size/2),dy=cart.top+cart.height/2-(oy+size/2),arc=Math.max(80,Math.min(250,Math.abs(dy)*.22));
 const flying=image.cloneNode(true);flying.removeAttribute('onerror');flying.className='v8-flying-perfume';
 Object.assign(flying.style,{position:'fixed',left:`${ox}px`,top:`${oy}px`,width:`${size}px`,height:`${size}px`,objectFit:'contain',zIndex:9999,pointerEvents:'none',filter:'drop-shadow(0 16px 22px #08050366)'});
 document.body.appendChild(flying);
 const motion=flying.animate([{transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:0},{transform:`translate3d(${dx*.28}px,${dy*.23-arc}px,0) rotate(-7deg) scale(.94)`,opacity:1,offset:.28},{transform:`translate3d(${dx*.70}px,${dy*.69-arc*.65}px,0) rotate(6deg) scale(.58)`,opacity:1,offset:.73},{transform:`translate3d(${dx}px,${dy}px,0) rotate(4deg) scale(.10)`,opacity:.08,offset:1}],{duration:850,easing:'cubic-bezier(.18,.68,.22,1)',fill:'forwards'});
 motion.finished.then(()=>{flying.remove();target.animate([{transform:'scale(1)'},{transform:'scale(1.27)'},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});}).catch(()=>flying.remove());
}
function toggleDrawer(v){const d=$('#drawer');const b=$('.drawer-backdrop');d.classList.toggle('open',v);b.classList.toggle('visible',v);d.setAttribute('aria-hidden',String(!v));document.body.classList.toggle('locked',v);if(v)d.querySelector('a')?.focus()}
function toggleSearch(v){const d=$('#search-overlay');d.classList.toggle('open',v);d.setAttribute('aria-hidden',String(!v));document.body.classList.toggle('locked',v);if(v)setTimeout(()=>$('#site-search-input')?.focus(),220)}
function searchLive(){const q=$('#site-search-input').value.toLowerCase().trim();const found=q?products.filter(p=>(p.brandName+' '+p.name).toLowerCase().includes(q)).slice(0,5):[];$('#search-results').innerHTML=found.map(p=>`<a href="${link(p)}"><span>${safeImg(p,'search-hit-bottle')}</span><div><small>${esc(p.brandName)}</small><strong>${esc(p.name)}</strong></div>${arr}</a>`).join('')+(q?`<a href="catalog.html?q=${encodeURIComponent(q)}" class="all-results">Все результаты ${arr}</a>`:'')}
function bind(){document.addEventListener('click',e=>{const el=e.target;const a=el.closest('[data-open-menu]');if(a){toggleDrawer(true);return}if(el.closest('[data-close-menu]')){toggleDrawer(false);return}if(el.closest('[data-open-search]')){toggleSearch(true);return}if(el.closest('[data-close-search]')){toggleSearch(false);return}
const galleryBtn=el.closest('[data-gallery-src]');if(galleryBtn){const main=$('.product-detail-bottle');if(main){main.src=galleryBtn.dataset.gallerySrc;$$('.v10-gallery-thumb').forEach(x=>{x.classList.toggle('active',x===galleryBtn);x.setAttribute('aria-pressed',String(x===galleryBtn))});main.animate([{opacity:.25,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:420,easing:'ease-out'})}return}
 const fav=el.closest('[data-fav]');if(fav){const id=fav.dataset.fav;wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];save();$$('[data-fav="'+id+'"]').forEach(x=>x.classList.toggle('selected',wishlist.includes(id)));toast(wishlist.includes(id)?'Аромат сохранён':'Убрано из избранного');if(page==='favorites')favorites();return}
const add=el.closest('[data-cart]');if(add){const p=byId(add.dataset.cart);if(p){const already=basket[p.id]||0;if(already){toast(`${already} ${already===1?'товар уже в корзине':'шт. уже в корзине'}`)}else{animateIntoCart(add,p);basket[p.id]=1;save()}}return}
const remove=el.closest('[data-remove]');if(remove){delete basket[remove.dataset.remove];save();cart();return}
const qty=el.closest('[data-qty]');if(qty){basket[qty.dataset.id]=(basket[qty.dataset.id]||0)+Number(qty.dataset.qty);if(basket[qty.dataset.id]<=0)delete basket[qty.dataset.id];save();cart();return}
const noteChip=el.closest('[data-note]');if(noteChip){const n=noteChip.dataset.note;selectedNotes.has(n)?selectedNotes.delete(n):selectedNotes.add(n);noteResults();return}
 if(el.closest('#v8-clear-notes')){selectedNotes.clear();noteResults();return}
 const pick=el.closest('[data-pick]');if(pick){let ar=products.filter(p=>p.gender===pick.dataset.pick).slice(0,4);if(!ar.length)ar=products.slice(0,4);$('#pick-result').innerHTML=ar.map(imageCard).join('');$$('[data-pick]').forEach(x=>x.classList.toggle('chosen',x===pick));reveal();$('#pick-result').scrollIntoView({behavior:'smooth',block:'center'});return}
const stepBrand=el.closest('[data-brand-prev],[data-brand-next]');if(stepBrand){brandCurrent=(brandCurrent+(stepBrand.hasAttribute('data-brand-next')?1:-1)+brands.length)%brands.length;refreshBrandFocus();return}
const trigger=el.closest('.f-select-trigger');if(trigger){const parent=trigger.closest('.f-select');$$('.f-select').filter(x=>x!==parent).forEach(x=>x.classList.remove('open'));parent.classList.toggle('open');trigger.setAttribute('aria-expanded',String(parent.classList.contains('open')));return}
const option=el.closest('[data-fvalue]');if(option){const parent=option.closest('.f-select');let key=parent.dataset.fselect;filters[key]=option.dataset.fvalue;parent.querySelector('.f-select-trigger span').textContent=option.textContent.replace('✓','').trim();parent.classList.remove('open');pageSize=16;updateCatalog();return}
if(!el.closest('.f-select'))$$('.f-select').forEach(x=>x.classList.remove('open'));
if(el.closest('#reset-filter')){filters={q:'',brand:'',gender:'',sort:'popular'};pageSize=16;catalog();return}
if(el.closest('#show-more')){pageSize+=16;updateCatalog();return}
const demo=el.closest('[data-demo]');if(demo){e.preventDefault();toast('Демонстрационный раздел — подключение позже');return}});
$('.drawer-nav')?.addEventListener('pointerover',e=>{const a=e.target.closest('[data-preview]');if(!a)return;const p=picks[Number(a.dataset.preview)%picks.length];if(!p)return;const box=$('#menu-preview');box.innerHTML=safeImg(p,'menu-preview-bottle');$('#menu-preview-caption').textContent=p.brandName+' / '+p.name;});
$('#site-search-input')?.addEventListener('input',searchLive);
$('#site-search-form')?.addEventListener('submit',e=>{e.preventDefault();location.href='catalog.html?q='+encodeURIComponent($('#site-search-input').value.trim())});
$('#newsletter')?.addEventListener('submit',e=>{e.preventDefault();toast('Это демо. Подписка не отправляется.');e.target.reset()});
document.addEventListener('input',e=>{if(e.target.id==='catalog-q'){filters.q=e.target.value;pageSize=16;updateCatalog();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggleDrawer(false);toggleSearch(false)}});
window.addEventListener('scroll',()=>{$('#masthead')?.classList.toggle('scrolled',window.scrollY>50);if(page==='index'){document.documentElement.style.setProperty('--scroll-pct',Math.min(window.scrollY/window.innerHeight,1).toFixed(3))}},{passive:true});
let lumoPendingPageNavigation=null;
function lumoResetTransition(){
 const wipe=$('#page-wipe');
 if(wipe)wipe.classList.remove('active','arriving','arriving-away');
 document.documentElement.classList.remove('is-leaving');
}
// iOS Safari and desktop browsers can revive the old page from their back/forward cache.
// Never show the transition splash during a browser Back/Forward operation.
window.addEventListener('pagehide',()=>{
 if(lumoPendingPageNavigation!==null){clearTimeout(lumoPendingPageNavigation);lumoPendingPageNavigation=null;}
 lumoResetTransition();
});
window.addEventListener('pageshow',(event)=>{
 const historyReturn=event.persisted||performance.getEntriesByType('navigation')[0]?.type==='back_forward';
 if(!historyReturn)return;
 if(lumoPendingPageNavigation!==null){clearTimeout(lumoPendingPageNavigation);lumoPendingPageNavigation=null;}
 lumoResetTransition();
 document.body.classList.remove('locked');
 try{sessionStorage.removeItem('lumo-transition-photo');sessionStorage.removeItem('lumo-transition-brand')}catch{}
 // Reveal already-visible headings when returning to an in-page scroll position.
 document.querySelectorAll('.lumo-ink-heading').forEach(h=>{
  const rect=h.getBoundingClientRect();
  if(rect.top<innerHeight+100&&rect.bottom>0)h.classList.add('is-written');
 });
});
document.addEventListener('click',e=>{if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a[href]');if(!a||a.target||a.hasAttribute('download'))return;const href=a.getAttribute('href');if(href.startsWith('#'))return;let to;try{to=new URL(a.href)}catch{return}if(to.origin!==location.origin||!to.pathname.endsWith('.html')||to.href===location.href)return;e.preventDefault();const wipe=$('#page-wipe');const img=$('#wipe-perfume');const params=to.searchParams;
const productId=params.get('id');
const destinationBrand=params.get('brand');
const featuredByBrand={toskovat:'Inexcusable Evil',nasomatto:'Black Afgano','orto-parisi':'Megamare',initio:'Oud for Greatness','parfums-de-marly':'Layton',xerjoff:'Erba Pura',byredo:'Bal d’Afrique','tom-ford':'Oud Wood','maison-francis-kurkdjian':'Baccarat Rouge 540'};
const chooseBrand=(id)=>products.find(p=>p.brand===id&&p.name===featuredByBrand[id])||products.find(p=>p.brand===id);
let chosen=productId?byId(productId):destinationBrand?chooseBrand(destinationBrand):null;
if(!chosen&&to.pathname.endsWith('/brands.html'))chosen=chooseBrand('byredo');
if(!chosen&&to.pathname.endsWith('/catalog.html'))chosen=chooseBrand('xerjoff');
if(!chosen&&to.pathname.endsWith('/selection.html'))chosen=chooseBrand('orto-parisi');
if(!chosen&&to.pathname.endsWith('/about.html'))chosen=chooseBrand('initio');
if(!chosen&&to.pathname.endsWith('/favorites.html'))chosen=chooseBrand('tom-ford');
if(!chosen&&to.pathname.endsWith('/cart.html'))chosen=chooseBrand('parfums-de-marly');
if(!chosen)chosen=chooseBrand('toskovat');
if(img&&chosen){img.src='assets/brand-bottles/'+chosen.brand+'.png';img.alt=chosen.brandName+' — '+chosen.name;}
const brandCaption=$('#wipe-selected-brand');if(brandCaption)brandCaption.textContent=chosen?chosen.brandName:'';
wipe.classList.add('active');document.documentElement.classList.add('is-leaving');
try{sessionStorage.setItem('lumo-transition-photo',img?.getAttribute('src')||'');sessionStorage.setItem('lumo-transition-brand',brandCaption?.textContent||'')}catch{}
lumoPendingPageNavigation=setTimeout(()=>{lumoPendingPageNavigation=null;location.assign(to.href)},970)});
}
let IO=null;function reveal(){if(matchMedia('(prefers-reduced-motion:reduce)').matches){$$('.reveal').forEach(el=>el.classList.add('visible'));return}if(!IO)IO=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');IO.unobserve(x.target)}}),{rootMargin:'0px 0px -25px 0px',threshold:.08});$$('.reveal:not(.visible)').forEach(el=>IO.observe(el))}
function lumoInkReveals(){
 const heads=$$('#app h1,#app h2,#app .brand-focus-text h3,#site-footer .footer-top h2');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 heads.forEach((h,i)=>{h.classList.add('lumo-ink-heading');h.style.setProperty('--reveal-delay',((i%3)*95)+'ms')});
 // Using bounding rectangles, not an observer on a clipped heading: clip-path would
 // otherwise make the intersection rectangle empty and the title would never appear.
 let scheduled=false;
 function show(){scheduled=false;for(const h of heads){if(h.classList.contains('is-written'))continue;const r=h.getBoundingClientRect();if(reduce||r.top<innerHeight+140&&r.bottom>-60)h.classList.add('is-written')}}
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(show)}}
 show();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 const photos=$$('#app .v8-editorial-photo,#app .v8-story-photo,#app .v8-scenes-tile,#app .about-photo-block');
 if(reduce){photos.forEach(p=>p.classList.add('lumo-photo-seen'));return}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('lumo-photo-seen');observer.unobserve(entry.target)}}),{threshold:.02});
 photos.forEach(e=>observer.observe(e));
}
function glassScroll(){
 if(matchMedia('(pointer:coarse), (prefers-reduced-motion: reduce)').matches)return;
 let target=window.scrollY,actual=target,frame=0,last=0,internal=false;
 const max=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 function animate(time){
  const dt=last?Math.min(time-last,40):16;last=time;
  const a=1-Math.exp(-dt/185);
  actual+=(target-actual)*a;
  if(Math.abs(target-actual)<.35){actual=target;frame=0;last=0}else frame=requestAnimationFrame(animate);
  internal=true;window.scrollTo({left:0,top:actual,behavior:'instant'});internal=false;
 }
 window.addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey||e.target.closest('.drawer,.search-overlay,.f-menu,input,textarea,select,[contenteditable]'))return;
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.deltaY===0)return;
  e.preventDefault();
  let d=e.deltaY*(e.deltaMode===1?20:e.deltaMode===2?innerHeight:1);
  // Work for mouse-wheel and trackpads without introducing a second native scroll movement.
  d=Math.min(340,Math.max(-340,d));
  if(!frame){actual=window.scrollY;target=actual;last=0;}
  target=Math.min(max(),Math.max(0,target+d*.98));
  if(!frame)frame=requestAnimationFrame(animate);
 },{passive:false});
 window.addEventListener('scroll',()=>{if(!internal&&!frame){target=actual=window.scrollY;}},{passive:true});
 window.addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key)){if(frame)cancelAnimationFrame(frame);frame=0;last=0;target=actual=window.scrollY;}},{passive:true});
}

function loadNotes(){// When reachable, enhance remaining note pyramids from open public dataset, never generate synthetic notes.
 fetch('https://raw.githubusercontent.com/Scento-com/perfume-dataset/main/perfumes.jsonl').then(r=>{if(!r.ok)throw Error('unavailable');return r.text()}).then(s=>{const rows=s.split('\n').flatMap(line=>{try{return [JSON.parse(line.replace(/\\_/g,'_'))]}catch{return []}});const norm=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');for(const p of products){let key=p.brand+'|'+p.name;if(notes[key])continue;const b=brandBy(p.brand);const x=rows.find(v=>norm(v.house).includes(norm(b.name).slice(0,7))&&norm(v.name)===norm(p.name));if(!x)continue;if((x.top_notes||[]).length||(x.heart_notes||[]).length||(x.base_notes||[]).length)notes[key]=[x.top_notes||[],x.heart_notes||[],x.base_notes||[]]}if(page==='product'){const p=byId(query.get('id'));if(p&&$('#app .notes-disclaimer')&&notes[p.brand+'|'+p.name])$('#app .notes-disclaimer').outerHTML=noteInfo(p)}}).catch(()=>{});
}
renderHeader();switch(page){case 'catalog':catalog();break;case 'brands':brandList();break;case 'brand':brandPage();break;case 'product':productPage();break;case 'favorites':favorites();break;case 'cart':cart();break;case 'selection':selection();break;case 'about':about();break;default:home()}
bind();reveal();lumoInkReveals();glassScroll();
// Arrival curtain gives transitions continuity across separate HTML documents.
try{const fromBrowserHistory=performance.getEntriesByType('navigation')[0]?.type==='back_forward';if(fromBrowserHistory){sessionStorage.removeItem('lumo-transition-photo');sessionStorage.removeItem('lumo-transition-brand')}const selected=fromBrowserHistory?null:sessionStorage.getItem('lumo-transition-photo');if(selected){sessionStorage.removeItem('lumo-transition-photo');const curtain=$('#page-wipe');const figure=$('#wipe-perfume');if(figure&&selected)figure.src=selected;const brandName=sessionStorage.getItem('lumo-transition-brand')||'';sessionStorage.removeItem('lumo-transition-brand');const caption=$('#wipe-selected-brand');if(caption)caption.textContent=brandName;curtain.classList.add('arriving');requestAnimationFrame(()=>requestAnimationFrame(()=>curtain.classList.add('arriving-away')));setTimeout(()=>{curtain.classList.remove('arriving','arriving-away')},840)}}catch{}
})();

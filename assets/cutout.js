/* Best-effort photo background extraction for CDN JPG/GIF packshots.
   Crops only a uniform edge-connected region, preserving interior labels.
   Browser security may block cross-origin pixel access; original source remains visible then. */
(()=>{'use strict';
 const memo=new Map(),pending=new WeakSet();
 const io=('IntersectionObserver' in window)?new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){io.unobserve(e.target);enhance(e.target)}
 },{rootMargin:'350px'}):null;
 const visibleImg=x=>x.matches?.('img.img-raster, img.img-transparent, img.directory-bottle, img.cart-bottle, img.search-hit-bottle, img.menu-preview-bottle');
 function enhance(el){if(pending.has(el))return;pending.add(el);let u=el.currentSrc||el.src;if(memo.has(u)){const v=memo.get(u);if(v){el.src=v;el.classList.add('cutout-ready')}return}
 const im=new Image();im.crossOrigin='anonymous';im.decoding='async';im.onload=()=>{
   try{
   const W=440,H=Math.max(120,Math.round(440*im.naturalHeight/im.naturalWidth));if(H>700)return;
   const cvs=document.createElement('canvas');cvs.width=W;cvs.height=H;const g=cvs.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,W,H);const img=g.getImageData(0,0,W,H),pix=img.data;
   const corners=[[3,3],[W-4,3],[3,H-4],[W-4,H-4]].map(([x,y])=>{const idx=(y*W+x)*4;return [pix[idx],pix[idx+1],pix[idx+2]]});
   const bg=[0,1,2].map(k=>corners.reduce((s,c)=>s+c[k],0)/4);
   const spread=Math.max(...corners.flatMap(c=>c.map((v,k)=>Math.abs(v-bg[k]))));
   const brightness=(bg[0]+bg[1]+bg[2])/3;
   if(spread>45||brightness<135)return;
   const seen=new Uint8Array(W*H),queue=new Int32Array(W*H);let h=0,t=0;
   const add=index=>{if(index<0||index>=W*H||seen[index])return;const k=index*4;const dist=Math.hypot(pix[k]-bg[0],pix[k+1]-bg[1],pix[k+2]-bg[2]);if(dist<45){seen[index]=1;queue[t++]=index}};
   for(let x=0;x<W;x++){add(x);add((H-1)*W+x)}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1)}
   while(h<t){const n=queue[h++],x=n%W,y=Math.floor(n/W);if(x>0)add(n-1);if(x<W-1)add(n+1);if(y>0)add(n-W);if(y<H-1)add(n+W)}
   if(t<W*H*.1||t>W*H*.92)return;
   for(let k=0;k<W*H;k++)if(seen[k])pix[k*4+3]=0;
   g.putImageData(img,0,0);cvs.toBlob(blob=>{if(!blob)return;const obj=URL.createObjectURL(blob);memo.set(u,obj);if(el.isConnected){el.src=obj;el.classList.add('cutout-ready')}},'image/png');
   }catch{ /* Permission denied by image host, keep original intact. */ }
 };
 im.onerror=()=>{};im.src=u;
 }
 const scan=node=>{if(node.nodeType!==1)return;if(visibleImg(node)){io?io.observe(node):enhance(node)}node.querySelectorAll?.('img.img-raster,img.img-transparent,img.directory-bottle,img.cart-bottle,img.search-hit-bottle,img.menu-preview-bottle').forEach(x=>io?io.observe(x):enhance(x))};
 scan(document.body);new MutationObserver(records=>{for(const rec of records)for(const n of rec.addedNodes)scan(n)}).observe(document.body,{subtree:true,childList:true});
})();

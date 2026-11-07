from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageEnhance,ImageFilter
import json,hashlib,random,os
root=Path(__file__).parent
items=json.loads((root/'products-index.json').read_text())
materials=['citrus','rose','oud','lavender','amber','vanilla','saffron','sea','vetiver','jasmine','sandal','berries','leather','tobacco','tonka','incense']
words={
'citrus':['лимон','грейпфрут','апельсин','бергамот','мандарин','цитрус','помело','клементин','лайм','юдзу','опунци'],
'rose':['роз','цвет','пион','цветоч','герань','дурман','гибискус','магноли'],
'oud':['уд','агар','гваяк','кедр','древес','хиноки','махагон','дуб','берёз'],
'lavender':['лаванд','шалфей','тимьян','мята','базилик','розмарин'],
'amber':['амбр','смол','лабдан','бальзам','бензоин','стиракс','мирра'],
'vanilla':['ванил','слад','пралине','маршмеллоу','сахар','крем','круассан','торт','блин','какао','медов'],
'saffron':['шафран','гвоздик','корица','перец','кардамон','мускат','анис'],
'sea':['море','морск','водорос','озон','вод','дожд','петрикор','влаж'],
'vetiver':['ветив','трава','петитгрейн','пачул','земл','мох','сено'],
'jasmine':['жасмин','лилия','фрезия','ландыш','ирис','флёрдоранж','фиалк'],
'sandal':['сандал','дерев','палисандр','папирус','топол','хвоя'],
'berries':['малин','клубник','ежевик','смородин','вишн','груш','яблок','личи','персик','слив','фрукт','дын','ананас'],
'leather':['кож','замш','металл','резин','латекс','бензин'],
'tobacco':['табак','дым','порох','пепел','сигар','костер'],
'tonka':['тонка','мед','карамел','шоколад','какао','кашт','миндал'],
'incense':['ладан','олибан','копай','мускус','наргамот','наг чамп','дым','пихт'],
}
lookup={m:Image.open(root/'assets/note-photos'/f'{m}.webp').convert('RGB') for m in materials}
portraits=root/'assets/note-portraits';collages=root/'assets/note-collages';portraits.mkdir(exist_ok=True);collages.mkdir(exist_ok=True)
for p in items:
 notephotos=[]
 used=[]
 for layer,noteArr in enumerate(p['notes']):
  matches=[]
  for word in noteArr:
   st=word.lower()
   for m,stems in words.items():
    if any(x in st for x in stems):matches.append(m)
  keys=[]
  for m in matches:
   if m not in keys:keys.append(m)
  keys=[m for m in keys if m not in used]+[m for m in keys if m in used]
  if keys:
   mat=keys[0]
  else:
   i=int(hashlib.sha1((p['id']+str(layer)).encode()).hexdigest(),16)%len(materials)
   mat=materials[i]
  used.append(mat)
  src=lookup[mat]
  new=ImageOps.fit(src,(800,560),method=Image.Resampling.LANCZOS,centering=(.5,.43))
  # tone lightly tailored across each fragrance for unique atmospheric triptychs
  rseed=int(hashlib.sha1((p['id']+str(layer)).encode()).hexdigest()[:8],16)
  factor=.89+(rseed%21)/100
  new=ImageEnhance.Color(new).enhance(factor)
  ImageDraw.Draw(new,'RGBA').rectangle((0,0,800,560), fill=(25,15,9,14))
  new.save(portraits/f"{p['id']}-{layer}.webp",quality=82,method=6)
  notephotos.append(new)
 # collage: three adjacent editorial images, different for every product
 W,H=1200,640
 canvas=Image.new('RGB',(W,H),(26,20,16))
 for i,nimg in enumerate(notephotos):
  cropped=ImageOps.fit(nimg,(440,H),method=Image.Resampling.LANCZOS)
  canvas.paste(cropped,(i*400,0))
 # warm vignette for unified narrative photography
 layer=Image.new('RGBA',(W,H),(0,0,0,0));draw=ImageDraw.Draw(layer)
 for y in range(H):
  a=int(75*(y/H)**2)
  draw.line([(0,y),(W,y)],fill=(14,10,8,a))
 canvas=Image.alpha_composite(canvas.convert('RGBA'),layer).convert('RGB')
 canvas.save(collages/f"{p['id']}.webp",quality=80,method=6)
print('note photos:',len(list(portraits.glob('*.webp'))),'unique collages:',len(list(collages.glob('*.webp'))))

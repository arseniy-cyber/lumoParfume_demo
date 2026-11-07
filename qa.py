from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading,time
root=Path(__file__).parent
srv=ThreadingHTTPServer(('127.0.0.1',8995),partial(SimpleHTTPRequestHandler,directory=str(root)));threading.Thread(target=srv.serve_forever,daemon=True).start()
errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(1440,900),(390,844)]:
  ctx=b.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
  pg=ctx.new_page()
  pg.on('pageerror',lambda e:errors.append(str(e)))
  for page in ['index','catalog','brands','brand','product','favorites','cart','selection','about']:
   url=f'http://127.0.0.1:8995/{page}.html'
   if page=='product':url+='?id=toskovat-15'
   if page=='brand':url+='?brand=toskovat'
   pg.goto(url,wait_until='domcontentloaded',timeout=30000)
   pg.wait_for_timeout(240)
   print(width,page, 'horiz',pg.evaluate('document.documentElement.scrollWidth-innerWidth'), 'chars',len(pg.locator('#app').inner_text()), 'title',pg.title())
   if page in ['index','catalog','product']:
    pg.screenshot(path=str(root/f'qa-{page}-{width}.png'),full_page=page=='product',animations='disabled')
   if page=='catalog':
    pg.locator('#catalog-q').fill('Toskovat'); pg.wait_for_timeout(100)
    print(' SEARCH',pg.locator('#products-count').inner_text());pg.locator('#reset-filter').click(); pg.wait_for_timeout(90)
    pg.locator('.f-select-trigger').first.click();print(' SELECT',pg.locator('.f-option').count())
   if page=='product':
    print(' PYRAMID',pg.locator('.pyramid-note-card').count(), 'NOTESPHOTO',pg.locator('.pyramid-note-card img').count(), 'SOURCE',pg.locator('.note-sourcing a').count())
    pg.locator('[data-cart]').first.click(); pg.wait_for_timeout(70);print(' ADDED',pg.locator('[data-count-cart]').first.inner_text())
   if page=='index':
    print(' HERO DOM BOTTLES',pg.locator('.hero-v6 img').count(),'MIDDLE PHOTO',pg.locator('.manifest-v6-photo').count())
  ctx.close()
 b.close()
print('ERRORS',len(errors),errors[:15])
srv.shutdown()

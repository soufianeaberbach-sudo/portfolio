import urllib.request,urllib.parse,json,pathlib,re,html
out=pathlib.Path('.qa-director/rtw-v')
titles=['Design Sketch by Sybil Connolly, Many Pannelled Dress.tiff','Design Sketch by Sybil Connolly, Carrickmacross Lace Dress.tiff','Pattern drawing of a dress (ST656-1) - MoMu Antwerp Study Collection.svg','Pattern of a slip (underwear)(ST650-3)- MoMu Antwerp Study Collection. Made during a MoMu Pattern-a-thon.svg','Dynamic 3D Digital Clothing Model by CG Elves Purple.jpg']
for i,title in enumerate(titles):
 url='https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(title.replace(' ','_'),safe='(),:')
 try:
  data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Aberbach-review/1.0'}),timeout=35).read().decode();out.joinpath(f'page-{i}.html').write_text(data)
  m=re.search(r'class="fullMedia".*?href="([^"]+)"',data,re.S);u=html.unescape(m[1]);print(i,u,flush=True);out.joinpath(f'url-{i}.txt').write_text(u)
  for field in ['licensetpl_short','licensetpl_link','fileinfotpl_aut','fileinfotpl_src']:
   print(field,re.findall('.{0,50}'+field+'.{0,300}',data)[:2],flush=True)
  with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Aberbach-review/1.0'}),timeout=35) as r:content=r.read();print('Downloaded',len(content),r.headers.get('Content-Type'),flush=True);out.joinpath(f'original-{i}'+pathlib.Path(urllib.parse.unquote(u)).suffix).write_bytes(content)
 except Exception as e:print(i,type(e).__name__,str(e),flush=True)

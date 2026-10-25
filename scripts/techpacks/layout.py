"""Build printable HTML from editable JSON/SVG. Does not invent garment data."""
from pathlib import Path
import json,html,base64
R=Path(__file__).resolve().parents[2]
OUT=R/'.work/techpacks';OUT.mkdir(parents=True,exist_ok=True)
E=lambda x:html.escape(str(x))
def bullets(items):return '<ul>'+''.join('<li>'+E(x)+'</li>' for x in items)+'</ul>'
def table(head,rows,widths=None,cls=''):
 cols='<colgroup>'+''.join(f'<col style="width:{x}%">' for x in widths)+'</colgroup>' if widths else ''
 return f'<table class="{cls}">{cols}<thead><tr>'+''.join('<th>'+E(x)+'</th>' for x in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+str(x)+'</td>' for x in row)+'</tr>' for row in rows)+'</tbody></table>'
def fig(folder,name,cls=''):
 s=(folder/'drawings'/name).read_text()
 # IDs must be unique when several editable SVGs share one HTML page.
 prefix=name.replace('.svg','').replace('/','-')
 for id in ['arrow','stripe']:s=s.replace(f'id="{id}"',f'id="{prefix}-{id}"').replace(f'url(#{id})',f'url(#{prefix}-{id})')
 return f'<div class="drawing {cls}">{s}</div>'
def paragraph(t,cls=''):return f'<p class="{cls}">{E(t)}</p>'

CSS='''
@page{size:A4 landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;color:#202622;background:white;font-family:Inter,Arial,sans-serif;font-size:9pt;line-height:1.42}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.sheet{width:297mm;height:210mm;padding:9mm 13mm 12mm;position:relative;page-break-after:always;overflow:hidden}.sheet:last-child{page-break-after:auto}header{height:11mm;border-bottom:.35mm solid #24372e;display:flex;justify-content:space-between;align-items:flex-start}header strong{font-family:Archivo,Arial,sans-serif;font-size:13pt;letter-spacing:.13em}header span,.mono{font-family:'JetBrains Mono',monospace;font-size:7.3pt;letter-spacing:.05em}header span{text-align:right;color:#53635a}.sectionhead{height:21mm;padding-top:5mm}.sectionhead h2{font-family:Archivo,Arial,sans-serif;font-size:21pt;letter-spacing:-.025em;line-height:1.05;margin:0 0 2mm}.sectionhead p{margin:0;color:#627067;font-size:8.3pt}.content{height:153mm}.cover .sectionhead{height:28mm}.cover .content{height:146mm}.cover h2{font-size:34pt}.coverlayout{display:grid;grid-template-columns:1.9fr 1fr;gap:8mm;height:128mm}.pair{display:grid;grid-template-columns:1fr 1fr;gap:3mm;height:100%;align-items:start}.drawing{min-height:0;height:100%;width:100%;display:flex;align-items:center;justify-content:center}.drawing svg{height:100%;max-width:100%;overflow:visible}.flatpair{height:119mm}.viewcaption{text-align:center;font-family:'JetBrains Mono',monospace;font-size:7pt;color:#68736b;margin:2mm 0}.pairfigure{height:100%;display:flex;flex-direction:column}.pairfigure .drawing{flex:1;min-height:0}.intro{border-left:.25mm solid #bac3bc;padding-left:6mm;align-self:center}.eyebrow{font-family:'JetBrains Mono',monospace;font-size:8pt;letter-spacing:.08em;color:#587063;text-transform:uppercase}.intro h3{font-size:17pt;line-height:1.2;margin:3mm 0 4mm;font-family:Archivo,Arial,sans-serif}.intro p{font-size:9pt;margin:3mm 0}.pill{background:#edf1ec;border-left:1mm solid #5d7966;padding:3mm 4mm;font-size:8.5pt}.status{font-family:'JetBrains Mono',monospace;font-size:7.3pt;color:#64786b;margin-top:4mm}.legend{display:flex;gap:7mm;border-top:.2mm solid #cbd1c9;padding-top:3mm;margin-top:4mm;color:#607065;font-size:7.5pt}.legend span{flex:1}.legend b{font-weight:600;color:#24372e}footer{position:absolute;bottom:6mm;left:13mm;right:13mm;display:flex;justify-content:space-between;border-top:.2mm solid #c3cbc4;padding-top:2mm;font-family:'JetBrains Mono',monospace;font-size:6.8pt;color:#647067}h3{font-size:11pt;margin:0 0 3mm;font-family:Archivo,Arial,sans-serif}p{margin:0 0 3mm}ul,ol{margin:0;padding-left:4.5mm}li{margin:0 0 2.8mm}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8pt;line-height:1.35}th{text-align:left;color:#4e6557;font-family:'JetBrains Mono',monospace;font-size:7pt;letter-spacing:.025em;border-top:.3mm solid #40584a;border-bottom:.25mm solid #8f9e92;padding:2.6mm 2mm;background:#f2f4ef}td{vertical-align:top;border-bottom:.2mm solid #d6dcd5;padding:2.4mm 2mm;overflow-wrap:anywhere}td b{font-weight:600}.small{font-size:8pt;color:#5d6a61}.tiny{font-size:7.2pt;color:#5d6a61}.columns{display:grid;grid-template-columns:1fr 1fr;gap:9mm}.columns.three{grid-template-columns:1fr 1fr 1fr;gap:6mm}.box{padding:4mm;border:.2mm solid #c7d0c6}.box h3{margin-bottom:3mm}.evidence-layout{display:grid;grid-template-columns:1.25fr 1fr;gap:9mm;height:107mm}.colourpair{height:106mm}.source-line{padding:3mm 0;border-top:.2mm solid #c8d0c7;margin-top:4mm;font-size:7.8pt;color:#526258;overflow-wrap:anywhere}.source-line code{font-family:'JetBrains Mono',monospace;font-size:7pt}.colourchip{display:inline-block;width:7mm;height:4mm;vertical-align:middle;border:.2mm solid #6c776e;margin-right:2mm}.construction{display:grid;grid-template-columns:1fr 1.35fr;gap:8mm;height:145mm}.construction .drawing{height:141mm}.operations{font-size:8.4pt}.operation{padding:3mm 0;border-bottom:.2mm solid #cbd3c9}.operation:first-child{padding-top:0}.operation h3{font-size:10pt;margin:0 0 1.5mm}.operation .ref{font-family:'JetBrains Mono',monospace;font-size:7pt;color:#6a776c}.detailgrid{display:grid;grid-template-columns:1fr 1fr;gap:8mm;height:142mm}.detailitem{height:142mm}.detailitem .drawing{height:115mm;border:.2mm solid #d6dcd4}.detailitem p{font-size:8pt;margin-top:3mm}.measure{font-variant-numeric:tabular-nums}.measure td,.measure th{padding:1.25mm 1.8mm;font-size:7.8pt;line-height:1.2}.measure td:nth-child(n+4){text-align:center}.measure .base{background:#eff3ed;font-weight:600}.pomgrid{display:grid;grid-template-columns:1fr 1fr;gap:8mm;height:146mm}.pomitem{display:flex;flex-direction:column;gap:0;min-height:0}.pomitem .drawing{height:87mm;flex:none}.pomitem.dense .drawing{height:77mm}.methods{padding-top:2mm;display:grid;grid-template-columns:1fr 1fr;gap:0 3mm}.methods h3{grid-column:1/-1}.method{font-size:7.6pt;padding:1mm 0;border-bottom:.2mm solid #d4dbd1}.method b{color:#8d4d38}.method span{font-size:7pt;color:#647265}.assembly{font-size:8.5pt}.bodychart td{padding:1mm}.grading{font-size:8pt;line-height:1.28}.grading li{margin-bottom:2mm}.grading h3{margin-bottom:2mm}.grading p{margin-bottom:2mm}.revision{margin-top:4mm}.release{font-size:8.3pt}.release li{margin-bottom:2.1mm}.note-row{margin-top:4mm;padding:3mm 4mm;background:#f2f4ef;font-size:8pt}.swatch-label{font-size:8.3pt;margin-top:3mm}
'''

def build(folder):
 s=json.load(open(folder/'style.json'));sources=json.load(open(folder/'sources.json'));pages=[]
 def page(title,sub,content,cls=''):
  pages.append({'title':title,'sub':sub,'content':content,'cls':cls})
 pair=lambda prefix='': '<div class="pair">'+''.join('<div class="pairfigure">'+fig(folder,f'{prefix}{v}.svg')+f'<p class="viewcaption">{v.upper()} / DEVELOPMENT FLAT</p></div>' for v in ['front','back'])+'</div>'
 cover='<div class="coverlayout"><div>'+pair()+'</div><aside class="intro"><div class="eyebrow">'+E(s['id'])+' / '+E(s['version'])+'</div><h3>'+E(s['subtitle'])+'</h3>'+paragraph(s['fit'])+'<div class="pill">Proposed development specification.<br>Sample validation required.</div>'+paragraph('Base EU 38 · range EU 34–42 · centimetres','small')+paragraph('Technical documentation by ABERBACH. Source garment authorship and physical manufacture are unverified.','small')+'</aside></div>'
 cover+='<div class="legend"><span><b>CONFIRMED</b><br>Source-visible or documented facts only.</span><span><b>PROPOSED</b><br>Engineering, dimensions and grades for first sampling.</span><span><b>TBD</b><br>Supplier, testing and approval information still unresolved.</span></div>'
 page(s['title'],s['subtitle'],cover,'cover')
 colour='<div class="evidence-layout"><div>'+pair('colour-')+'</div><div><h3>Source evidence and colour</h3>'+bullets(s['evidence'])+'<h3 style="margin-top:5mm">Development interpretation</h3>'+bullets(s['assumptions'])+'</div></div>'
 colour+='<div class="swatch-label"><span class="colourchip" style="background:'+s['colour']+'"></span>Source-relative digital colour only. No verified Pantone match. Shell, trims and thread require physical approval.</div>'
 colour+='<div class="source-line"><b>Primary reference:</b> <code>'+E(s['source'])+'</code><br><b>Repository revision:</b> <code>'+sources['ref']+'</code> · '+E(s['sourceIdentity'])+'<br>'+E(sources['provenance'])+'</div>'
 page('Design evidence & colourway','One source colourway / editable coloured flats / no invented approved colour standard',colour)
 rows=[]
 for b in s['bom']:
  rows.append([f'<b>{b["id"]}</b><br>{E(b["item"])}',E(b['specification']),E(b['composition'])+'<br><span class="tiny">'+E(b['colour'])+'</span>',E(b['placement']),f'<b>{E(b["quantity"])}</b> {E(b["unit"])}<br><span class="tiny">{E(b["status"])}</span>'])
 content=table(['ID / component','Technical specification','Composition / colour','Placement','Qty / unit / status'],rows,[17,34,19,18,12])
 content+='<div class="note-row"><b>Consumption basis</b><br>'+E(s['consumption'])+'</div>'+paragraph('Supplier and material codes: TBD for every component. Numeric thread use is a preliminary sewing estimate, not measured consumption. Labels/packing are one set per garment. All BOM entries are PROPOSED.','tiny')
 page('Bill of materials','Garment-specific sourcing and estimated consumption / no nominated supplier',content)
 for view in ['front','back']:
  rows=[o for o in s['operations'] if o['view']==view]
  ops=''.join('<div class="operation"><h3>'+E(o['id'])+' / '+E(o['feature'])+'</h3>'+paragraph(o['method'])+'<div class="ref">BOM '+E(' · '.join(o['bom']))+' / PROPOSED METHOD</div></div>' for o in rows)
  page(view.title()+' construction','Leaders identify actual feature anchors / hidden construction remains proposed','<div class="construction">'+fig(folder,'callouts-'+view+'.svg')+'<div class="operations">'+ops+'</div></div>')
 for off in range(0,len(s['details']),2):
  ds=s['details'][off:off+2]
  items=''.join('<div class="detailitem">'+fig(folder,'details/'+key+'.svg')+'<p><b>'+E(title)+'</b><br>'+E(caption)+'</p></div>' for key,title,caption in ds)
  if len(ds)==1:
   items+='<div class="box"><h3>Pattern interface and sampling controls</h3>'+bullets(s['pattern'])+'<h3 style="margin-top:5mm">Assembly dependency</h3>'+paragraph(s['assembly'][min(off,len(s['assembly'])-1)])+'</div>'
  page('Construction details'+(' / '+str(off//2+1) if len(s['details'])>2 else ''),'Layer relationships and component dimensions / schematic views, not cutting patterns','<div class="detailgrid">'+items+'</div>')
 # Useful values stay visible; methods live beside the corresponding named POM arrows.
 for off in range(0,len(s['poms']),20):
  part=s['poms'][off:off+20];rows=[]
  for p in part:
   vals=[f'<span>{p["values"][size]:g}</span>' for size in s['sizes']]
   vals[2]=f'<b>{p["values"]["38"]:g}</b>'
   rows.append([f'<b>{p["id"]}</b>',E(p['name']),f'{p["grade"]:+g}',*vals,f'±{p["tolerance"]:g}' if p['tolerance'] else 'minimum'])
  content=table(['POM','Measurement / cm','Step','34','36','38 base','40','42','Tol. cm'],rows,[5,37,8,8,8,8,8,8,10],'measure')
  content+='<div class="note-row"><b>PROPOSED DEVELOPMENT SPECIFICATION — SAMPLE VALIDATION REQUIRED</b><br>Each step is one EU-labelled size. Values = base + (size position − base position) × step. All widths are half-flat unless explicitly marked otherwise. No UK conversion or sample-measured claim. Methods and arrows follow on the POM pages.</div>'
  page('Measurement specification'+f' / {off//20+1}','EU 38 highlighted in bold / full size range calculated independently per POM',content)
 for off in range(0,len(s['pomGroups']),2):
  groups=s['pomGroups'][off:off+2];items=''
  for g in groups:
   methods=''.join('<div class="method"><b>'+E(p['id'])+' / '+E(p['name'])+'</b><br>'+E(p['method'])+'<br><span>'+E(p['kind'])+' · base '+f'{p["base"]:g}'+' cm</span></div>' for p in s['poms'] if p['id'] in g['ids'])
   items+='<div class="pomitem'+(' dense' if len(g['ids'])>4 else '')+'">'+fig(folder,g['file'])+'<div class="methods"><h3>'+E(g['view'].title())+'</h3>'+methods+'</div></div>'
  if len(groups)==1:items+='<div class="box"><h3>Measurement preparation</h3>'+paragraph('Condition and relax garment 24 h. Close all fastenings unless a method specifies otherwise. Lay flat on a level surface; do not stretch knitted parts for relaxed POMs. Use a flexible tape on contour measurements.')+paragraph('Arrows terminate on the defined garment/component endpoints. A component view represents seam-line dimensions unless the method states finished external edges.')+paragraph('Contour rise/armhole/hood measurements follow the curve; straight depth is a separate method. Recheck after laundering and fit changes.')+'</div>'
  page('Points of measurement'+f' / {off//2+1}','Every table ID is drawn exactly once / methods define preparation, datums and endpoints','<div class="pomgrid">'+items+'</div>')
 bodyrows=[[size,str(s['bodyBasis'][size]['bust']),str(s['bodyBasis'][size]['waist']),str(s['bodyBasis'][size]['hip'])] for size in s['sizes']]
 content='<div class="columns grading"><div><h3>Proposed body basis / cm</h3>'+table(['EU label','Bust full','Waist full','Hip full'],bodyrows,None,'bodychart')+paragraph('Adult Womenswear, stature 168 cm; internal development chart only, not an asserted national sizing standard. EU 38 is a document label, not universal body equivalence.','small')+'<h3 style="margin-top:4mm">Fit and grade rationale</h3>'+paragraph(s['fit'])+paragraph('Torso widths grow with body progression; vertical/component grades are smaller or zero. The published per-POM rules, rather than a blanket grade, control this proposal. Test range endpoints before approving a nest.','small')+'<h3>Pattern components / interfaces</h3>'+bullets(s['pattern'])+'</div><div><h3>Assembly order</h3><ol class="assembly">'+''.join('<li>'+E(x)+'</li>' for x in s['assembly'])+'</ol><div class="note-row">No production pattern has been measured or generated by this document. Seam allowances are operation-specific and excluded from finished POM values.</div></div></div>'
 page('Pattern, grading & assembly','Proposed first-sample engineering / sequence follows the actual product type',content)
 content='<div class="columns release"><div><h3>Garment quality checkpoints</h3>'+bullets(s['qc'])+'<h3 style="margin-top:5mm">Development risks / release holds</h3>'+bullets(s['risks'])+'</div><div><h3>Labels and finishing</h3>'+paragraph(s['labels'])+paragraph(s['care'])+'<h3 style="margin-top:4mm">Packing</h3>'+paragraph(s['packaging'])+'<h3 style="margin-top:4mm">Production approval requires</h3>'+paragraph('Owner/source provenance review; measured and fitted prototype; pattern and graded nest approval; material/trim supplier approval; seam and laundering tests; marker verification; label/legal checks and signed sample approval. None is claimed complete.')+table(['Version / date','Revision / validation status'],[[E(x['version']+' / '+x['date']),E(x['change'])+'<br><b>'+E(x['status'])+'</b>'] for x in s['revision']],None,'revision')+'</div></div>'
 page('Quality, labels & revision','Sampling documentation / not approved for bulk production',content)
 sections=[]
 for i,p in enumerate(pages):sections.append(f'<section class="sheet {p["cls"]}" data-page="{i+1}"><header><strong>ABERBACH</strong><span>{E(s["id"])} / V{s["version"]}<br>{E(s["date"])} · {E(s["title"])}</span></header><div class="sectionhead"><h2>{E(p["title"])}</h2><p>{E(p["sub"])}</p></div><main class="content">{p["content"]}</main><footer><span>DEVELOPMENT / SAMPLE VALIDATION REQUIRED</span><span>{i+1:02} / {len(pages):02}</span></footer></section>')
 fonts=''
 # Committed font fixture files keep PDF rendering deterministic/offline.
 for family,pattern in [('Inter','UcC*'),('Archivo','k3k*'),('JetBrains Mono','tDb*')]:
  fs=list((R/'tests/fixtures/fonts').glob(pattern+'.woff2'))
  if fs:
   data=base64.b64encode(fs[-1].read_bytes()).decode();fonts+=f"@font-face{{font-family:'{family}';src:url(data:font/woff2;base64,{data});font-weight:100 900}}"
 (OUT/(s['slug']+'.html')).write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>'+E(s['id']+' '+s['title'])+'</title><style>'+fonts+CSS+'</style><body>'+''.join(sections)+'</body></html>')
 return {'id':s['id'],'slot':s['slot'],'slug':s['slug'],'title':s['title'],'subtitle':s['subtitle'],'pageCount':len(pages),'pdfUrl':f'/techpacks/{s["slug"]}/{s["slug"]}-v0.1.pdf','previewUrl':f'/techpacks/{s["slug"]}/cover.webp','sourceIdentity':s['sourceIdentity'],'status':'Proposed development / sample validation required','sections':[p['title'] for p in pages]}

if __name__=='__main__':
 records=[build(p) for p in sorted((R/'docs/techpacks').iterdir()) if p.is_dir() and (p/'style.json').exists()]
 (R/'src/data/techpacks.json').write_text(json.dumps(records,indent=2)+'\n')
 print(json.dumps([{k:r[k] for k in ['slug','pageCount']} for r in records],indent=2))

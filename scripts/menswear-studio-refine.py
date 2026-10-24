"""Targeted semantic-matte supplementation; never redraw or recolour a garment.

Prepare a separate r02 candidate, inspect it, then apply after primary production.
The original v2 candidate remains intact and is recorded as rejected presentation.
"""
from pathlib import Path
import argparse,copy,importlib.util,json,shutil
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('production',ROOT/'scripts/menswear-studio-production.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
parser=argparse.ArgumentParser();parser.add_argument('operation',choices=['prepare','apply']);parser.add_argument('--look',required=True);parser.add_argument('--view',choices=p.VIEWS,required=True);parser.add_argument('--region',type=int,nargs=4);parser.add_argument('--strategy',choices=['footwear','protected-fabric'],default='footwear');args=parser.parse_args()
candidate_path=p.REVIEW/'refinements'/(args.look+'-'+args.view+'-r02.json')
if args.operation=='prepare':
    assert args.region and not candidate_path.exists(), 'explicit new candidate only'
    original=next(x for x in json.loads(p.ORIGINAL.read_text())['looks'] if x['id']==args.look)
    before=next(x for x in p.state()['looks'] if x['id']==args.look)
    earlier=sorted((p.REVIEW/'refinements').glob(args.look+'-*-r02.json'),key=lambda x:x.stat().st_mtime)
    if earlier:before=json.loads(earlier[-1].read_text())
    primary=Image.open(ROOT/before['views'][args.view]['segmentation']['path'])
    secondary=ROOT/'assets/presentation/menswear-studio-v2-crosscheck'/args.look/(args.view+'.png')
    supplement=Image.open(secondary)
    a=np.asarray(primary).copy();b=np.asarray(supplement)
    left,top,right,bottom=args.region
    support=np.ones(a.shape,dtype=bool)
    constraints=None
    if args.strategy=='protected-fabric':
        prior_alpha=np.asarray(Image.open(ROOT/before['views'][args.view]['alpha']['path']))
        support=prior_alpha>5
        constraints=ndi.binary_erosion((b>247)&support,iterations=1)
        region=np.zeros(a.shape,dtype=bool);region[top:bottom,left:right]=True;constraints &= region
        original_composite=p.compositor.composite
        p.compositor.composite=lambda source,segmentation:original_composite(source,segmentation,foreground_constraints=constraints)
    a[top:bottom,left:right]=np.maximum(a[top:bottom,left:right],np.where(support[top:bottom,left:right],b[top:bottom,left:right],0))
    p.PUBLIC=p.PUBLIC/'refined-r02';p.EVIDENCE=p.EVIDENCE/'refined-r02'
    folder=p.EVIDENCE/args.look;folder.mkdir(parents=True,exist_ok=True)
    archived_secondary=folder/(args.view+'-secondary-segmentation.png');shutil.copyfile(secondary,archived_secondary)
    if constraints is not None:Image.fromarray(constraints.astype(np.uint8)*255).save(folder/(args.view+'-foreground-constraints.png'))
    Image.fromarray(a).save(folder/(args.view+'-segmentation.png'))
    new=copy.deepcopy(before);new['views'][args.view]=p.encode(original,args.view,original[args.view])
    new['views'][args.view]['refinement']={'reason':'Recover pale footwear omitted by the first semantic mask.',
        'region':args.region,'strategy':args.strategy,'method':'Localized independent-model probability supplementation. Pale-fabric constraints are gated by the original refined silhouette to preserve genuine background gaps. Original RGB is immutable in the strengthened trimap core.',
        'processingSHA256':{x.name:p.digest(x) for x in [Path(__file__),ROOT/'scripts/menswear-studio-composite.py']},
        'primarySegmentation':before['views'][args.view]['segmentation'],
        'secondarySegmentation':p.file_record(archived_secondary,supplement.size)}
    if constraints is not None:new['views'][args.view]['refinement']['foregroundConstraints']=p.file_record(folder/(args.view+'-foreground-constraints.png'),supplement.size)
    master=Image.new('RGB',(5400,2700),'white')
    for i,view in enumerate(p.VIEWS):
        with Image.open(ROOT/new['views'][view]['panel']['path']) as image:master.paste(image,(1800*i,0))
    out=p.PUBLIC/args.look;out.mkdir(parents=True,exist_ok=True);path=out/('master-after-'+args.view+'.png');master.save(path,compress_level=4)
    new['master']=p.file_record(path,master.size);new['masterResponsive']=[]
    for width in (900,1800,2700,3600):
        path=out/f'master-after-{args.view}-{width}.webp';master.resize((width,width//2),Image.Resampling.LANCZOS).save(path,'WEBP',lossless=True,quality=100,method=4,exact=True)
        new['masterResponsive'].append(p.file_record(path,(width,width//2)))
    new['status']='EXPORTED_PENDING_VISUAL_REVIEW'
    new['rejectedPresentation']={'view':args.view,'record':before['views'][args.view],'master':before['master'],'reason':'Pale footwear or trim insufficiently protected by the first matte; never activated.'}
    new['rejectedPresentations']=[*before.get('rejectedPresentations',[]),new['rejectedPresentation']]
    p.atomic(candidate_path,new)
    print('Prepared distinct refinement candidate:',candidate_path)
else:
    state=p.state();assert len(state['looks'])==40,'apply only after primary queue finishes'
    candidate=json.loads(candidate_path.read_text())
    for i,look in enumerate(state['looks']):
        if look['id']==args.look:state['looks'][i]=candidate;break
    else:raise ValueError('look identity missing')
    p.atomic(p.REGISTRY,state)
    print('Applied pending-review candidate; original candidate and all native bytes preserved.')

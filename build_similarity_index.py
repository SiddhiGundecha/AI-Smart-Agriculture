"""Build image-embedding similarity index for AI Smart Agriculture."""
import argparse, json
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
try:
    import faiss
except ImportError:
    faiss = None

CLASS_NAMES=["Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___Powdery_mildew","Cherry_(including_sour)___healthy","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust_","Corn_(maize)___Northern_Leaf_Blight","Corn_(maize)___healthy","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Grape___healthy","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper,_bell___Bacterial_spot","Pepper,_bell___healthy","Potato___Early_blight","Potato___Late_blight","Potato___healthy","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___Leaf_scorch","Strawberry___healthy","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato___Tomato_mosaic_virus","Tomato___healthy"]

PLANTDOC_TO_PLANTVILLAGE={"Apple Scab Leaf":"Apple___Apple_scab","Apple leaf":"Apple___healthy","Apple rust leaf":"Apple___Cedar_apple_rust","Bell_pepper leaf":"Pepper,_bell___healthy","Bell_pepper leaf spot":"Pepper,_bell___Bacterial_spot","Blueberry leaf":"Blueberry___healthy","Cherry leaf":"Cherry_(including_sour)___healthy","Corn Gray leaf spot":"Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn leaf blight":"Corn_(maize)___Northern_Leaf_Blight","Corn rust leaf":"Corn_(maize)___Common_rust_","Peach leaf":"Peach___healthy","Potato leaf early blight":"Potato___Early_blight","Potato leaf late blight":"Potato___Late_blight","Raspberry leaf":"Raspberry___healthy","Soyabean leaf":"Soybean___healthy","Squash Powdery mildew leaf":"Squash___Powdery_mildew","Strawberry leaf":"Strawberry___healthy","Tomato Early blight leaf":"Tomato___Early_blight","Tomato Septoria leaf spot":"Tomato___Septoria_leaf_spot","Tomato leaf":"Tomato___healthy","Tomato leaf bacterial spot":"Tomato___Bacterial_spot","Tomato leaf late blight":"Tomato___Late_blight","Tomato leaf mosaic virus":"Tomato___Tomato_mosaic_virus","Tomato leaf yellow virus":"Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato mold leaf":"Tomato___Leaf_Mold","Tomato two spotted spider mites leaf":"Tomato___Spider_mites Two-spotted_spider_mite","grape leaf":"Grape___healthy","grape leaf black rot":"Grape___Black_rot"}
T=transforms.Compose([transforms.Resize((224,224)),transforms.ToTensor(),transforms.Normalize([.485,.456,.406],[.229,.224,.225])])

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--dataset-root',required=True); ap.add_argument('--model-path',default=r'D:\Projects\Agriculture\plant_disease_resnet50_weighted_best.pth'); ap.add_argument('--output-dir',default='.'); ap.add_argument('--max-images',type=int,default=3000); ap.add_argument('--batch-size',type=int,default=32); args=ap.parse_args()
    device=torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    root=Path(args.dataset_root); exts={'.jpg','.jpeg','.png','.webp','.bmp'}
    paths=sorted(p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in exts)[:args.max_images]
    if not paths: raise SystemExit('No images found.')
    model=models.resnet50(weights=None); model.fc=nn.Linear(model.fc.in_features,len(CLASS_NAMES)); ckpt=torch.load(args.model_path,map_location=device); model.load_state_dict(ckpt['model_state_dict']); model.fc=nn.Identity(); model.to(device).eval()
    vectors=[]; metadata=[]; batch=[]; batch_meta=[]
    def flush():
        nonlocal batch,batch_meta
        if not batch:return
        with torch.no_grad(): emb=F.normalize(model(torch.stack(batch).to(device)).flatten(1),p=2,dim=1).cpu().numpy().astype('float32')
        vectors.append(emb); metadata.extend([{'path':str(p),'label':PLANTDOC_TO_PLANTVILLAGE.get(p.parent.name,p.parent.name)} for p in batch_meta]); batch=[]; batch_meta=[]
    for path in paths:
        try: batch.append(T(Image.open(path).convert('RGB'))); batch_meta.append(path)
        except Exception as exc: print('Skip:',path,exc)
        if len(batch)>=args.batch_size: flush()
    flush()
    matrix=np.vstack(vectors).astype('float32'); out=Path(args.output_dir); out.mkdir(parents=True,exist_ok=True)
    np.save(out/'similarity_embeddings.npy',matrix); (out/'similarity_metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
    if faiss is not None:
        index=faiss.IndexFlatIP(matrix.shape[1]); index.add(matrix); faiss.write_index(index,str(out/'similarity_index.faiss')); print('FAISS index written:',len(metadata),'images')
    else: print('FAISS not installed; NumPy cosine-similarity fallback saved.')
    print('Output:',out.resolve())
if __name__=='__main__': main()

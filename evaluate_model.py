"""Evaluate ResNet50 on a folder dataset and save metrics/report."""
import argparse,json
from pathlib import Path
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models,transforms
from sklearn.metrics import classification_report,confusion_matrix,accuracy_score,f1_score,precision_score,recall_score
CLASS_NAMES=["Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___Powdery_mildew","Cherry_(including_sour)___healthy","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust_","Corn_(maize)___Northern_Leaf_Blight","Corn_(maize)___healthy","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Grape___healthy","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper,_bell___Bacterial_spot","Pepper,_bell___healthy","Potato___Early_blight","Potato___Late_blight","Potato___healthy","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___Leaf_scorch","Strawberry___healthy","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato___Tomato_mosaic_virus","Tomato___healthy"]

PLANTDOC_TO_PLANTVILLAGE={
"Apple Scab Leaf":"Apple___Apple_scab","Apple leaf":"Apple___healthy","Apple rust leaf":"Apple___Cedar_apple_rust",
"Bell_pepper leaf":"Pepper,_bell___healthy","Bell_pepper leaf spot":"Pepper,_bell___Bacterial_spot","Blueberry leaf":"Blueberry___healthy",
"Cherry leaf":"Cherry_(including_sour)___healthy","Corn Gray leaf spot":"Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn leaf blight":"Corn_(maize)___Northern_Leaf_Blight","Corn rust leaf":"Corn_(maize)___Common_rust_",
"Peach leaf":"Peach___healthy","Potato leaf early blight":"Potato___Early_blight","Potato leaf late blight":"Potato___Late_blight","Raspberry leaf":"Raspberry___healthy","Soyabean leaf":"Soybean___healthy",
"Squash Powdery mildew leaf":"Squash___Powdery_mildew","Strawberry leaf":"Strawberry___healthy","Tomato Early blight leaf":"Tomato___Early_blight","Tomato Septoria leaf spot":"Tomato___Septoria_leaf_spot",
"Tomato leaf":"Tomato___healthy","Tomato leaf bacterial spot":"Tomato___Bacterial_spot","Tomato leaf late blight":"Tomato___Late_blight","Tomato leaf mosaic virus":"Tomato___Tomato_mosaic_virus",
"Tomato leaf yellow virus":"Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato mold leaf":"Tomato___Leaf_Mold","Tomato two spotted spider mites leaf":"Tomato___Spider_mites Two-spotted_spider_mite",
"grape leaf":"Grape___healthy","grape leaf black rot":"Grape___Black_rot"}
T=transforms.Compose([transforms.Resize((224,224)),transforms.ToTensor(),transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--data-root',required=True); ap.add_argument('--model-path',default=r'D:\Projects\Agriculture\plant_disease_resnet50_weighted_best.pth'); ap.add_argument('--output',default='evaluation_report.json'); ap.add_argument('--batch-size',type=int,default=32); args=ap.parse_args()
    device=torch.device('cuda' if torch.cuda.is_available() else 'cpu'); model=models.resnet50(weights=None); model.fc=nn.Linear(model.fc.in_features,len(CLASS_NAMES)); ckpt=torch.load(args.model_path,map_location=device); model.load_state_dict(ckpt['model_state_dict']); model.to(device).eval()
    root=Path(args.data_root); exts={'.jpg','.jpeg','.png','.webp','.bmp'}; paths=[p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in exts]; label_to_idx={c:i for i,c in enumerate(CLASS_NAMES)}; ys=[];ps=[];skipped=0
    for start in range(0,len(paths),args.batch_size):
        xs=[];yb=[]
        for p in paths[start:start+args.batch_size]:
            label=p.parent.name
            label=PLANTDOC_TO_PLANTVILLAGE.get(label,label)
            if label not in label_to_idx: skipped+=1; continue
            try: xs.append(T(Image.open(p).convert('RGB'))); yb.append(label_to_idx[label])
            except Exception: skipped+=1
        if not xs: continue
        with torch.no_grad(): pred=model(torch.stack(xs).to(device)).argmax(1).cpu().tolist()
        ys.extend(yb);ps.extend(pred)
    used=sorted(set(ys)|set(ps)); names=[CLASS_NAMES[i] for i in used]; report=classification_report(ys,ps,labels=used,target_names=names,output_dict=True,zero_division=0)
    result={'dataset_root':str(root),'images_found':len(paths),'evaluated_images':len(ys),'skipped':skipped,'accuracy':accuracy_score(ys,ps),'macro_f1':f1_score(ys,ps,average='macro',zero_division=0),'macro_precision':precision_score(ys,ps,average='macro',zero_division=0),'macro_recall':recall_score(ys,ps,average='macro',zero_division=0),'classification_report':report,'confusion_matrix':confusion_matrix(ys,ps,labels=used).tolist(),'classes_evaluated':names}
    Path(args.output).write_text(json.dumps(result,indent=2),encoding='utf-8')
    try:
        import matplotlib.pyplot as plt
        from sklearn.metrics import ConfusionMatrixDisplay
        fig, ax = plt.subplots(figsize=(12,10))
        ConfusionMatrixDisplay(confusion_matrix=confusion_matrix(ys,ps,labels=used), display_labels=names).plot(ax=ax, xticks_rotation=90, colorbar=False)
        fig.tight_layout(); fig.savefig(Path(args.output).with_suffix('.png'), dpi=160); plt.close(fig)
    except Exception as exc:
        print('Could not save confusion-matrix PNG:', exc)
    print(json.dumps({k:result[k] for k in ['evaluated_images','accuracy','macro_f1','macro_precision','macro_recall','skipped']},indent=2))
if __name__=='__main__':main()

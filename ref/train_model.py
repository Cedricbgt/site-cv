import json, sys, numpy as np, base64
from scipy import ndimage
from sklearn.neural_network import MLPClassifier
src=sys.argv[1]; out=sys.argv[2]
X=[];Y=[]
for d in range(10):
    a=np.array(json.load(open(f"{src}/{d}.json"))["data"],dtype=np.float32).reshape(-1,28,28)
    X.append(a);Y+= [d]*len(a)
X=np.concatenate(X);Y=np.array(Y)
print(X.shape)
rng=np.random.default_rng(0)
def aug(img):
    ang=rng.uniform(-15,15); img=ndimage.rotate(img,ang,reshape=False,order=1)
    if rng.random()<0.5: img=ndimage.grey_dilation(img,size=(2,2))
    z=rng.uniform(0.85,1.1); 
    img2=ndimage.zoom(img,z,order=1); h=img2.shape[0]
    c=np.zeros((28,28),np.float32)
    if h>=28: o=(h-28)//2; c=img2[o:o+28,o:o+28]
    else: o=(28-h)//2; c[o:o+h,o:o+h]=img2
    c=ndimage.shift(c,(rng.integers(-2,3),rng.integers(-2,3)),order=0)
    return np.clip(c,0,1)
def ds(a): return a.reshape(-1,14,2,14,2).mean(axis=(2,4)).reshape(len(a),-1)
XA=np.concatenate([X]+[np.stack([aug(i) for i in X]) for _ in range(2)]); YA=np.concatenate([Y]*3)
idx=rng.permutation(len(XA)); XA=ds(XA[idx]); YA=YA[idx]
n=int(len(XA)*0.9)
m=MLPClassifier(hidden_layer_sizes=(64,),max_iter=60,alpha=1e-3,random_state=0)
m.fit(XA[:n],YA[:n]); print("val",m.score(XA[n:],YA[n:]))
def q(a):
    s=float(np.abs(a).max())/127; return {"s":s,"d":base64.b64encode(np.round(a/s).astype(np.int8).tobytes()).decode(),"shape":list(a.shape)}
W1,W2=m.coefs_; b1,b2=m.intercepts_
# check quantized acc
def deq(o): return np.frombuffer(base64.b64decode(o["d"]),np.int8).astype(np.float32).reshape(o["shape"])*o["s"]
w1,w2=deq(q(W1)),deq(q(W2))
p=(np.maximum(XA[n:]@w1+b1,0)@w2+b2).argmax(1); print("q val",(p==YA[n:]).mean())
json.dump({"w1":q(W1),"w2":q(W2),"b1":[round(float(v),4) for v in b1],"b2":[round(float(v),4) for v in b2]},open(out,"w"))

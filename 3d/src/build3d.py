#!/usr/bin/env python3
# Builds site/3d/index.html from the 2D game (../index.html) + 3D renderer (r3.js). Re-run after 2D updates.
import re,sys,os,time
D=os.path.dirname(os.path.abspath(__file__));SRC=os.path.join(D,'..','index.html');OUT=os.path.join(D,'..','site','3d')
s=open(SRC).read()
def rep(a,b,cnt=1):
    global s
    if s.count(a)<1: sys.exit('patch anchor missing: '+a[:80])
    s=s.replace(a,b,cnt)
rep('<link rel="manifest" href="manifest.webmanifest">','<link rel="manifest" href="manifest.webmanifest"><title>Death Dungeon 3D (beta)</title>')
rep('href="icons/','href="../icons/',10)
rep('canvas{touch-action:none;','#c{position:relative;z-index:2;background:transparent}#r3c{position:fixed;z-index:1;pointer-events:none;display:none}canvas{touch-action:none;')
rep('<body><canvas id="c"','<body><script type="module" src="r3.js?v=__VER__"></script><canvas id="c"')
# world render hook
a='X.save();X.scale(ZM,ZM);X.translate(-Math.round(cx),-Math.round(cy));'
rep(a,"if(window.R3&&R3.ok&&state!='cut'){X.clearRect(0,0,W,H);R3.frame(t,cm,SH)}else{"+a)
rep(' light25(t,cx,cy,seen);\n',' light25(t,cx,cy,seen);}\n')
rep('update(dt);if(state==\'cut\')','update(dt);if(window.R3)R3.pre();if(state==\'cut\')')
rep('draw(t);requestAnimationFrame(loop)}','draw(t);if(window.R3)R3.post();requestAnimationFrame(loop)}')
rep("txt('The tale of Iky & Blue',W/2,215,22,'#d8c7a0');","txt('The tale of Iky & Blue',W/2,215,22,'#d8c7a0');txt('3D  (beta)',W/2,245,18,'#8ef');")
ver='3d-'+time.strftime('%Y%m%d%H%M%S')
s=s.replace('__VER__',ver)
open(os.path.join(OUT,'index.html'),'w').write(s)
r=open(os.path.join(D,'r3.js')).read();open(os.path.join(OUT,'r3.js'),'w').write(r)
w=open(os.path.join(D,'sw3d.js')).read().replace('__VER__',ver);open(os.path.join(OUT,'sw.js'),'w').write(w)
open(os.path.join(OUT,'manifest.webmanifest'),'w').write(open(os.path.join(D,'manifest3d.webmanifest')).read())
print('built',ver,len(s))

import { useRef, useEffect } from 'react'

// ── Soap bubbles WebGL shader ──────────────────────────────────────────────────

const VERT_SRC = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG_SRC_NORMAL = `
precision mediump float;
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_bubbleCount;
uniform float u_bubbleSize;
uniform float u_animationIntensity;

vec2 uv;

vec2 hash2a(vec2 x, float anim) {
    float r = 523.0 * sin(dot(x, vec2(53.3158, 43.6143)));
    float xa1 = fract(anim);
    float xb1 = anim - xa1;
    anim += 0.5;
    float xa2 = fract(anim);
    float xb2 = anim - xa2;
    vec2 z1 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1)));
    r = r + 1.0;
    vec2 z2 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1)));
    r = r + 1.0;
    vec2 z3 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));
    r = r + 1.0;
    vec2 z4 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));
    return (mix(z1,z2,xa1)+mix(z3,z4,xa2))*0.5;
}

float hashNull(vec2 x) {
    return fract(523.0*sin(dot(x,vec2(53.3158,43.6143))));
}

vec4 NC0 = vec4(0.0,157.0,113.0,270.0);
vec4 NC1 = vec4(1.0,158.0,114.0,271.0);

vec4 hash4(vec4 n) { return fract(sin(n)*753.5453123); }
vec2 hash2(vec2 n)  { return fract(sin(n)*753.5453123); }

float noise2(vec2 x) {
    vec2 p=floor(x); vec2 f=fract(x);
    f=f*f*(3.0-2.0*f);
    float n=p.x+p.y*157.0;
    vec2 s1=mix(hash2(vec2(n)+NC0.xy),hash2(vec2(n)+NC1.xy),vec2(f.x));
    return mix(s1.x,s1.y,f.y);
}

vec4 booble(vec2 te, vec2 pos, float numCells) {
    float d=dot(te,te);
    vec2 te1=te+(pos-vec2(0.5,0.5))*0.4/numCells;
    vec2 te2=-te1;
    float zb1=max(pow(noise2(te2*1000.11*d),10.0),0.01);
    float zb2=noise2(te1*1000.11*d);
    float zb3=noise2(te1*200.11*d);
    float zb4=noise2(te1*200.11*d+vec2(20.0));
    vec4 colorb=vec4(1.0);
    colorb.xyz=colorb.xyz*(0.7+noise2(te1*1000.11*d)*0.3);
    zb2=max(pow(zb2,20.1),0.01);
    colorb.xyz=colorb.xyz*(zb2*1.9);
    vec4 color=vec4(noise2(te2*10.8),noise2(te2*9.5+vec2(15.0,15.0)),noise2(te2*11.2+vec2(12.0,12.0)),1.0);
    color=mix(color,vec4(1.0),noise2(te2*20.5+vec2(200.0,200.0)));
    color.xyz=color.xyz*(0.7+noise2(te2*1000.11*d)*0.3);
    color.xyz=color.xyz*(0.2+zb1*1.9);
    float r1=max(min((0.033-min(0.04,d))*100.0/sqrt(numCells),1.0),-1.6);
    float d2=(0.06-min(0.06,d))*10.0;
    d=(0.04-min(0.04,d))*10.0;
    color.xyz=color.xyz+colorb.xyz*d*1.5;
    float f1=min(d*10.0,0.5-d)*2.2; f1=pow(f1,4.0);
    float f2=min(min(d*4.1,0.9-d)*2.0*r1,1.0);
    float f3=min(d2*2.0,0.7-d2)*2.2; f3=pow(f3,4.0);
    return vec4(color*max(min(f1+f2,1.0),-0.5)+vec4(zb3)*f3-vec4(zb4)*(f2*0.5+f1)*0.5);
}

vec4 Cells(vec2 p, vec2 move, in float numCells, in float count, float blur) {
    vec2 inp=p+move; inp*=numCells;
    float d=1.0; vec2 te; vec2 pos;
    for (int xo=-1;xo<=1;xo++) {
        for (int yo=-1;yo<=1;yo++) {
            vec2 tp=floor(inp)+vec2(xo,yo);
            vec2 rr=mod(tp,numCells);
            tp=tp+(hash2a(rr,iTime*0.1*u_speed)+hash2a(rr,iTime*0.1*u_speed+0.25))*0.5;
            vec2 l=inp-tp; float dr=dot(l,l);
            if (hashNull(rr)>count)
                if (d>dr) { d=dr; pos=tp; }
        }
    }
    if (d>=0.06*u_bubbleSize) return vec4(0.0);
    te=inp-pos;
    if (d<0.04*u_bubbleSize) uv=uv+te*(d)*2.0*u_animationIntensity;
    if (blur>0.0001) {
        vec4 c=vec4(0.0);
        for (float x=-1.0;x<1.0;x+=0.5)
            for (float y=-1.0;y<1.0;y+=0.5)
                c+=booble(te+vec2(x,y)*blur,p,numCells);
        return c*0.05;
    }
    return booble(te,p,numCells);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    uv = (fragCoord.xy) / iResolution.y * 0.5;

    vec2 l1 = vec2(iTime*0.02, iTime*0.02) * u_speed;
    vec2 l2 = vec2(-iTime*0.01, iTime*0.007) * u_speed;
    vec2 l3 = vec2(0.0, iTime*0.01) * u_speed;

    float cs = 2.0 / u_bubbleCount;

    vec4 cr1 = Cells(uv, vec2(20.2449,93.78)+l1, 2.0*cs, 0.5, 0.005);
    vec4 cr2 = Cells(uv, vec2(0.0,0.0), 3.0*cs, 0.5, 0.003);
    vec4 cr3 = Cells(uv, vec2(230.79,193.2)+l2, 4.0*cs, 0.5, 0.0);
    vec4 cr4 = Cells(uv, vec2(200.19,393.2)+l3, 7.0*cs, 0.8, 0.01);
    vec4 cr5 = Cells(uv, vec2(10.3245,233.645)+l3, 9.2*cs, 0.9, 0.02);
    vec4 cr6 = Cells(uv, vec2(10.3245,233.645)+l3, 14.2*cs, 0.95, 0.05);

    vec4 bubbles = vec4(0.0);
    bubbles += cr1 * 1.8;
    bubbles += cr2 * 1.4;
    bubbles += cr3 * 1.1;
    bubbles += cr4 * 1.3;
    bubbles += cr5 * 1.6;
    bubbles += cr6 * 1.6;

    fragColor = vec4(bubbles.rgb, max(max(bubbles.r, bubbles.g), bubbles.b));
}

void main() {
    vec4 col;
    mainImage(col, gl_FragCoord.xy);
    gl_FragColor = col;
}
`

const FRAG_SRC_RAINBOW = `
precision mediump float;
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_bubbleCount;
uniform float u_bubbleSize;
uniform float u_animationIntensity;

vec2 uv;

vec2 hash2a(vec2 x, float anim) {
   float r = 523.0 * sin(dot(x, vec2(53.3158, 43.6143)));
   float xa1 = fract(anim);
   float xb1 = anim - xa1;
   anim += 0.5;
   float xa2 = fract(anim);
   float xb2 = anim - xa2;
   vec2 z1 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1)));
   r = r + 1.0;
   vec2 z2 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1)));
   r = r + 1.0;
   vec2 z3 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));
   r = r + 1.0;
   vec2 z4 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));
   return (mix(z1,z2,xa1)+mix(z3,z4,xa2))*0.5;
}

float hashNull(vec2 x) {
   return fract(523.0*sin(dot(x,vec2(53.3158,43.6143))));
}

vec4 NC0 = vec4(0.0,157.0,113.0,270.0);
vec4 NC1 = vec4(1.0,158.0,114.0,271.0);

vec4 hash4(vec4 n) { return fract(sin(n)*753.5453123); }
vec2 hash2(vec2 n)  { return fract(sin(n)*753.5453123); }

float noise2(vec2 x) {
   vec2 p=floor(x); vec2 f=fract(x);
   f=f*f*(3.0-2.0*f);
   float n=p.x+p.y*157.0;
   vec2 s1=mix(hash2(vec2(n)+NC0.xy),hash2(vec2(n)+NC1.xy),vec2(f.x));
   return mix(s1.x,s1.y,f.y);
}

float noise3(vec3 x) {
   vec3 p=floor(x); vec3 f=fract(x);
   f=f*f*(3.0-2.0*f);
   float n=p.x+dot(p.yz,vec2(157.0,113.0));
   vec4 s1=mix(hash4(vec4(n)+NC0),hash4(vec4(n)+NC1),vec4(f.x));
   return mix(mix(s1.x,s1.y,f.y),mix(s1.z,s1.w,f.y),f.z);
}

vec4 booble(vec2 te, vec2 pos, float numCells) {
   float d=dot(te,te);
   vec2 te1=te+(pos-vec2(0.5,0.5))*0.4/numCells;
   vec2 te2=-te1;
   float zb1=max(pow(noise2(te2*1000.11*d),10.0),0.01);
   float zb2=noise2(te1*1000.11*d);
   float zb3=noise2(te1*200.11*d);
   float zb4=noise2(te1*200.11*d+vec2(20.0));
   vec4 colorb=vec4(1.0);
   colorb.xyz=colorb.xyz*(0.7+noise2(te1*1000.11*d)*0.3);
   zb2=max(pow(zb2,20.1),0.01);
   colorb.xyz=colorb.xyz*(zb2*1.9);
   vec4 color=vec4(noise2(te2*10.8),noise2(te2*9.5+vec2(15.0,15.0)),noise2(te2*11.2+vec2(12.0,12.0)),1.0);
   color=mix(color,vec4(1.0),noise2(te2*20.5+vec2(200.0,200.0)));
   color.xyz=color.xyz*(0.7+noise2(te2*1000.11*d)*0.3);
   color.xyz=color.xyz*(0.2+zb1*1.9);
   float r1=max(min((0.033-min(0.04,d))*100.0/sqrt(numCells),1.0),-1.6);
   float d2=(0.06-min(0.06,d))*10.0;
   d=(0.04-min(0.04,d))*10.0;
   color.xyz=color.xyz+colorb.xyz*d*1.5;
   float f1=min(d*10.0,0.5-d)*2.2; f1=pow(f1,4.0);
   float f2=min(min(d*4.1,0.9-d)*2.0*r1,1.0);
   float f3=min(d2*2.0,0.7-d2)*2.2; f3=pow(f3,4.0);
   return vec4(color*max(min(f1+f2,1.0),-0.5)+vec4(zb3)*f3-vec4(zb4)*(f2*0.5+f1)*0.5);
}

vec4 Cells(vec2 p, vec2 move, in float numCells, in float count, float blur) {
   vec2 inp=p+move; inp*=numCells;
   float d=1.0; vec2 te; vec2 pos;
   for (int xo=-1;xo<=1;xo++) {
       for (int yo=-1;yo<=1;yo++) {
           vec2 tp=floor(inp)+vec2(xo,yo);
           vec2 rr=mod(tp,numCells);
           tp=tp+(hash2a(rr,iTime*0.1*u_speed)+hash2a(rr,iTime*0.1*u_speed+0.25))*0.5;
           vec2 l=inp-tp; float dr=dot(l,l);
           if (hashNull(rr)>count)
               if (d>dr) { d=dr; pos=tp; }
       }
   }
   if (d>=0.06*u_bubbleSize) return vec4(0.0);
   te=inp-pos;
   if (d<0.04*u_bubbleSize) uv=uv+te*(d)*2.0*u_animationIntensity;
   if (blur>0.0001) {
       vec4 c=vec4(0.0);
       for (float x=-1.0;x<1.0;x+=0.5)
           for (float y=-1.0;y<1.0;y+=0.5)
               c+=booble(te+vec2(x,y)*blur,p,numCells);
       return c*0.05;
   }
   return booble(te,p,numCells);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
   uv=(fragCoord.xy)/iResolution.y*0.5;
   vec2 l1=vec2(iTime*0.02,iTime*0.02)*u_speed;
   vec2 l2=vec2(-iTime*0.01,iTime*0.007)*u_speed;
   vec2 l3=vec2(0.0,iTime*0.01)*u_speed;
   vec4 e=vec4(noise3(vec3(uv*2.0,iTime*0.1*u_speed)),
               noise3(vec3(uv*2.0+vec2(200.0),iTime*0.1*u_speed)),
               noise3(vec3(uv*2.0+vec2(50.0),iTime*0.1*u_speed)),0.0);
   float cs=2.0/u_bubbleCount;
   vec4 cr1=Cells(uv,vec2(20.2449,93.78)+l1,2.0*cs,0.5,0.005);
   vec4 cr2=Cells(uv,vec2(0.0,0.0),3.0*cs,0.5,0.003);
   vec4 cr3=Cells(uv,vec2(230.79,193.2)+l2,4.0*cs,0.5,0.0);
   vec4 cr4=Cells(uv,vec2(200.19,393.2)+l3,7.0*cs,0.8,0.01);
   vec4 cr5=Cells(uv,vec2(10.3245,233.645)+l3,9.2*cs,0.9,0.02);
   vec4 cr6=Cells(uv,vec2(10.3245,233.645)+l3,14.2*cs,0.95,0.05);
   e=max(e-vec4(dot(cr6,cr6))*0.1,0.0)+cr6*1.6;
   e=max(e-vec4(dot(cr5,cr5))*0.1,0.0)+cr5*1.6;
   e=max(e-vec4(dot(cr4,cr4))*0.1,0.0)+cr4*1.3;
   e=max(e-vec4(dot(cr3,cr3))*0.1,0.0)+cr3*1.1;
   e=max(e-vec4(dot(cr2,cr2))*0.1,0.0)+cr2*1.4;
   e=max(e-vec4(dot(cr1,cr1))*0.1,0.0)+cr1*1.8;
   fragColor=e;
}

void main() {
   vec4 col;
   mainImage(col, gl_FragCoord.xy);
   gl_FragColor = col;
}
`

const FRAG_SRC_BLUE = `
precision mediump float;

uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_bubbleCount;
uniform float u_bubbleSize;
uniform float u_animationIntensity;

vec2 uv;

vec2 hash2a(vec2 x, float anim) {
    float r = 523.0 * sin(dot(x, vec2(53.3158, 43.6143)));
    float xa1 = fract(anim);
    float xb1 = anim - xa1;
    anim += 0.5;
    float xa2 = fract(anim);
    float xb2 = anim - xa2;

    vec2 z1 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1)));
    r += 1.0;
    vec2 z2 = vec2(fract(15.32354*(r+xb1)), fract(17.25865*(r+xb1)));
    r += 1.0;
    vec2 z3 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));
    r += 1.0;
    vec2 z4 = vec2(fract(15.32354*(r+xb2)), fract(17.25865*(r+xb2)));

    return (mix(z1,z2,xa1)+mix(z3,z4,xa2))*0.5;
}

float hashNull(vec2 x) {
    return fract(523.0*sin(dot(x,vec2(53.3158,43.6143))));
}

vec4 NC0 = vec4(0.0,157.0,113.0,270.0);
vec4 NC1 = vec4(1.0,158.0,114.0,271.0);

vec4 hash4(vec4 n) { return fract(sin(n)*753.5453123); }
vec2 hash2(vec2 n) { return fract(sin(n)*753.5453123); }

float noise2(vec2 x) {
    vec2 p=floor(x); vec2 f=fract(x);
    f=f*f*(3.0-2.0*f);
    float n=p.x+p.y*157.0;
    vec2 s1=mix(hash2(vec2(n)+NC0.xy),hash2(vec2(n)+NC1.xy),vec2(f.x));
    return mix(s1.x,s1.y,f.y);
}

vec4 booble(vec2 te, vec2 pos, float numCells) {
    float d = dot(te,te);

    vec2 te1 = te + (pos-vec2(0.5))*0.4/numCells;
    vec2 te2 = -te1;

    float zb1 = max(pow(noise2(te2*1000.11*d),10.0),0.01);
    float zb2 = noise2(te1*1000.11*d);
    float zb3 = noise2(te1*200.11*d);
    float zb4 = noise2(te1*200.11*d+vec2(20.0));

    vec4 colorb = vec4(1.0);
    colorb.xyz *= (0.7 + noise2(te1*1000.11*d)*0.3);

    zb2 = max(pow(zb2,20.1),0.01);
    colorb.xyz *= (zb2*1.9);

    vec4 color = vec4(
        noise2(te2*10.8),
        noise2(te2*9.5+vec2(15.0)),
        noise2(te2*11.2+vec2(12.0)),
        1.0
    );

    color = mix(color, vec4(1.0), noise2(te2*20.5+vec2(200.0)));
    color.xyz *= (0.7 + noise2(te2*1000.11*d)*0.3);
    color.xyz *= (0.2 + zb1*1.9);

    float d2 = (0.06 - min(0.06,d))*10.0;
    d = (0.04 - min(0.04,d))*10.0;

    color.xyz += colorb.xyz*d*1.5;

    float f1 = pow(min(d*10.0,0.5-d)*2.2,4.0);
    float f2 = min(d*4.1,0.9-d)*2.0;
    float f3 = pow(min(d2*2.0,0.7-d2)*2.2,4.0);

    return vec4(color*f1 + vec4(zb3)*f3 - vec4(zb4)*(f2*0.5));
}

vec4 Cells(vec2 p, vec2 move, float numCells, float count, float blur) {
    vec2 inp = (p + move) * numCells;

    float d = 1.0;
    vec2 pos;
    vec2 te;

    for (int xo=-1; xo<=1; xo++) {
        for (int yo=-1; yo<=1; yo++) {
            vec2 tp = floor(inp) + vec2(xo,yo);
            vec2 rr = mod(tp,numCells);

            tp += (hash2a(rr,iTime*0.1*u_speed) + hash2a(rr,iTime*0.1*u_speed+0.25))*0.5;

            vec2 l = inp - tp;
            float dr = dot(l,l);

            if (hashNull(rr)>count && d>dr) {
                d = dr;
                pos = tp;
            }
        }
    }

    if (d >= 0.06*u_bubbleSize) return vec4(0.0);

    te = inp - pos;

    if (d < 0.04*u_bubbleSize)
        uv += te * d * 2.0 * u_animationIntensity;

    return booble(te,p,numCells);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    uv = fragCoord.xy / iResolution.y * 0.5;

    vec2 l1 = vec2(iTime*0.02) * u_speed;
    vec2 l2 = vec2(-iTime*0.01, iTime*0.007) * u_speed;
    vec2 l3 = vec2(0.0, iTime*0.01) * u_speed;

    float cs = 2.0 / u_bubbleCount;

    vec4 bubbles = vec4(0.0);
    bubbles += Cells(uv, vec2(20.2449,93.78)+l1, 2.0*cs, 0.5, 0.0) * 1.8;
    bubbles += Cells(uv, vec2(0.0),            3.0*cs, 0.5, 0.0) * 1.4;
    bubbles += Cells(uv, vec2(230.79,193.2)+l2,4.0*cs, 0.5, 0.0) * 1.1;
    bubbles += Cells(uv, vec2(200.19,393.2)+l3,7.0*cs, 0.8, 0.0) * 1.3;
    bubbles += Cells(uv, vec2(10.3245,233.645)+l3,9.2*cs,0.9, 0.0) * 1.6;
    bubbles += Cells(uv, vec2(10.3245,233.645)+l3,14.2*cs,0.95,0.0) * 1.6;

    float intensity = length(bubbles.rgb);
    vec3 color = vec3(intensity);
    color *= vec3(0.2, 0.6, 1.0);

    float alpha = smoothstep(0.0, 0.25, intensity);
    alpha = pow(alpha, 0.7);
    alpha = max(alpha, 0.12);

    fragColor = vec4(color, alpha);
}

void main() {
    vec4 col;
    mainImage(col, gl_FragCoord.xy);
    gl_FragColor = col;
}
`

const FRAG_SRCS = {
  normal:  FRAG_SRC_NORMAL,
  rainbow: FRAG_SRC_RAINBOW,
  blue:    FRAG_SRC_BLUE,
}

function compileShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}

function SoapBubbles({ pos = 'fixed', variant = 'normal' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false }) || canvas.getContext('experimental-webgl', { premultipliedAlpha: false })
    if (!gl) return

    const fragSrc = FRAG_SRCS[variant] || FRAG_SRC_NORMAL

    const vert = compileShader(gl, gl.VERTEX_SHADER,   VERT_SRC)
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
    const prog = gl.createProgram()
    gl.attachShader(prog, vert)
    gl.attachShader(prog, frag)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime      = gl.getUniformLocation(prog, 'iTime')
    const uRes       = gl.getUniformLocation(prog, 'iResolution')
    const uSpeed     = gl.getUniformLocation(prog, 'u_speed')
    const uCount     = gl.getUniformLocation(prog, 'u_bubbleCount')
    const uSize      = gl.getUniformLocation(prog, 'u_bubbleSize')
    const uIntensity = gl.getUniformLocation(prog, 'u_animationIntensity')

    gl.uniform1f(uSpeed,     1.0)
    gl.uniform1f(uCount,     1.0)
    gl.uniform1f(uSize,      1.0)
    gl.uniform1f(uIntensity, 1.0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    let raf
    let start = null

    function resize() {
      const w = canvas.clientWidth  || canvas.offsetWidth  || 300
      const h = canvas.clientHeight || canvas.offsetHeight || 300
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    function frame(ts) {
      raf = requestAnimationFrame(frame)
      if (!start) start = ts
      resize()
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, (ts - start) / 1000)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: pos, inset: 0, pointerEvents: 'none', zIndex: 0, background: 'transparent' }}
    />
  )
}

export default function BgEffect({ effect, variant = 'normal', pos = 'fixed' }) {
  if (effect === 'soap-bubbles') return <SoapBubbles pos={pos} variant={variant} />
  return null
}

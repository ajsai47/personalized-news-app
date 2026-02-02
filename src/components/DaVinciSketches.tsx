"use client"

// Authentic Leonardo da Vinci notebook style
// Dense scribbles, heavy cross-hatching, overlapping mechanical studies
// Water wheels, Archimedes screws, gears with depth, margin notes

export function DaVinciSketches() {
  // Temporarily disabled - return null
  return null;

  // Generate random scribble text lines (mirror script simulation)
  const scribbleLine = (y: number, width: number, variance: number = 0) => {
    const segments = Math.floor(width / 8);
    let d = `M0,${y}`;
    for (let i = 1; i <= segments; i++) {
      const x = i * 8;
      const yVar = y + (Math.sin(i * 1.3 + variance) * 1.5) + (Math.random() - 0.5);
      d += ` L${x},${yVar}`;
    }
    return d;
  };

  return (
    <div className="davinci-sketches-container">
      {/* ====== LEFT SIDEBAR ====== */}
      <div className="davinci-sidebar davinci-sidebar-left">

        {/* Large Water Wheel Assembly - Main Study */}
        <svg className="sketch-layer" viewBox="0 0 280 400" style={{ position: 'absolute', top: '0%', left: '-20px', width: '280px', height: '400px' }}>
          <defs>
            <pattern id="hatchDense" patternUnits="userSpaceOnUse" width="2.5" height="2.5" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="2.5" stroke="#3D2914" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
            <pattern id="hatchLight" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(-30)">
              <line x1="0" y1="0" x2="0" y2="3" stroke="#3D2914" strokeWidth="0.35" opacity="0.4"/>
            </pattern>
            <pattern id="crossHatch" patternUnits="userSpaceOnUse" width="3" height="3">
              <line x1="0" y1="0" x2="3" y2="3" stroke="#3D2914" strokeWidth="0.4" opacity="0.5"/>
              <line x1="3" y1="0" x2="0" y2="3" stroke="#3D2914" strokeWidth="0.4" opacity="0.5"/>
            </pattern>
          </defs>

          <g stroke="#3D2914" fill="none" opacity="0.75">
            {/* Main large water wheel */}
            <circle cx="140" cy="120" r="85" strokeWidth="1.5"/>
            <circle cx="140" cy="120" r="82" strokeWidth="0.4"/>
            <circle cx="140" cy="120" r="75" strokeWidth="0.8"/>
            <circle cx="140" cy="120" r="70" strokeWidth="0.3" strokeDasharray="2,1"/>
            <circle cx="140" cy="120" r="20" strokeWidth="1.2"/>
            <circle cx="140" cy="120" r="16" strokeWidth="0.5"/>
            <circle cx="140" cy="120" r="8" fill="url(#crossHatch)" strokeWidth="0.8"/>

            {/* Water wheel paddles with depth/3D effect */}
            {[...Array(16)].map((_, i) => {
              const angle = (i * 22.5) * Math.PI / 180;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              return (
                <g key={`paddle-${i}`}>
                  {/* Main paddle */}
                  <path d={`M${140 + 20*cos},${120 + 20*sin}
                            L${140 + 70*cos},${120 + 70*sin}
                            L${140 + 75*cos + 8*sin},${120 + 75*sin - 8*cos}
                            L${140 + 85*cos + 8*sin},${120 + 85*sin - 8*cos}
                            L${140 + 85*cos - 3*sin},${120 + 85*sin + 3*cos}
                            L${140 + 75*cos - 3*sin},${120 + 75*sin + 3*cos}
                            L${140 + 70*cos},${120 + 70*sin}`}
                        strokeWidth="0.7" fill={i % 2 === 0 ? "url(#hatchDense)" : "none"}/>
                  {/* Paddle depth line */}
                  <line x1={140 + 25*cos} y1={120 + 25*sin}
                        x2={140 + 68*cos} y2={120 + 68*sin}
                        strokeWidth="0.3" strokeDasharray="1,2"/>
                </g>
              );
            })}

            {/* Spokes with cross-hatched shadows */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 + 11.25) * Math.PI / 180;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              return (
                <g key={`spoke-${i}`}>
                  <line x1={140 + 8*cos} y1={120 + 8*sin}
                        x2={140 + 68*cos} y2={120 + 68*sin} strokeWidth="2.5"/>
                  <line x1={140 + 10*cos + 2*sin} y1={120 + 10*sin - 2*cos}
                        x2={140 + 65*cos + 2*sin} y2={120 + 65*sin - 2*cos}
                        strokeWidth="0.4" opacity="0.5"/>
                  {/* Cross-hatch shadow */}
                  <path d={`M${140 + 15*cos + 1*sin},${120 + 15*sin - 1*cos}
                            L${140 + 60*cos + 1*sin},${120 + 60*sin - 1*cos}
                            L${140 + 60*cos + 4*sin},${120 + 60*sin - 4*cos}
                            L${140 + 15*cos + 4*sin},${120 + 15*sin - 4*cos} Z`}
                        fill="url(#hatchLight)" strokeWidth="0"/>
                </g>
              );
            })}

            {/* Axle and support structure */}
            <rect x="135" y="115" width="10" height="10" fill="#3D2914" opacity="0.45"/>
            <line x1="140" y1="120" x2="140" y2="220" strokeWidth="2"/>
            <line x1="138" y1="120" x2="138" y2="218" strokeWidth="0.5" opacity="0.5"/>

            {/* Support frame with cross-hatching */}
            <path d="M100,205 L100,250 L180,250 L180,205" strokeWidth="1.2"/>
            <path d="M105,210 L105,245 L175,245 L175,210" strokeWidth="0.4"/>
            <rect x="105" y="215" width="70" height="25" fill="url(#hatchLight)" strokeWidth="0"/>
            <line x1="140" y1="220" x2="140" y2="250" strokeWidth="1.5"/>

            {/* Water flow lines */}
            <path d="M50,180 Q80,185 100,195 Q120,205 135,200" strokeWidth="0.5" strokeDasharray="3,2"/>
            <path d="M45,190 Q75,195 95,205 Q115,215 130,210" strokeWidth="0.4" strokeDasharray="2,2"/>
            <path d="M55,170 Q85,175 105,185 Q125,195 140,190" strokeWidth="0.4" strokeDasharray="2,1"/>

            {/* Dripping water details */}
            {[...Array(8)].map((_, i) => (
              <path key={`drop-${i}`}
                    d={`M${200 + i*8},${140 + i*12} Q${202 + i*8},${150 + i*12} ${200 + i*8},${160 + i*12}`}
                    strokeWidth="0.3" opacity={0.4 - i*0.04}/>
            ))}
          </g>

          {/* Scribbled margin notes - top */}
          <g stroke="#3D2914" fill="none" opacity="0.5" strokeWidth="0.3">
            {[...Array(6)].map((_, i) => (
              <path key={`scrib-top-${i}`} d={scribbleLine(12 + i*5, 120, i*2.5)} transform="translate(20, 0)"/>
            ))}
          </g>

          {/* Scribbled margin notes - side */}
          <g stroke="#3D2914" fill="none" opacity="0.45" strokeWidth="0.25">
            {[...Array(12)].map((_, i) => (
              <path key={`scrib-side-${i}`} d={scribbleLine(260 + i*6, 80, i*1.8)} transform="translate(5, 0)"/>
            ))}
          </g>
        </svg>

        {/* Archimedes Screw / Water Pump */}
        <svg className="sketch-layer" viewBox="0 0 200 320" style={{ position: 'absolute', top: '32%', left: '0', width: '200px', height: '320px' }}>
          <g stroke="#3D2914" fill="none" opacity="0.65">
            {/* Screw housing tube */}
            <path d="M30,280 L80,80" strokeWidth="1.2"/>
            <path d="M70,290 L120,90" strokeWidth="1.2"/>
            <path d="M35,278 L85,78" strokeWidth="0.4" strokeDasharray="2,2"/>

            {/* Spiral thread of the screw */}
            {[...Array(14)].map((_, i) => {
              const y1 = 270 - i * 14;
              const y2 = y1 - 7;
              const xOffset = i * 3.5;
              return (
                <g key={`thread-${i}`}>
                  <ellipse cx={50 + xOffset} cy={y1} rx="22" ry="8" strokeWidth="0.7"/>
                  <path d={`M${28 + xOffset},${y1} Q${50 + xOffset},${y1-12} ${72 + xOffset},${y1}`}
                        strokeWidth="0.5" fill="url(#hatchLight)"/>
                  {/* Thread depth shading */}
                  <path d={`M${35 + xOffset},${y1+2} L${65 + xOffset},${y1+2}`}
                        strokeWidth="0.3" opacity="0.4"/>
                </g>
              );
            })}

            {/* Top mechanism */}
            <circle cx="100" cy="75" r="18" strokeWidth="1"/>
            <circle cx="100" cy="75" r="12" strokeWidth="0.5"/>
            <circle cx="100" cy="75" r="5" fill="url(#crossHatch)" strokeWidth="0.5"/>
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60) * Math.PI / 180;
              return (
                <line key={`crank-${i}`}
                      x1={100 + 5*Math.cos(angle)} y1={75 + 5*Math.sin(angle)}
                      x2={100 + 16*Math.cos(angle)} y2={75 + 16*Math.sin(angle)}
                      strokeWidth="1.5"/>
              );
            })}

            {/* Crank handle */}
            <line x1="100" y1="75" x2="130" y2="60" strokeWidth="1.2"/>
            <circle cx="130" cy="60" r="6" strokeWidth="0.7"/>
            <line x1="130" y1="60" x2="145" y2="50" strokeWidth="0.8"/>
            <circle cx="147" cy="48" r="4" strokeWidth="0.5"/>

            {/* Water basin at bottom */}
            <path d="M10,295 Q50,310 90,295" strokeWidth="0.8"/>
            <path d="M15,290 Q50,302 85,290" strokeWidth="0.4" strokeDasharray="2,1"/>
            {/* Water ripples */}
            <path d="M20,298 Q35,302 50,298 Q65,294 80,298" strokeWidth="0.3"/>
            <path d="M25,302 Q40,305 55,302 Q70,299 85,302" strokeWidth="0.25"/>

            {/* Construction lines */}
            <line x1="50" y1="280" x2="50" y2="70" strokeWidth="0.2" strokeDasharray="4,3" opacity="0.4"/>
            <line x1="30" y1="180" x2="120" y2="180" strokeWidth="0.2" strokeDasharray="4,3" opacity="0.4"/>
          </g>

          {/* Side scribbles */}
          <g stroke="#3D2914" fill="none" opacity="0.45" strokeWidth="0.25">
            {[...Array(8)].map((_, i) => (
              <path key={`scrib-arch-${i}`} d={scribbleLine(85 + i*7, 55, i*3)} transform="translate(130, 0)"/>
            ))}
          </g>
        </svg>

        {/* ROTATING: Complex Gear Train with 3D depth */}
        <div className="rotating-element rotate-slow" style={{ position: 'absolute', top: '58%', left: '5px', width: '220px', height: '240px' }}>
          <svg viewBox="0 0 220 240" style={{ width: '100%', height: '100%' }}>
            <g stroke="#3D2914" fill="none" opacity="0.7">
              {/* Large main gear with 3D depth effect */}
              <ellipse cx="80" cy="90" rx="65" ry="60" strokeWidth="0.4" strokeDasharray="2,3" opacity="0.45"/>
              <circle cx="80" cy="85" r="60" strokeWidth="1.2"/>
              <circle cx="80" cy="85" r="57" strokeWidth="0.3"/>
              <circle cx="80" cy="85" r="48" strokeWidth="0.7"/>
              <circle cx="80" cy="85" r="15" strokeWidth="1"/>
              <circle cx="80" cy="85" r="10" strokeWidth="0.5"/>
              <circle cx="80" cy="85" r="5" fill="#3D2914" opacity="0.5"/>

              {/* 3D gear teeth with beveled edges */}
              {[...Array(20)].map((_, i) => {
                const angle = (i * 18) * Math.PI / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                return (
                  <g key={`3d-tooth-${i}`}>
                    {/* Main tooth face */}
                    <path d={`M${80 + 48*cos - 4*sin},${85 + 48*sin + 4*cos}
                              L${80 + 58*cos - 5*sin},${85 + 58*sin + 5*cos}
                              L${80 + 62*cos},${85 + 62*sin}
                              L${80 + 58*cos + 5*sin},${85 + 58*sin - 5*cos}
                              L${80 + 48*cos + 4*sin},${85 + 48*sin - 4*cos}`}
                          strokeWidth="0.6" fill={i % 2 === 0 ? "url(#hatchDense)" : "none"}/>
                    {/* Tooth side (3D effect) */}
                    <path d={`M${80 + 62*cos},${85 + 62*sin}
                              L${80 + 62*cos + 2},${85 + 62*sin + 4}
                              L${80 + 58*cos + 5*sin + 2},${85 + 58*sin - 5*cos + 4}`}
                          strokeWidth="0.3" fill="url(#hatchLight)" opacity="0.5"/>
                  </g>
                );
              })}

              {/* Decorative spokes */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * Math.PI / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                return (
                  <g key={`dec-spoke-${i}`}>
                    <line x1={80 + 10*cos} y1={85 + 10*sin}
                          x2={80 + 45*cos} y2={85 + 45*sin} strokeWidth="3"/>
                    {/* Spoke shadow */}
                    <line x1={80 + 12*cos + 1.5} y1={85 + 12*sin + 2}
                          x2={80 + 43*cos + 1.5} y2={85 + 43*sin + 2}
                          strokeWidth="0.5" opacity="0.4"/>
                    {/* Spoke detail holes */}
                    <circle cx={80 + 30*cos} cy={85 + 30*sin} r="3" strokeWidth="0.4"/>
                  </g>
                );
              })}

              {/* Interlocking smaller gear */}
              <g transform="translate(155, 55)">
                <circle cx="0" cy="0" r="35" strokeWidth="0.9"/>
                <circle cx="0" cy="0" r="32" strokeWidth="0.3"/>
                <circle cx="0" cy="0" r="25" strokeWidth="0.6"/>
                <circle cx="0" cy="0" r="8" strokeWidth="0.7"/>
                <circle cx="0" cy="0" r="4" fill="#3D2914" opacity="0.45"/>

                {[...Array(14)].map((_, i) => {
                  const angle = (i * 25.7) * Math.PI / 180;
                  const cos = Math.cos(angle);
                  const sin = Math.sin(angle);
                  return (
                    <g key={`sm-3d-tooth-${i}`}>
                      <path d={`M${25*cos - 3*sin},${25*sin + 3*cos}
                                L${33*cos - 4*sin},${33*sin + 4*cos}
                                L${37*cos},${37*sin}
                                L${33*cos + 4*sin},${33*sin - 4*cos}
                                L${25*cos + 3*sin},${25*sin - 3*cos}`}
                            strokeWidth="0.5" fill={i % 2 === 0 ? "url(#hatchLight)" : "none"}/>
                    </g>
                  );
                })}

                {[...Array(4)].map((_, i) => {
                  const angle = (i * 90) * Math.PI / 180;
                  return (
                    <line key={`sm-spoke-${i}`}
                          x1={8*Math.cos(angle)} y1={8*Math.sin(angle)}
                          x2={23*Math.cos(angle)} y2={23*Math.sin(angle)}
                          strokeWidth="2"/>
                  );
                })}
              </g>

              {/* Third tiny gear */}
              <g transform="translate(175, 120)">
                <circle cx="0" cy="0" r="20" strokeWidth="0.7"/>
                <circle cx="0" cy="0" r="14" strokeWidth="0.4"/>
                <circle cx="0" cy="0" r="5" strokeWidth="0.5"/>
                <circle cx="0" cy="0" r="2" fill="#3D2914" opacity="0.4"/>
                {[...Array(10)].map((_, i) => {
                  const angle = (i * 36) * Math.PI / 180;
                  return (
                    <line key={`tiny-tooth-${i}`}
                          x1={14*Math.cos(angle)} y1={14*Math.sin(angle)}
                          x2={22*Math.cos(angle)} y2={22*Math.sin(angle)}
                          strokeWidth="1.5"/>
                  );
                })}
              </g>

              {/* Connecting axles */}
              <line x1="80" y1="85" x2="80" y2="200" strokeWidth="1.5"/>
              <line x1="155" y1="55" x2="175" y2="120" strokeWidth="0.5" strokeDasharray="3,2"/>
            </g>

            {/* Bottom scribble notes */}
            <g stroke="#3D2914" fill="none" opacity="0.45" strokeWidth="0.25">
              {[...Array(6)].map((_, i) => (
                <path key={`gear-note-${i}`} d={scribbleLine(180 + i*7, 140, i*2)} transform="translate(10, 0)"/>
              ))}
            </g>
          </svg>
        </div>

        {/* More margin scribbles - bottom left */}
        <svg className="sketch-layer" viewBox="0 0 150 200" style={{ position: 'absolute', top: '82%', left: '0', width: '150px', height: '200px' }}>
          <g stroke="#3D2914" fill="none" opacity="0.45" strokeWidth="0.3">
            {[...Array(20)].map((_, i) => (
              <path key={`bottom-scrib-${i}`} d={scribbleLine(10 + i*8, 120 - (i%3)*20, i*1.5)} transform="translate(10, 0)"/>
            ))}
          </g>
          {/* Small geometric doodles */}
          <g stroke="#3D2914" fill="none" opacity="0.4" strokeWidth="0.4">
            <circle cx="100" cy="50" r="15"/>
            <polygon points="100,35 115,65 85,65"/>
            <rect x="30" cy="80" width="25" height="25" transform="rotate(15, 42, 92)"/>
            <path d="M60,120 Q80,100 100,120 Q120,140 100,160" strokeWidth="0.3"/>
          </g>
        </svg>
      </div>

      {/* ====== RIGHT SIDEBAR ====== */}
      <div className="davinci-sidebar davinci-sidebar-right">

        {/* ROTATING: Elaborate Vitruvian Man with extensive annotations */}
        <div className="rotating-element rotate-very-slow" style={{ position: 'absolute', top: '-2%', right: '-10px', width: '280px', height: '350px' }}>
          <svg viewBox="0 0 280 350" style={{ width: '100%', height: '100%' }}>
            <g stroke="#3D2914" fill="none" opacity="0.7">
              {/* Top scribbled text block */}
              <g strokeWidth="0.3" opacity="0.65">
                {[...Array(4)].map((_, i) => (
                  <path key={`vit-top-${i}`} d={scribbleLine(15 + i*6, 240, i*2)} transform="translate(20, 0)"/>
                ))}
              </g>

              {/* Main circle with measurement ticks */}
              <circle cx="140" cy="175" r="115" strokeWidth="1"/>
              <circle cx="140" cy="175" r="112" strokeWidth="0.3" strokeDasharray="1,2"/>
              {[...Array(48)].map((_, i) => {
                const angle = (i * 7.5) * Math.PI / 180;
                const inner = i % 4 === 0 ? 108 : 111;
                return (
                  <line key={`vit-tick-${i}`}
                        x1={140 + inner*Math.cos(angle)} y1={175 + inner*Math.sin(angle)}
                        x2={140 + 115*Math.cos(angle)} y2={175 + 115*Math.sin(angle)}
                        strokeWidth={i % 4 === 0 ? "0.5" : "0.25"}/>
                );
              })}

              {/* Square */}
              <rect x="32" y="78" width="216" height="194" strokeWidth="1"/>
              <rect x="36" y="82" width="208" height="186" strokeWidth="0.25" strokeDasharray="3,2"/>

              {/* Human figure - detailed with muscle definition */}
              {/* Head with hair */}
              <ellipse cx="140" cy="88" rx="16" ry="20" strokeWidth="0.8"/>
              <path d="M124,80 Q130,70 140,68 Q150,70 156,80" strokeWidth="0.5"/> {/* Hair line */}
              <path d="M126,82 Q132,74 140,72 Q148,74 154,82" strokeWidth="0.3"/>
              {/* Face details */}
              <ellipse cx="133" cy="85" rx="3" ry="2" strokeWidth="0.4"/>
              <ellipse cx="147" cy="85" rx="3" ry="2" strokeWidth="0.4"/>
              <path d="M140,88 L140,95 L137,98" strokeWidth="0.4"/> {/* Nose */}
              <path d="M134,102 Q140,106 146,102" strokeWidth="0.3"/> {/* Mouth */}

              {/* Neck with tendons */}
              <path d="M132,108 L128,122" strokeWidth="0.6"/>
              <path d="M148,108 L152,122" strokeWidth="0.6"/>
              <path d="M135,110 L133,120" strokeWidth="0.3" strokeDasharray="1,1"/>
              <path d="M145,110 L147,120" strokeWidth="0.3" strokeDasharray="1,1"/>

              {/* Torso with muscle definition */}
              <path d="M128,122 Q118,150 120,180 Q122,210 125,230" strokeWidth="0.8"/>
              <path d="M152,122 Q162,150 160,180 Q158,210 155,230" strokeWidth="0.8"/>
              {/* Center line */}
              <line x1="140" y1="122" x2="140" y2="230" strokeWidth="0.3" strokeDasharray="2,2"/>
              {/* Chest muscles (pectorals) */}
              <path d="M128,128 Q135,140 140,128 Q145,140 152,128" strokeWidth="0.4"/>
              <path d="M130,145 Q140,155 150,145" strokeWidth="0.3"/>
              {/* Abdominal muscles */}
              <path d="M135,160 L145,160" strokeWidth="0.25"/>
              <path d="M134,172 L146,172" strokeWidth="0.25"/>
              <path d="M133,184 L147,184" strokeWidth="0.25"/>
              <path d="M132,196 L148,196" strokeWidth="0.25"/>
              {/* Navel */}
              <circle cx="140" cy="175" r="2" fill="#3D2914" opacity="0.35"/>

              {/* Arms - standing position with muscle detail */}
              <path d="M128,122 Q105,140 88,160 Q72,180 65,200 Q60,220 62,235" strokeWidth="0.7"/>
              <path d="M152,122 Q175,140 192,160 Q208,180 215,200 Q220,220 218,235" strokeWidth="0.7"/>
              {/* Bicep indication */}
              <path d="M108,145 Q100,155 95,168" strokeWidth="0.35" strokeDasharray="1,1"/>
              <path d="M172,145 Q180,155 185,168" strokeWidth="0.35" strokeDasharray="1,1"/>
              {/* Forearm muscles */}
              <path d="M82,175 Q78,190 72,205" strokeWidth="0.3" strokeDasharray="1,1"/>
              <path d="M198,175 Q202,190 208,205" strokeWidth="0.3" strokeDasharray="1,1"/>

              {/* Hands with fingers */}
              <path d="M62,235 L55,248 L50,260" strokeWidth="0.4"/>
              <path d="M62,235 L58,250 L55,262" strokeWidth="0.4"/>
              <path d="M62,235 L62,252 L60,264" strokeWidth="0.4"/>
              <path d="M62,235 L66,250 L68,262" strokeWidth="0.4"/>
              <path d="M62,235 L70,245 L75,255" strokeWidth="0.4"/>
              <path d="M218,235 L225,248 L230,260" strokeWidth="0.4"/>
              <path d="M218,235 L222,250 L225,262" strokeWidth="0.4"/>
              <path d="M218,235 L218,252 L220,264" strokeWidth="0.4"/>
              <path d="M218,235 L214,250 L212,262" strokeWidth="0.4"/>
              <path d="M218,235 L210,245 L205,255" strokeWidth="0.4"/>

              {/* Arms - spread position (lighter) */}
              <path d="M128,122 Q85,95 40,88" strokeWidth="0.5" strokeDasharray="4,2" opacity="0.6"/>
              <path d="M152,122 Q195,95 240,88" strokeWidth="0.5" strokeDasharray="4,2" opacity="0.6"/>

              {/* Legs with muscle definition */}
              <path d="M125,230 Q118,255 112,280 Q106,305 100,272" strokeWidth="0.7"/>
              <path d="M155,230 Q162,255 168,280 Q174,305 180,272" strokeWidth="0.7"/>
              {/* Inner leg lines */}
              <path d="M135,230 Q132,255 128,275" strokeWidth="0.4"/>
              <path d="M145,230 Q148,255 152,275" strokeWidth="0.4"/>
              {/* Knee indication */}
              <ellipse cx="115" cy="268" rx="5" ry="8" strokeWidth="0.3"/>
              <ellipse cx="165" cy="268" rx="5" ry="8" strokeWidth="0.3"/>

              {/* Feet */}
              <path d="M100,272 L85,272 L80,275" strokeWidth="0.5"/>
              <path d="M180,272 L195,272 L200,275" strokeWidth="0.5"/>

              {/* Legs - spread (lighter) */}
              <path d="M125,230 Q95,260 65,285" strokeWidth="0.4" strokeDasharray="3,2" opacity="0.5"/>
              <path d="M155,230 Q185,260 215,285" strokeWidth="0.4" strokeDasharray="3,2" opacity="0.5"/>

              {/* Proportion measurement lines */}
              <line x1="32" y1="175" x2="248" y2="175" strokeWidth="0.2" strokeDasharray="5,2" opacity="0.4"/>
              <line x1="140" y1="60" x2="140" y2="290" strokeWidth="0.2" strokeDasharray="5,2" opacity="0.4"/>
              <line x1="32" y1="122" x2="248" y2="122" strokeWidth="0.15" strokeDasharray="3,3" opacity="0.45"/>
              <line x1="32" y1="230" x2="248" y2="230" strokeWidth="0.15" strokeDasharray="3,3" opacity="0.45"/>

              {/* Central navel point marker */}
              <circle cx="140" cy="175" r="4" strokeWidth="0.4"/>
              <circle cx="140" cy="175" r="1.5" fill="#3D2914" opacity="0.4"/>
            </g>

            {/* Bottom scribbled annotations */}
            <g stroke="#3D2914" fill="none" opacity="0.4" strokeWidth="0.3">
              {[...Array(6)].map((_, i) => (
                <path key={`vit-bot-${i}`} d={scribbleLine(300 + i*6, 220, i*1.8)} transform="translate(30, 0)"/>
              ))}
            </g>
          </svg>
        </div>

        {/* Flying Machine / Ornithopter with detailed mechanism */}
        <svg className="sketch-layer" viewBox="0 0 280 280" style={{ position: 'absolute', top: '32%', right: '-5px', width: '280px', height: '280px' }}>
          <g stroke="#3D2914" fill="none" opacity="0.6">
            {/* Left wing frame with membrane */}
            <path d="M140,140 L35,85 Q15,75 20,58 L45,42 Q65,32 90,38 L140,115" strokeWidth="1"/>
            {/* Wing ribs */}
            {[...Array(8)].map((_, i) => (
              <path key={`lrib-${i}`}
                    d={`M140,${135 - i*5} L${50 + i*8},${95 - i*5}`}
                    strokeWidth="0.5"/>
            ))}
            {/* Wing membrane texture */}
            <path d="M45,90 Q70,95 95,85 Q115,75 135,82" strokeWidth="0.25" strokeDasharray="2,2"/>
            <path d="M55,78 Q78,85 98,75 Q118,65 135,72" strokeWidth="0.2" strokeDasharray="1,2"/>
            <path d="M65,68 Q85,74 102,65 Q120,56 135,62" strokeWidth="0.2" strokeDasharray="1,2"/>
            {/* Wing membrane shading */}
            <path d="M50,88 L130,118 L130,108 L55,80 Z" fill="url(#hatchLight)" strokeWidth="0"/>

            {/* Right wing frame with membrane */}
            <path d="M140,140 L245,85 Q265,75 260,58 L235,42 Q215,32 190,38 L140,115" strokeWidth="1"/>
            {/* Wing ribs */}
            {[...Array(8)].map((_, i) => (
              <path key={`rrib-${i}`}
                    d={`M140,${135 - i*5} L${230 - i*8},${95 - i*5}`}
                    strokeWidth="0.5"/>
            ))}
            {/* Wing membrane texture */}
            <path d="M235,90 Q210,95 185,85 Q165,75 145,82" strokeWidth="0.25" strokeDasharray="2,2"/>
            <path d="M225,78 Q202,85 182,75 Q162,65 145,72" strokeWidth="0.2" strokeDasharray="1,2"/>

            {/* Central fuselage / body pod */}
            <ellipse cx="140" cy="160" rx="20" ry="40" strokeWidth="0.9"/>
            <ellipse cx="140" cy="160" rx="16" ry="35" strokeWidth="0.4"/>
            <path d="M124,160 Q122,140 124,125" strokeWidth="0.5"/>
            <path d="M156,160 Q158,140 156,125" strokeWidth="0.5"/>
            {/* Body cross-hatching */}
            <ellipse cx="140" cy="160" rx="12" ry="28" fill="url(#hatchLight)" strokeWidth="0"/>

            {/* Pilot harness structure */}
            <path d="M125,185 L105,208 L125,230 L155,230 L175,208 L155,185" strokeWidth="0.7"/>
            <line x1="122" y1="145" x2="108" y2="200" strokeWidth="0.5"/>
            <line x1="158" y1="145" x2="172" y2="200" strokeWidth="0.5"/>
            {/* Harness cross straps */}
            <path d="M115,170 L165,195" strokeWidth="0.3"/>
            <path d="M165,170 L115,195" strokeWidth="0.3"/>

            {/* Tail structure */}
            <path d="M140,200 L140,255" strokeWidth="0.8"/>
            <path d="M125,230 L112,265 L140,252 L168,265 L155,230" strokeWidth="0.6"/>
            {/* Tail feathers */}
            {[...Array(7)].map((_, i) => (
              <line key={`tail-${i}`}
                    x1="140" y1="252"
                    x2={115 + i*8} y2={275 - Math.abs(i-3)*3}
                    strokeWidth="0.4"/>
            ))}

            {/* Wing mechanism - pulleys and cables */}
            <circle cx="140" cy="115" r="10" strokeWidth="0.6"/>
            <circle cx="140" cy="115" r="4" fill="url(#crossHatch)" strokeWidth="0.4"/>
            <circle cx="110" cy="130" r="6" strokeWidth="0.5"/>
            <circle cx="170" cy="130" r="6" strokeWidth="0.5"/>
            {/* Control cables */}
            <path d="M134,110 Q100,115 75,95" strokeWidth="0.35" strokeDasharray="2,1"/>
            <path d="M146,110 Q180,115 205,95" strokeWidth="0.35" strokeDasharray="2,1"/>

            {/* Annotation lines */}
            <line x1="30" y1="55" x2="20" y2="40" strokeWidth="0.25"/>
            <line x1="250" y1="55" x2="260" y2="40" strokeWidth="0.25"/>
          </g>

          {/* Side annotations */}
          <g stroke="#3D2914" fill="none" opacity="0.5" strokeWidth="0.25">
            {[...Array(5)].map((_, i) => (
              <path key={`fly-note-${i}`} d={scribbleLine(45 + i*7, 50, i*2.2)} transform="translate(10, 0)"/>
            ))}
          </g>
        </svg>

        {/* ROTATING: Detailed 3D Gear Assembly */}
        <div className="rotating-element rotate-medium" style={{ position: 'absolute', top: '58%', right: '20px', width: '200px', height: '200px' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <g stroke="#3D2914" fill="none" opacity="0.65">
              {/* Main gear with heavy 3D effect */}
              <circle cx="70" cy="80" r="52" strokeWidth="1.2"/>
              <circle cx="70" cy="80" r="48" strokeWidth="0.4"/>
              <circle cx="70" cy="80" r="40" strokeWidth="0.7"/>
              <circle cx="70" cy="80" r="12" strokeWidth="0.8"/>
              <circle cx="70" cy="80" r="6" fill="#3D2914" opacity="0.45"/>

              {/* 3D depth ellipse */}
              <ellipse cx="70" cy="88" rx="52" ry="48" strokeWidth="0.3" strokeDasharray="2,3" opacity="0.4"/>

              {/* Gear teeth with 3D bevel */}
              {[...Array(18)].map((_, i) => {
                const angle = (i * 20) * Math.PI / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                return (
                  <g key={`main-tooth-${i}`}>
                    <path d={`M${70 + 40*cos - 5*sin},${80 + 40*sin + 5*cos}
                              L${70 + 50*cos - 6*sin},${80 + 50*sin + 6*cos}
                              L${70 + 55*cos},${80 + 55*sin}
                              L${70 + 50*cos + 6*sin},${80 + 50*sin - 6*cos}
                              L${70 + 40*cos + 5*sin},${80 + 40*sin - 5*cos}`}
                          strokeWidth="0.6" fill={i % 2 === 0 ? "url(#hatchDense)" : "none"}/>
                    {/* Tooth 3D side */}
                    <path d={`M${70 + 55*cos},${80 + 55*sin}
                              L${70 + 55*cos + 2},${80 + 55*sin + 5}
                              L${70 + 50*cos + 6*sin + 2},${80 + 50*sin - 6*cos + 5}`}
                          strokeWidth="0.25" opacity="0.4"/>
                  </g>
                );
              })}

              {/* Spokes with holes */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * 60) * Math.PI / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                return (
                  <g key={`main-spoke-${i}`}>
                    <line x1={70 + 12*cos} y1={80 + 12*sin}
                          x2={70 + 38*cos} y2={80 + 38*sin} strokeWidth="3"/>
                    <circle cx={70 + 26*cos} cy={80 + 26*sin} r="3" strokeWidth="0.4"/>
                  </g>
                );
              })}

              {/* Smaller interlocking gear */}
              <g transform="translate(140, 55)">
                <circle cx="0" cy="0" r="28" strokeWidth="0.9"/>
                <circle cx="0" cy="0" r="22" strokeWidth="0.5"/>
                <circle cx="0" cy="0" r="8" strokeWidth="0.6"/>
                <circle cx="0" cy="0" r="3" fill="#3D2914" opacity="0.4"/>

                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * Math.PI / 180;
                  const cos = Math.cos(angle);
                  const sin = Math.sin(angle);
                  return (
                    <path key={`sm-tooth-${i}`}
                          d={`M${22*cos - 4*sin},${22*sin + 4*cos}
                              L${27*cos - 4*sin},${27*sin + 4*cos}
                              L${30*cos},${30*sin}
                              L${27*cos + 4*sin},${27*sin - 4*cos}
                              L${22*cos + 4*sin},${22*sin - 4*cos}`}
                          strokeWidth="0.5" fill={i % 2 === 0 ? "url(#hatchLight)" : "none"}/>
                  );
                })}
              </g>

              {/* Tiny gear */}
              <g transform="translate(155, 120)">
                <circle cx="0" cy="0" r="18" strokeWidth="0.7"/>
                <circle cx="0" cy="0" r="12" strokeWidth="0.4"/>
                <circle cx="0" cy="0" r="4" strokeWidth="0.5"/>
                {[...Array(10)].map((_, i) => {
                  const angle = (i * 36) * Math.PI / 180;
                  return (
                    <line key={`tiny-${i}`}
                          x1={12*Math.cos(angle)} y1={12*Math.sin(angle)}
                          x2={20*Math.cos(angle)} y2={20*Math.sin(angle)}
                          strokeWidth="1.2"/>
                  );
                })}
              </g>

              {/* Axle connections */}
              <line x1="70" y1="80" x2="70" y2="150" strokeWidth="1.2"/>
              <line x1="140" y1="55" x2="155" y2="120" strokeWidth="0.6" strokeDasharray="2,2"/>
            </g>
          </svg>
        </div>

        {/* Additional corner scribbles */}
        <svg className="sketch-layer" viewBox="0 0 120 150" style={{ position: 'absolute', top: '92%', right: '100px', width: '120px', height: '150px' }}>
          <g stroke="#3D2914" fill="none" opacity="0.4" strokeWidth="0.3">
            {[...Array(15)].map((_, i) => (
              <path key={`corner-scrib-${i}`} d={scribbleLine(10 + i*8, 100 - (i%4)*15, i*1.2)} transform="translate(5, 0)"/>
            ))}
          </g>
          {/* Small mechanical doodle */}
          <g stroke="#3D2914" fill="none" opacity="0.35" strokeWidth="0.4">
            <circle cx="80" cy="100" r="20"/>
            <circle cx="80" cy="100" r="12"/>
            <circle cx="80" cy="100" r="5"/>
            {[...Array(8)].map((_, i) => (
              <line key={`mini-spoke-${i}`}
                    x1={80 + 5*Math.cos(i*Math.PI/4)} y1={100 + 5*Math.sin(i*Math.PI/4)}
                    x2={80 + 18*Math.cos(i*Math.PI/4)} y2={100 + 18*Math.sin(i*Math.PI/4)}
                    strokeWidth="0.3"/>
            ))}
          </g>
        </svg>
      </div>

      {/* ====== CENTER FLOATING ELEMENTS ====== */}
      <div className="davinci-floating">
        {/* Compass rose */}
        <div className="rotating-element rotate-very-slow" style={{ position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)', width: '70px', height: '70px' }}>
          <svg viewBox="0 0 70 70" style={{ width: '100%', height: '100%' }}>
            <g stroke="#3D2914" fill="none" opacity="0.35">
              <circle cx="35" cy="35" r="30" strokeWidth="0.5"/>
              <circle cx="35" cy="35" r="26" strokeWidth="0.2"/>
              <polygon points="35,5 38,25 32,25" fill="#3D2914" opacity="0.15" strokeWidth="0.3"/>
              <polygon points="35,65 32,45 38,45" strokeWidth="0.3"/>
              <polygon points="5,35 25,32 25,38" strokeWidth="0.3"/>
              <polygon points="65,35 45,38 45,32" strokeWidth="0.3"/>
              <line x1="35" y1="8" x2="35" y2="62" strokeWidth="0.3"/>
              <line x1="8" y1="35" x2="62" y2="35" strokeWidth="0.3"/>
              {[...Array(16)].map((_, i) => {
                const angle = (i * 22.5) * Math.PI / 180;
                return (
                  <line key={`comp-${i}`}
                        x1={35 + 24*Math.cos(angle)} y1={35 + 24*Math.sin(angle)}
                        x2={35 + 30*Math.cos(angle)} y2={35 + 30*Math.sin(angle)}
                        strokeWidth="0.25"/>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── MAREA — Lógica principal ──

// Estado global
let imagenActual = null;
let ultimoAnalisis = null;

// ── Glosario de indicadores ──
const GLOSARIO = {
  clorofila: {
    titulo: '¿Qué es la Clorofila-a? / What is Chlorophyll-a?',
    texto: `La clorofila-a es el pigmento principal del fitoplancton (microalgas marinas). 
Su concentración indica la productividad biológica del océano.

🟢 Alta concentración (>2 mg/m³): aguas ricas en nutrientes, buena para la pesca.
🟡 Media (0.5–2 mg/m³): productividad moderada.
🔴 Baja (<0.5 mg/m³): aguas pobres, poca actividad pesquera.

IMPORTANTE: En imágenes JPG/PNG, la IA estima la clorofila visualmente por el color del agua (verde = alta, azul = baja). La medición real requiere las bandas espectrales originales de Sentinel-3 (Opción B).

Chlorophyll-a is the main pigment of phytoplankton (marine microalgae). Its concentration indicates ocean biological productivity.`
  },
  turbidez: {
    titulo: '¿Qué es la Turbidez? / What is Turbidity?',
    texto: `La turbidez mide la claridad del agua — cuánta luz puede penetrar.

🟢 Baja (<5 NTU): agua clara, óptima para ecosistemas marinos.
🟡 Media (5–20 NTU): algo de sedimentos o materia orgánica.
🔴 Alta (>20 NTU): agua turbia por sedimentos, contaminación o algas.

Turbidity measures water clarity — how much light can penetrate. 
High turbidity can indicate pollution, sediment runoff, or algal blooms.`
  },
  productividad: {
    titulo: '¿Qué es la Productividad Marina? / What is Marine Productivity?',
    texto: `La productividad marina indica cuánta biomasa biológica produce una zona del océano.

🟢 Alta: zona rica en fitoplancton → buena para pesca → económicamente valiosa.
🟡 Media: productividad normal para la estación del año.
🔴 Baja: zona pobre → pocas especies → poca actividad pesquera.

Se estima combinando clorofila-a, temperatura superficial y condiciones de luz.

Marine productivity indicates how much biological biomass an ocean zone produces. It combines chlorophyll-a, sea surface temperature, and light conditions.`
  }
};

// ── Inicialización ──
document.addEventListener('DOMContentLoaded', () => {

  // Navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => goTab(btn.dataset.tab));
  });

  // Upload
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        imagenActual = ev.target.result;
        mostrarPreview(imagenActual, file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  // Drag & Drop
  const dropZone = document.getElementById('drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--ocean)';
      dropZone.style.background = 'var(--gray-xl)';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--gray-l)';
      dropZone.style.background = 'var(--bg)';
    });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--gray-l)';
      dropZone.style.background = 'var(--bg)';
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        imagenActual = ev.target.result;
        mostrarPreview(imagenActual, file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  // Demos
  document.querySelectorAll('.btn-demo').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.demo;
      imagenActual = generarImagenDemo(tipo);
      const labels = {
        productivo: 'Demo — Mar productivo / Productive sea',
        anomalia: 'Demo — Anomalía térmica / Thermal anomaly',
        pesca: 'Demo — Zona de pesca activa / Active fishing zone',
      };
      mostrarPreview(imagenActual, labels[tipo] || 'Demo');
    });
  });

  // Analizar
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) analyzeBtn.addEventListener('click', analizarImagen);
});

// ── Navegación ──
function goTab(tab) {
  document.querySelectorAll('.nav-btn').forEach((b, i) => {
    b.classList.toggle('active', ['dashboard','analizar','alertas','informe'][i] === tab);
  });
  document.querySelectorAll('.tab').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// ── Glosario ──
function showHelp(key) {
  const info = GLOSARIO[key];
  if (!info) return;
  const box = document.getElementById('help-box');
  document.getElementById('help-title').textContent = info.titulo;
  document.getElementById('help-text').innerHTML = info.texto.replace(/\n/g, '<br>');
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Preview ──
function mostrarPreview(src, label) {
  const wrap = document.getElementById('preview-wrap');
  const img  = document.getElementById('preview-img');
  const tag  = document.getElementById('preview-tag');
  img.src = src;
  tag.textContent = label || 'Imagen cargada';
  wrap.style.display = 'block';
  document.getElementById('analyze-btn').disabled = false;
  limpiarResultados();
}

function limpiarResultados() {
  const wrap = document.getElementById('results-wrap');
  if (wrap) wrap.style.display = 'none';
  document.getElementById('st-img').innerHTML = '';
}

// ── Imágenes de demo ──
function generarImagenDemo(tipo) {
  const canvas = document.createElement('canvas');
  canvas.width = 500; canvas.height = 300;
  const ctx = canvas.getContext('2d');

  if (tipo === 'productivo') {
    const g = ctx.createRadialGradient(250,150,20,250,150,220);
    g.addColorStop(0, '#0d7a55');
    g.addColorStop(0.4, '#1a6ab5');
    g.addColorStop(1, '#0a2040');
    ctx.fillStyle = g; ctx.fillRect(0,0,500,300);
    ctx.fillStyle = 'rgba(29,158,117,0.6)'; ctx.beginPath(); ctx.arc(250,150,80,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(29,158,117,0.3)'; ctx.beginPath(); ctx.arc(150,100,50,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Alta clorofila / High chlorophyll', 160, 155);
    ctx.font = '11px sans-serif'; ctx.fillStyle = '#7ab3e0';
    ctx.fillText('Zona productiva / Productive zone', 160, 172);

  } else if (tipo === 'anomalia') {
    ctx.fillStyle = '#0a1628'; ctx.fillRect(0,0,500,300);
    const g2 = ctx.createRadialGradient(300,120,10,300,120,120);
    g2.addColorStop(0, 'rgba(226,75,74,0.8)');
    g2.addColorStop(0.5, 'rgba(239,159,39,0.4)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(300,120,120,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Anomalía térmica / Thermal anomaly', 160, 80);
    ctx.fillStyle = '#ffaaaa'; ctx.font = '11px sans-serif';
    ctx.fillText('+3.5°C sobre media / above average', 170, 98);
    // Embarcaciones
    [[80,200],[120,220],[160,195]].forEach(([x,y]) => {
      ctx.fillStyle = '#378add'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(55,138,221,0.5)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.stroke();
    });
    ctx.fillStyle = '#7ab3e0'; ctx.font = '10px sans-serif';
    ctx.fillText('3 embarcaciones / vessels', 55, 245);

  } else {
    ctx.fillStyle = '#0a2040'; ctx.fillRect(0,0,500,300);
    for (let x=0;x<500;x+=40) { ctx.strokeStyle='rgba(55,138,221,0.07)'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,300); ctx.stroke(); }
    for (let y=0;y<300;y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(500,y); ctx.stroke(); }
    // Zona de alta clorofila
    ctx.fillStyle = 'rgba(29,158,117,0.4)'; ctx.beginPath(); ctx.ellipse(250,150,180,80,0,0,Math.PI*2); ctx.fill();
    // Embarcaciones
    [[100,100],[150,130],[200,110],[300,160],[350,140],[400,170],[420,120]].forEach(([x,y]) => {
      ctx.fillStyle = '#378add'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(55,138,221,0.5)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.stroke();
    });
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Zona de pesca activa / Active fishing zone', 130, 60);
    ctx.fillStyle = '#7ab3e0'; ctx.font = '11px sans-serif';
    ctx.fillText('7 embarcaciones detectadas / vessels detected', 140, 78);
  }

  return canvas.toDataURL('image/png');
}

// ── Análisis principal ──
async function analizarImagen() {
  if (!imagenActual) return;

  const btn  = document.getElementById('analyze-btn');
  const stEl = document.getElementById('st-img');
  btn.disabled = true;
  limpiarResultados();

  const lugar  = document.getElementById('ctx-lugar')?.value.trim() || 'zona no especificada';
  const pais   = document.getElementById('ctx-pais')?.value.trim() || '';
  const fecha  = document.getElementById('ctx-fecha')?.value || 'fecha no especificada';
  const fuente = document.getElementById('ctx-fuente')?.value || 'fuente desconocida';
  const zonaCompleta = pais ? `${lugar}, ${pais}` : lugar;

  const steps = [
    'Leyendo imagen satelital / Reading satellite image...',
    'Analizando temperatura superficial / Analyzing SST...',
    'Detectando clorofila y productividad / Detecting chlorophyll...',
    'Identificando embarcaciones / Identifying vessels...',
    'Generando alertas / Generating alerts...',
    'Elaborando informe / Building report...',
  ];
  let si = 0;
  const iv = setInterval(() => {
    if (si < steps.length) stEl.innerHTML = `<span class="loader"></span> ${steps[si++]}`;
  }, 900);

  const prompt = `Analizás una imagen satelital del mar/océano. 
Zona: ${zonaCompleta}
Fuente: ${fuente}
Fecha: ${fecha}

Respondé SOLO en JSON puro sin backticks ni texto adicional:
{
  "indicadores": {
    "temperatura": "X.X°C",
    "temperatura_estado": "normal|elevada|baja",
    "temperatura_ref": "explicación breve en español/inglés",
    "clorofila": "X.X mg/m³",
    "clorofila_estado": "alta|media|baja",
    "clorofila_ref": "explicación breve",
    "turbidez": "X NTU",
    "turbidez_estado": "ok|moderada|elevada",
    "turbidez_ref": "explicación breve",
    "embarcaciones": "X",
    "embarcaciones_estado": "normal|elevado|sospechoso",
    "embarcaciones_ref": "explicación breve",
    "productividad": "Alta|Media|Baja",
    "productividad_estado": "ok|warn|danger",
    "productividad_ref": "explicación breve",
    "nivel_alerta": "Verde|Amarillo|Rojo",
    "nivel_alerta_estado": "ok|warn|danger",
    "nivel_alerta_ref": "resumen del riesgo"
  },
  "diagnostico": "Párrafo de 5-7 oraciones en español e inglés (alternando) con diagnóstico oceanográfico completo de ${zonaCompleta}: temperatura, productividad biológica, actividad pesquera, anomalías detectadas y tendencias.",
  "alertas": [
    {"titulo": "título de la alerta en español / English", "descripcion": "descripción clara y concisa", "nivel": "rojo|amarillo|verde", "icono": "ti-alert-triangle|ti-thermometer|ti-ship|ti-fish|ti-eye"},
    {"titulo": "segunda alerta", "descripcion": "descripción", "nivel": "amarillo", "icono": "ti-thermometer"},
    {"titulo": "tercera alerta", "descripcion": "descripción", "nivel": "verde", "icono": "ti-check"}
  ],
  "acciones": [
    {"texto": "Acción concreta y operativa en español / English para organismo estatal", "organismo": "Prefectura Naval / Coast Guard"},
    {"texto": "Segunda acción", "organismo": "INIDEP / Fisheries Institute"},
    {"texto": "Tercera acción", "organismo": "Autoridad Marítima / Maritime Authority"},
    {"texto": "Cuarta acción", "organismo": "Organismo ambiental / Environmental Agency"}
  ]
}`;

  try {
    const r = await fetch(`${CONFIG.BACKEND_URL}/analizar-imagen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagen_base64: imagenActual.split(',')[1],
        tipo: 'mar',
        lugar: zonaCompleta,
        fecha: fecha,
        fuente: fuente,
        prompt_custom: prompt,
      }),
    });

    clearInterval(iv);

    if (!r.ok) throw new Error(`Error ${r.status}`);
    const data = await r.json();

    // El backend puede devolver el JSON directamente o en data.result
    const parsed = data.indices ? data : (data.result || data);

    stEl.innerHTML = '<i class="ti ti-check" style="color:#1d9e75"></i> Análisis completado / Analysis complete';

    // Guardar análisis
    ultimoAnalisis = { zona: zonaCompleta, fecha, fuente, data: parsed };

    // Mostrar resultados
    mostrarResultados(parsed, zonaCompleta);
    actualizarDashboard(parsed);
    actualizarAlertas(parsed.alertas || [], zonaCompleta);
    generarInforme(parsed, zonaCompleta, fecha, fuente);

  } catch (err) {
    clearInterval(iv);
    stEl.innerHTML = '<i class="ti ti-x" style="color:#e24b4a"></i> Error al conectar con el servidor. Intentá de nuevo. / Connection error. Please retry.';
    console.error(err);
  }

  btn.disabled = false;
}

// ── Mostrar resultados en tab analizar ──
function mostrarResultados(data, zona) {
  const wrap = document.getElementById('results-wrap');
  if (!wrap) return;

  // Header
  document.getElementById('results-zona-nombre').textContent = `Análisis: ${zona}`;

  // Indicadores
  const ind = data.indicadores || data.indices || {};
  const indGrid = document.getElementById('result-indicators');

  if (data.indicadores) {
    indGrid.innerHTML = [
      { label: 'Temperatura / SST', value: ind.temperatura || '—', sub: ind.temperatura_ref || '' },
      { label: 'Clorofila-a', value: ind.clorofila || '—', sub: ind.clorofila_ref || '' },
      { label: 'Turbidez', value: ind.turbidez || '—', sub: ind.turbidez_ref || '' },
      { label: 'Embarcaciones / Vessels', value: ind.embarcaciones || '—', sub: ind.embarcaciones_ref || '' },
      { label: 'Productividad / Productivity', value: ind.productividad || '—', sub: ind.productividad_ref || '' },
      { label: 'Nivel de alerta / Alert', value: ind.nivel_alerta || '—', sub: ind.nivel_alerta_ref || '' },
    ].map(i => `
      <div class="result-ind">
        <div class="result-ind-label">${i.label}</div>
        <div class="result-ind-value">${i.value}</div>
        <div class="result-ind-sub">${i.sub}</div>
      </div>
    `).join('');
  } else if (data.indices) {
    indGrid.innerHTML = (data.indices || []).map(i => `
      <div class="result-ind">
        <div class="result-ind-label">${i.label}</div>
        <div class="result-ind-value">${i.value}</div>
        <div class="result-ind-sub">${i.sub}</div>
      </div>
    `).join('');
  }

  // Diagnóstico
  document.getElementById('result-diagnostico').innerHTML =
    (data.diagnostico || '').replace(/\n/g, '<br>');

  // Alertas
  const alertasEl = document.getElementById('result-alertas');
  const alertas = data.alertas || [];
  alertasEl.innerHTML = alertas.length > 0
    ? alertas.map(a => `
        <div class="alert-item alert-${a.nivel}">
          <i class="ti ${a.icono || 'ti-alert-circle'}" aria-hidden="true"></i>
          <div>
            <div class="alert-item-title">${a.titulo}</div>
            <div class="alert-item-desc">${a.descripcion}</div>
            <span class="alert-item-level">${a.nivel.toUpperCase()}</span>
          </div>
        </div>`)
      .join('')
    : '<p style="font-size:12px;color:var(--gray-m)">No se detectaron alertas críticas / No critical alerts detected</p>';

  // Acciones
  const accionesEl = document.getElementById('result-acciones');
  const acciones = data.acciones || data.misiones || [];
  accionesEl.innerHTML = acciones.map((a, i) => `
    <div class="accion-item">
      <div class="accion-num">${i+1}</div>
      <div>
        <div class="accion-text">${a.texto || a.tarea || ''}</div>
        <div class="accion-org">${a.organismo || a.zona || ''}</div>
      </div>
    </div>`).join('');

  wrap.style.display = 'block';
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Ocultar zona vacía en dashboard
  document.getElementById('zona-card').style.display = 'none';
  document.getElementById('ultima-zona').style.display = 'block';
  document.getElementById('result-zona-content').innerHTML =
    `<div style="font-size:13px;color:var(--gray-m);padding:12px 0;">
      Zona: <strong>${zona}</strong> · Fuente: ${document.getElementById('ctx-fuente')?.value || '—'} · 
      <button style="background:none;border:none;color:var(--ocean);cursor:pointer;font-size:13px;font-weight:600;" onclick="goTab('analizar')">Ver análisis completo →</button>
    </div>`;
}

// ── Actualizar dashboard ──
function actualizarDashboard(data) {
  const ind = data.indicadores || {};
  if (!Object.keys(ind).length) return;

  const setInd = (id, val, ref, estado) => {
    const el = document.getElementById(id);
    const st = document.getElementById(id.replace('ind-', 'st-'));
    if (el) el.textContent = val || '—';
    if (st && estado) {
      const map = { ok: ['ok', '✓ Normal'], warn: ['warn', '⚠ Atención / Warning'], danger: ['danger', '✗ Crítico / Critical'], normal: ['ok', '✓ Normal'], elevada: ['warn', '⚠ Elevada / High'], baja: ['ok', '✓ Baja / Low'], alta: ['ok', '✓ Alta / High'], media: ['warn', '~ Media / Medium'], sospechoso: ['danger', '⚠ Sospechoso / Suspicious'] };
      const [cls, txt] = map[estado] || ['', ref || ''];
      st.className = `indicator-status ${cls}`;
      st.textContent = txt;
    }
  };

  setInd('ind-temp', ind.temperatura, ind.temperatura_ref, ind.temperatura_estado);
  setInd('ind-cloro', ind.clorofila, ind.clorofila_ref, ind.clorofila_estado);
  setInd('ind-turb', ind.turbidez, ind.turbidez_ref, ind.turbidez_estado);
  setInd('ind-barcos', ind.embarcaciones, ind.embarcaciones_ref, ind.embarcaciones_estado);
  setInd('ind-prod', ind.productividad, ind.productividad_ref, ind.productividad_estado);
  setInd('ind-alerta', ind.nivel_alerta, ind.nivel_alerta_ref, ind.nivel_alerta_estado);
}

// ── Actualizar tab alertas ──
function actualizarAlertas(alertas, zona) {
  const lista = document.getElementById('alertas-lista');
  if (!alertas.length) return;

  lista.innerHTML = `
    <div style="margin-bottom:12px;font-size:12px;color:var(--gray-m);">
      Zona: <strong>${zona}</strong> · ${alertas.length} alertas generadas / alerts generated
    </div>
    ${alertas.map(a => `
      <div class="alert-item alert-${a.nivel}" style="margin-bottom:8px;">
        <i class="ti ${a.icono || 'ti-alert-circle'}" aria-hidden="true"></i>
        <div>
          <div class="alert-item-title">${a.titulo}</div>
          <div class="alert-item-desc">${a.descripcion}</div>
          <span class="alert-item-level">${a.nivel.toUpperCase()}</span>
        </div>
      </div>`).join('')}`;
}

// ── Generar informe ──
function generarInforme(data, zona, fecha, fuente) {
  const el = document.getElementById('informe-contenido');
  const ind = data.indicadores || {};
  const ahora = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });

  el.innerHTML = `
    <div class="informe-card">
      <div class="informe-header">
        <div class="informe-title">MAREA — Informe Oceanográfico / Oceanographic Report</div>
        <div class="informe-meta">
          Zona / Zone: ${zona} · Imagen: ${fecha} · Fuente: ${fuente} · Generado / Generated: ${ahora}
        </div>
      </div>
      <div class="informe-body">

        <div class="informe-section">
          <div class="informe-section-title">Indicadores principales / Key indicators</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${[
              ['Temperatura sup. / SST', ind.temperatura, ind.temperatura_ref],
              ['Clorofila-a / Chlorophyll', ind.clorofila, ind.clorofila_ref],
              ['Turbidez / Turbidity', ind.turbidez, ind.turbidez_ref],
              ['Embarcaciones / Vessels', ind.embarcaciones, ind.embarcaciones_ref],
              ['Productividad / Productivity', ind.productividad, ind.productividad_ref],
              ['Nivel de alerta / Alert level', ind.nivel_alerta, ind.nivel_alerta_ref],
            ].map(([l,v,r]) => `
              <div style="background:var(--gray-xl);border-radius:6px;padding:10px;">
                <div style="font-size:10px;font-weight:600;color:var(--gray-m);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px;">${l}</div>
                <div style="font-size:18px;font-weight:700;color:var(--gray-os);">${v || '—'}</div>
                <div style="font-size:10px;color:var(--gray-m);">${r || ''}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="informe-section">
          <div class="informe-section-title">Diagnóstico / Diagnosis</div>
          <div class="informe-text">${(data.diagnostico || '').replace(/\n/g,'<br>')}</div>
        </div>

        <div class="informe-section">
          <div class="informe-section-title">Alertas / Alerts</div>
          ${(data.alertas || []).map(a => `
            <div style="padding:8px 0;border-bottom:0.5px solid var(--gray-xl);">
              <span style="font-weight:600;font-size:12px;">${a.titulo}</span>
              <span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;margin-left:6px;background:${a.nivel==='rojo'?'#fcebeb':a.nivel==='amarillo'?'#faeeda':'#e1f5ee'};color:${a.nivel==='rojo'?'#a32d2d':a.nivel==='amarillo'?'#854f0b':'#0f6e56'};">${a.nivel.toUpperCase()}</span>
              <div style="font-size:11px;color:var(--gray-m);margin-top:3px;">${a.descripcion}</div>
            </div>`).join('')}
        </div>

        <div class="informe-section">
          <div class="informe-section-title">Acciones recomendadas / Recommended actions</div>
          ${(data.acciones || data.misiones || []).map((a,i) => `
            <div style="padding:8px 0;border-bottom:0.5px solid var(--gray-xl);display:flex;gap:10px;align-items:flex-start;">
              <div style="width:22px;height:22px;border-radius:50%;background:var(--ocean);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</div>
              <div>
                <div style="font-size:12px;color:var(--gray-os);">${a.texto || a.tarea || ''}</div>
                <div style="font-size:10px;color:var(--ocean);font-weight:600;margin-top:2px;">${a.organismo || a.zona || ''}</div>
              </div>
            </div>`).join('')}
        </div>

        <div style="margin-top:1rem;padding:10px;background:var(--gray-xl);border-radius:6px;font-size:10px;color:var(--gray-m);line-height:1.6;">
          <strong>Nota metodológica / Methodological note:</strong> Este informe utiliza estimación visual con IA (Opción A). Los valores son aproximados. Para medición espectral exacta se requiere procesamiento de bandas originales Sentinel-3 (Opción B — en desarrollo). · This report uses AI visual estimation (Option A). Values are approximate. Exact spectral measurement requires Sentinel-3 original band processing (Option B — in development).
        </div>

      </div>
    </div>`;
}

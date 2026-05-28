import Swal from 'sweetalert2'

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export async function showPackagingSelector(packaging) {
  const options = packaging?.options || []
  if (!packaging?.enabled || options.length < 2) {
    return { selected: options[0] || null, cancelled: false }
  }

  const cols = options.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr'

  const result = await Swal.fire({
    title: packaging.titulo || '¿Cómo querés recibir tu pedido?',
    html: `
      <div style="display:grid;grid-template-columns:${cols};gap:12px;margin-top:10px;text-align:left">
        ${options.map((opt, i) => `
          <div
            id="pkg-card-${i}"
            style="
              border: 2px solid ${i === 0 ? '#9c664d' : '#e0d5c8'};
              border-radius: 14px;
              overflow: hidden;
              cursor: pointer;
              background: ${i === 0 ? '#fdf5ee' : '#fff'};
              transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
              position: relative;
              ${i === 0 ? 'box-shadow: 0 2px 12px rgba(156,102,77,0.18);' : ''}
            "
            onclick="
              document.querySelectorAll('[id^=pkg-card-]').forEach(el => {
                el.style.border = '2px solid #e0d5c8';
                el.style.background = '#fff';
                el.style.boxShadow = 'none';
                var ck = el.querySelector('.pkg-ck');
                if (ck) ck.style.opacity = '0';
              });
              this.style.border = '2px solid #9c664d';
              this.style.background = '#fdf5ee';
              this.style.boxShadow = '0 2px 12px rgba(156,102,77,0.18)';
              var ck = this.querySelector('.pkg-ck');
              if (ck) ck.style.opacity = '1';
              document.getElementById('pkg-radio-${i}').checked = true;
            "
          >
            <input type="radio" name="pkg" id="pkg-radio-${i}" value="${i}" ${i === 0 ? 'checked' : ''} style="display:none">

            ${opt.imagen ? `
              <div style="overflow:hidden;background:#f5f0eb">
                <img src="${opt.imagen}" style="width:100%;height:auto;display:block">
              </div>
            ` : `
              <div style="height:80px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f9f4ee">${opt.emoji}</div>
            `}

            <div style="padding:10px 12px 12px">
              <strong style="display:block;font-size:0.9rem;color:#1a1209;margin-bottom:3px">${opt.nombre}</strong>
              <p style="font-size:0.78rem;color:#6B5C52;line-height:1.45;margin:0 0 8px">${opt.desc}</p>
              <span style="font-weight:700;color:#9c664d;font-size:0.88rem">
                ${opt.precio === 0 ? '✓ Incluido' : '+' + fmt(opt.precio)}
              </span>
            </div>

            <div class="pkg-ck" style="
              opacity: ${i === 0 ? '1' : '0'};
              transition: opacity 0.18s;
              position: absolute; top: 8px; right: 8px;
              width: 22px; height: 22px;
              background: #9c664d; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: #fff; font-size: 0.7rem; font-weight: 700;
            ">✓</div>
          </div>
        `).join('')}
      </div>
    `,
    width: '36em',
    confirmButtonText: '🛒 Agregar al carrito',
    confirmButtonColor: '#9c664d',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    background: '#FDF9F0',
    color: '#1a1209',
    customClass: { popup: 'swal-pkg-popup' },
    preConfirm: () => {
      const checked = document.querySelector('input[name="pkg"]:checked')
      return options[parseInt(checked?.value ?? '0')]
    },
  })

  return { selected: result.value || null, cancelled: !result.isConfirmed }
}

import Swal from 'sweetalert2'

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

/**
 * Muestra un SweetAlert con las opciones de packaging.
 * Retorna { selected: opción elegida, cancelled: true si cerró sin confirmar }
 */
export async function showPackagingSelector(packaging) {
  const options = packaging?.options || []
  if (!packaging?.enabled || options.length < 2) {
    return { selected: options[0] || null, cancelled: false }
  }

  // Preview inicial: imagen de la primera opción (si tiene)
  const firstImg = options[0]?.imagen || ''

  const result = await Swal.fire({
    title: packaging.titulo || '¿Cómo querés recibir tu pedido?',
    html: `
      <div style="display:flex;flex-direction:column;gap:10px;text-align:left;margin-top:8px">
        ${options.map((opt, i) => `
          <label
            id="pkg-label-${i}"
            style="display:flex;flex-direction:column;gap:0;border:2px solid ${i === 0 ? '#9c664d' : '#e8dfd4'};border-radius:12px;cursor:pointer;transition:all 0.18s;background:${i === 0 ? '#fdf5ee' : '#fff'};overflow:hidden"
            onclick="
              document.querySelectorAll('[id^=pkg-label-]').forEach(el => {
                el.style.border='2px solid #e8dfd4';
                el.style.background='#fff';
                el.querySelector('.pkg-swal-expanded') && (el.querySelector('.pkg-swal-expanded').style.maxHeight='0');
              });
              this.style.border='2px solid #9c664d';
              this.style.background='#fdf5ee';
              document.getElementById('pkg-radio-${i}').checked=true;
              var exp=this.querySelector('.pkg-swal-expanded');
              if(exp) exp.style.maxHeight='600px';
            "
          >
            <div style="display:flex;align-items:center;gap:12px;padding:12px 14px">
              <input type="radio" name="pkg" id="pkg-radio-${i}" value="${i}" ${i === 0 ? 'checked' : ''} style="display:none">
              ${opt.imagen
                ? `<img src="${opt.imagen}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0">`
                : `<span style="font-size:2rem;flex-shrink:0">${opt.emoji}</span>`
              }
              <div style="flex:1;min-width:0">
                <strong style="display:block;font-size:0.95rem;color:#1a1209">${opt.nombre}</strong>
                <span style="font-size:0.8rem;color:#6B5C52;line-height:1.4">${opt.desc}</span>
              </div>
              <span style="font-weight:700;color:#9c664d;white-space:nowrap;margin-left:8px">
                ${opt.precio === 0 ? 'Incluido' : '+' + fmt(opt.precio)}
              </span>
            </div>
            ${opt.imagen ? `
              <div class="pkg-swal-expanded" style="max-height:${i === 0 ? '600px' : '0'};overflow:hidden;transition:max-height 0.35s ease">
                <img src="${opt.imagen}" style="width:100%;height:auto;display:block">
              </div>
            ` : ''}
          </label>
        `).join('')}
      </div>
    `,
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

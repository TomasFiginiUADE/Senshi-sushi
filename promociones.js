document.addEventListener('DOMContentLoaded', () => {
  const fmt = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  })

  const GLOBAL_THRESHOLD = 30000
  const GLOBAL_THRESHOLD_DISCOUNT = 0.1

  const promotions = [
    {
      id: 1,
      product: 'Philadelphia',
      imageCandidates: ['img/Philadelphia.jpg'],
      price: 14000,
      pieces: 8,
      promoType: 'bogo50',
    },
    {
      id: 2,
      product: 'Nigiri salmon',
      imageCandidates: ['img/Nigiri salmon.jpg'],
      price: 9000,
      pieces: 2,
      promoType: 'bogo50',
    },
    {
      id: 3,
      product: 'Roll tokio',
      imageCandidates: ['img/Roll tokio.jpg'],
      price: 13000,
      pieces: 8,
      promoType: 'bogo50',
    },
    {
      id: 4,
      product: 'Mexican',
      imageCandidates: ['img/mexican.jpg'],
      price: 7500,
      pieces: 8,
      promoType: '3x2',
    },
    {
      id: 5,
      product: 'Bombay roll',
      imageCandidates: ['img/Bombay roll.jpg'],
      price: 8200,
      pieces: 8,
      promoType: '3x2',
    },
    {
      id: 6,
      product: 'Spicy salmon',
      imageCandidates: ['img/Spicy salmon.jpg'],
      price: 9500,
      pieces: 8,
      promoType: '3x2',
    },
  ]

  const group50 = document.getElementById('promotionsGroup50')
  const group3x2 = document.getElementById('promotionsGroup3x2')
  const linesContainer = document.getElementById('linesContainer')
  const totalRawEl = document.getElementById('totalRaw')
  const totalDiscountEl = document.getElementById('totalDiscount')
  const totalFinalEl = document.getElementById('totalFinal')
  const btnReset = document.getElementById('btnReset')

  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = () => reject(src)
      img.src = src
    })
  }

  async function setImageWithFallback(imgEl, candidates) {
    const list = Array.isArray(candidates) ? candidates.slice() : []
    const FALLBACK = 'img/login.png'
    if (!list.includes(FALLBACK)) list.push(FALLBACK)

    for (const src of list) {
      try {
        await preloadImage(src)
        imgEl.src = src
        return
      } catch (e) {}
    }
    imgEl.src = FALLBACK
  }

  function renderGroups() {
    if (!group50 || !group3x2) return
    group50.innerHTML = ''
    group3x2.innerHTML = ''

    promotions.forEach((p) => {
      const article = document.createElement('article')
      article.className = 'pieza'

      const img = document.createElement('img')
      img.alt = p.product
      img.style.display = 'block'
      img.style.width = '100%'
      img.style.height = '180px'
      img.style.objectFit = 'cover'
      setImageWithFallback(img, p.imageCandidates)

      const info = document.createElement('div')
      info.className = 'info'

      const h3 = document.createElement('h3')
      h3.textContent = p.product

      const meta = document.createElement('div')
      meta.style.color = '#666'
      meta.style.fontSize = '.95rem'
      meta.style.margin = '.25rem 0'
      meta.textContent = `${p.pieces} piezas · ${fmt.format(p.price)}`

      const qtyWrap = document.createElement('div')
      qtyWrap.style.display = 'flex'
      qtyWrap.style.gap = '.6rem'
      qtyWrap.style.alignItems = 'center'
      qtyWrap.style.marginTop = '.6rem'

      const label = document.createElement('label')
      label.style.display = 'flex'
      label.style.alignItems = 'center'
      label.style.gap = '.4rem'
      label.style.marginLeft = 'auto'

      const span = document.createElement('span')
      span.style.fontSize = '.9rem'
      span.textContent = 'Cantidad'

      const input = document.createElement('input')
      input.className = 'qty-input'
      input.type = 'number'
      input.min = '0'
      input.value = '0'
      input.dataset.id = String(p.id)
      input.style.width = '72px'
      input.style.padding = '.3rem'
      input.style.borderRadius = '6px'
      input.style.border = '1px solid rgba(0,0,0,.12)'

      label.appendChild(span)
      label.appendChild(input)
      qtyWrap.appendChild(label)

      info.appendChild(h3)
      info.appendChild(meta)
      info.appendChild(qtyWrap)

      article.appendChild(img)
      article.appendChild(info)

      if (p.promoType === 'bogo50') group50.appendChild(article)
      else group3x2.appendChild(article)
    })
  }

  function calculate() {
    const qtyInputs = Array.from(document.querySelectorAll('.qty-input'))
    let totalRaw = 0
    let totalDiscount = 0
    linesContainer.innerHTML = ''

    promotions.forEach((p) => {
      const input = qtyInputs.find((i) => Number(i.dataset.id) === p.id)
      const qty = input ? Math.max(0, Math.floor(Number(input.value) || 0)) : 0
      const lineRaw = qty * p.price
      let lineDiscount = 0

      if (p.promoType === 'bogo50') {
        lineDiscount = Math.floor(qty / 2) * p.price * 0.5
      } else if (p.promoType === '3x2') {
        lineDiscount = Math.floor(qty / 3) * p.price
      }

      const lineFinal = lineRaw - lineDiscount
      totalRaw += lineRaw
      totalDiscount += lineDiscount

      if (qty > 0) {
        const lineEl = document.createElement('div')
        lineEl.style.display = 'flex'
        lineEl.style.justifyContent = 'space-between'
        lineEl.style.gap = '.5rem'
        lineEl.innerHTML = `
          <div style="min-width:220px">
            <strong>${
              p.product
            }</strong> <span style="color:#666">x ${qty}</span>
          </div>
          <div style="text-align:right;min-width:160px">
            <div>${fmt.format(lineRaw)}</div>
            <div style="color:#c00">- ${fmt.format(lineDiscount)}</div>
            <div style="font-weight:700">${fmt.format(lineFinal)}</div>
          </div>
        `
        linesContainer.appendChild(lineEl)
      }
    })

    const subtotalAfterProductDiscounts = totalRaw - totalDiscount
    let thresholdDiscount = 0
    if (subtotalAfterProductDiscounts > GLOBAL_THRESHOLD) {
      thresholdDiscount =
        subtotalAfterProductDiscounts * GLOBAL_THRESHOLD_DISCOUNT
      totalDiscount += thresholdDiscount
    }

    if (thresholdDiscount > 0) {
      const thrEl = document.createElement('div')
      thrEl.style.display = 'flex'
      thrEl.style.justifyContent = 'space-between'
      thrEl.style.gap = '.5rem'
      thrEl.innerHTML = `
        <div style="min-width:220px">
          <strong>Descuento 10% (compras > ${fmt.format(
            GLOBAL_THRESHOLD
          )})</strong>
          <div style="font-size:.9rem;color:#444">Aplicado sobre subtotal después de promociones</div>
        </div>
        <div style="text-align:right;min-width:160px">
          <div></div>
          <div style="color:#c00">- ${fmt.format(thresholdDiscount)}</div>
          <div style="font-weight:700">${fmt.format(
            subtotalAfterProductDiscounts - thresholdDiscount
          )}</div>
        </div>
      `
      linesContainer.appendChild(thrEl)
    }

    const totalFinal = totalRaw - totalDiscount
    totalRawEl.textContent = fmt.format(totalRaw)
    totalDiscountEl.textContent = `-${fmt.format(totalDiscount)}`
    totalFinalEl.textContent = fmt.format(totalFinal)
  }

  renderGroups()
  calculate()

  document.addEventListener('input', (e) => {
    if (e.target && e.target.classList.contains('qty-input')) calculate()
  })

  btnReset.addEventListener('click', () => {
    document.querySelectorAll('.qty-input').forEach((i) => (i.value = 0))
    calculate()
  })
})

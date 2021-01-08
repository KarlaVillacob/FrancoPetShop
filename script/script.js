const getCartNumber = () => {
  var number = JSON.parse(localStorage.getItem("cart"))
  var navCart = document.getElementById('navCart')
  navCart.innerHTML = `(${number || 0})`
}

class User {
  constructor (dni, code) {
    this.dni = dni,
    this.code = code, 
    this.used = false
  }
}

const home = () => {
  getCartNumber()
  const formCoupon = document.getElementById('form-coupon')
  var modalCoupon = new bootstrap.Modal(document.getElementById('home-coupon'))
  var modalNumberCoupon = new bootstrap.Modal(document.getElementById('coupon'))

  formCoupon.onsubmit = function(e) {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem("users")) || []
    dni = e.target.elements.dni.value
    const userFiltered = users.filter(user => user.dni === dni)
    console.log(userFiltered)
    if (userFiltered.length > 0 ) {
      const title = document.getElementById('number-coupon')
      if (userFiltered[0].used) {
        title.innerHTML = `Tu Cupón ya fue usado`
      } else {
        title.innerHTML = `CUPON: ${userFiltered[0].code}`
      }
    } else {
      code = Math.floor(Math.random()*16777215).toString(16)
      const user = new User(dni, code)
      localStorage.setItem("users", JSON.stringify([...users, user]))
      const title = document.getElementById('number-coupon')
      title.innerHTML = `CUPON: ${code}`
    }
    modalCoupon.hide()
    modalNumberCoupon.show()
    formCoupon.reset()
  }
}

const getApi = (page) => {
  fetch('https://apipetshop.herokuapp.com/api/articulos')
  .then(response => response.json())
  .then(data => showProducts(data, page))
}

if (document.querySelector('#pharmacy')){
  getApi('Medicamento')
} else if (document.querySelector('#toys')) {
  getApi('Juguete')
} else if (document.querySelector('#cart')) {
  constructorCart()
} else if (document.querySelector('#contact')) {
  sendFormContact()
} else {
  home()
}

const showProducts = (data, page) => {
  const products = data.response.filter(product => product.tipo === page)
  var productsFilter
  const filterInput = document.getElementById('filterProduct')
  getCartNumber()
  products.map(product => {
    constructorCard(product)
  })
  filterInput.onkeyup = (e) => {
    const container = document.getElementById('container')
    var row = document.getElementById('row')
    container.removeChild(row)
    row.innerHTML = `<div class="row d-flex justify-content-center" id='row'></div>`
    container.appendChild(row)
    const text = document.createElement('div')
    if (e.target.value !== '') {
      productsFilter = products.filter(product => (product.nombre).toLowerCase().includes((e.target.value).toLowerCase()))
      if (productsFilter.length > 0) {
        productsFilter.map(product => {
          constructorCard(product)
        }) 
      } else {
        text.innerHTML = "<h2 class='text-white mt-2'>No se encontraron productos</h2>"
        row.appendChild(text)
      }
    } else {
      products.map(product => {
        constructorCard(product)
      })
    }
  }
}

const constructorCard = (product) => {
  const container = document.getElementsByClassName('row')
  const card = document.createElement('div')
  card.innerHTML = 
    `<img src=${product.imagen} class="card-img-top" alt="...">
    <div class="card-body">
      <h4 class="card-title title-card">${product.nombre}</h4>
      <p class="card-text">PRECIO: $${product.precio}</p>
      <div class='d-flex justify-content-center'>
        <button id=${product._id}-detail type="button" class="btn btn-primary btn-card" data-bs-toggle="modal" data-bs-target="#detailProduct">Detalle</button>
        <button id=${product._id}-buy type="button" class="btn btn-success btn-card" data-bs-toggle="modal" data-bs-target="#buy">Compra</button>
      </div>
      ${(product.stock < 5) ? '<p class="last-units">Ultimas Unidades!!</p>' : ''}
    </div>`
  card.className = 'card products col-4 m-3'
  container[0].appendChild(card)

  const buttonDetail = document.getElementById(`${product._id}-detail`)
  buttonDetail.addEventListener('click', () => {
    const titleModal = document.getElementById('staticBackdropLabel')
    const descriptionModal = document.getElementById('description')
    const priceModal = document.getElementById('price')
    const imgModal = document.getElementById('img-modal')
    titleModal.innerHTML = product.nombre
    imgModal.innerHTML = `<img src=${product.imagen} class="card-img-top" alt="...">`
    descriptionModal.innerHTML = product.descripcion
    priceModal.innerHTML = `PRECIO: $${product.precio}`
  })
  const buttonBuy = document.getElementById(`${product._id}-buy`)
  buttonBuy.addEventListener('click', () => {
    const titleModal = document.getElementById('titleAddCart')
    const buttonAddCart = document.getElementById('buttonAddCart')
    const inputQuantity = document.getElementById('inputQuantity')
    inputQuantity.setAttribute('max', product.stock)
    titleModal.innerHTML = product.nombre
    buttonAddCart.onclick = () => {
      var products = JSON.parse(localStorage.getItem("array")) || []
      var cartNumber = JSON.parse(localStorage.getItem("cart"))
      cartNumber = cartNumber + parseInt(inputQuantity.value) 
      localStorage.setItem("cart", JSON.stringify(cartNumber))
      let position = products.findIndex(item => item._id === product._id)
      if (position >= 0) {
        products[position].quantity += parseInt(inputQuantity.value)
      } else {
        product.quantity = parseInt(inputQuantity.value) 
        products.push(product)
      }
      localStorage.setItem("array", JSON.stringify(products))
      inputQuantity.value = '1'
      getCartNumber()
      var toast = document.getElementById('toast-buy')
      var toastEl = new bootstrap.Toast(toast)
      toastEl.show()
    }
  })
}

function containerProductCart(card, product) {
  card.innerHTML = 
    `<div class="row no-gutters">
      <div class="col-md-4 img-cart d-flex justify-content-center align-items-center"><img src=${product.imagen} alt="..."></div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${product.nombre}</h5>
            <div class="d-flex">
              <p class="card-text text-cart">PRECIO: $${product.precio}</p>
              <div class='d-flex align-items-center container-input-cart'>
                <p class="card-text h4-noMargin">CANTIDAD:</p>
                <input class="form-control" type="number" min='1' value=${product.quantity} max='${product.stock}' id=${product._id}-input>
              </div>
              <p class="card-text text-cart" id=${product._id}-total>TOTAL: $${product.quantity * product.precio}</p>
            </div>
            <div class='d-flex justify-content-end'>
              <button id=${product._id}-delete type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#detailProduct">Borrar</button>
            </div>
        </div>
      </div>
    </div>`
}

function constructorCart() {
  getCartNumber()
  var sumTotal = 0
  var products = JSON.parse(localStorage.getItem("array"))
  const container = document.getElementById('container')
  const row = document.getElementById('row-cart')
  container.removeChild(row)
  row.innerHTML = `<div class="row d-flex justify-content-center" id='row'></div>`
  container.appendChild(row)

  if (!products || products.length < 1) {
  const text = document.createElement('div')
  text.innerHTML = '<h4>No hay productos...</h4>'
  row.appendChild(text)
  } else {
    products.map(product => {
      sumTotal = sumTotal + (product.quantity * product.precio)
      const card = document.createElement('div')
      containerProductCart(card, product)
      card.className = 'card products-cart col-12 m-3'
      row.appendChild(card)

      const inputCart = document.getElementById(`${product._id}-input`)
      inputCart.addEventListener('change', (e) => {
        const id = e.target.id.split('-')[0]
        var productsQuantity = JSON.parse(localStorage.getItem("array"))
        var position = productsQuantity.findIndex(item => item._id === id)
        if (position >=0) {
          productsQuantity[position].quantity = parseInt(e.target.value)
          var cart_number = productsQuantity.reduce( (a, b) => a + parseInt(b.quantity), 0)
          var total_number = productsQuantity.reduce( (a, b) => a + (parseInt(b.quantity) * parseInt(b.precio)), 0)
          localStorage.setItem("array", JSON.stringify(productsQuantity))
          localStorage.setItem("cart", JSON.stringify(cart_number))
          
          pTotal = document.getElementById(`${product._id}-total`)
          totalCart = document.getElementById('total-cart')
          before_total = document.getElementById('before-total')
          pTotal.innerText = `TOTAL: $${e.target.value * product.precio}`

          if (before_total) {
            before_total.innerHTML = `<span class="bold" id='before-total'>TOTAL: <span class='text-decoration-line-through'>$${(total_number).toFixed(2)}</span></span>`
            totalCart.innerText = `TOTAL A PAGAR: $${(total_number - (total_number * 0.15)).toFixed(2)}`
          } else {
            totalCart.innerText = `TOTAL A PAGAR: $${(total_number).toFixed(2)}`
          }
          getCartNumber()
        }
      })

      const buttonDelete = document.getElementById(`${product._id}-delete`)
      buttonDelete.addEventListener('click', () => {
        const productsFilter = products.filter(item => item._id !== product._id)
        localStorage.setItem("array", JSON.stringify(productsFilter))
        const productDelete = products.find(item => item._id === product._id)
        var number = JSON.parse(localStorage.getItem("cart"))
        number = number - productDelete.quantity
        localStorage.setItem("cart", JSON.stringify(number))
        const input_coupon = document.getElementById('coupon-cart')
        
        constructorCart()
        if (input_coupon.value) {
          const total = document.getElementById('total')
          if (products.length > 1) {
            var productsQuantity = JSON.parse(localStorage.getItem("array"))
            var total_number = productsQuantity.reduce( (a, b) => a + (parseInt(b.quantity) * parseInt(b.precio)), 0)
            total.innerHTML = `
              <div class='d-flex flex-column' id='container-total'>
                <span class="bold" id='before-total'>TOTAL: <span class='text-decoration-line-through'>$${(total_number).toFixed(2)}</span></span>
                <span class="bold text-success" id='total-cart'>TOTAL A PAGAR: $${(total_number - (total_number * 0.15)).toFixed(2)}</span>
              </div>`
          } else {
            const button_check_coupon = document.getElementById('check-coupon')
            button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-dark'
            const response = document.getElementById('response-coupon')
            input_coupon.value = ''
            response.innerHTML = ''
            total.innerHTML = `<span class="bold" id='total-cart'>TOTAL A PAGAR: $${(total_number).toFixed(2)}</span>`
          }
        }
     })
    }
  )}

  const total = document.getElementById('total')
  total.innerHTML = `<span class="bold" id='total-cart'>TOTAL A PAGAR: $${(sumTotal).toFixed(2)}</span>`
  const cartBuy = document.getElementById('cart-buy')
  cartBuy.onclick = () => {
    var toast = document.getElementById('toast-buy-cart')
    var toastEl = new bootstrap.Toast(toast)
    toastEl.show()
    var productsCart = JSON.parse(localStorage.getItem("array"))
    productsCart = []
    localStorage.setItem("array", JSON.stringify(productsCart))
    var number = JSON.parse(localStorage.getItem("cart"))
    var navCart = document.getElementById('navCart')
    number = 0
    navCart.innerHTML = `(${number})`
    localStorage.setItem("cart", JSON.stringify(number))

    const input_coupon = document.getElementById('coupon-cart')
    var users = JSON.parse(localStorage.getItem("users")) || []
    const position = users.findIndex(item => item.code === input_coupon.value)

    if (users.length > 0 && (users[position])) {
      users[position].used = true
    }
    localStorage.setItem("users", JSON.stringify(users))
    input_coupon.value = ''

    const response = document.getElementById('response-coupon')
    response.innerHTML = ''
    const button_check_coupon = document.getElementById('check-coupon')
    button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-dark'

    constructorCart()
  }

  const button_check_coupon = document.getElementById('check-coupon')
  button_check_coupon.addEventListener('click', (e) => {
    const input_coupon = document.getElementById('coupon-cart')
    var users = JSON.parse(localStorage.getItem("users"))
    var user = users.filter(item => item.code === input_coupon.value)
    if (user.length > 0) {
      const response = document.getElementById('response-coupon')
      if (!user[0].used) {
        button_check_coupon.children[0].classList = ''
        button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-success'
        response.innerText = 'Cupón valido para su uso'
        response.classList = ''
        response.classList = 'text-end text-success'
        total.innerHTML = `
        <div class='d-flex flex-column' id='container-total'>
          <span class="bold" id='before-total'>TOTAL: <span class='text-decoration-line-through'>$${(sumTotal).toFixed(2)}</span></span>
          <span class="bold text-success" id='total-cart'>TOTAL A PAGAR: $${(sumTotal - (sumTotal * 0.15)).toFixed(2)}</span>
        </div>`
      } else {
        button_check_coupon.children[0].classList = ''
        button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-danger'
        response.innerText = 'Cupón ya fué usado'
        response.classList = ''
        response.classList = 'text-end text-danger'
      }
    } else {
      const button_check_coupon = document.getElementById('check-coupon')
      button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-danger'
      const response = document.getElementById('response-coupon')
      response.innerText = 'Cupón no disponible'
      response.classList.add('text-danger')
    }
  })
  const button_x_coupon = document.getElementById('x-coupon')
  button_x_coupon.addEventListener('click', () => {
    const input_coupon = document.getElementById('coupon-cart')
    const container_total = document.getElementById('container-total')
    input_coupon.value = ''
    const response = document.getElementById('response-coupon')
    if (container_total) {
      total.innerHTML = `<span class="bold" id='total-cart'>TOTAL A PAGAR: $${(sumTotal).toFixed(2)}</span>`
      response.innerHTML = ''
      const button_check_coupon = document.getElementById('check-coupon')
      button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-dark'
    } else {
      response.innerHTML = ''
      const button_check_coupon = document.getElementById('check-coupon')
      button_check_coupon.children[0].classList = 'bi bi-check-circle-fill text-dark'
    }
  })
}

function sendFormContact() {
  getCartNumber()
  var toast = document.getElementById('toast')
  var toastEl = new bootstrap.Toast(toast)
  const formContact = document.getElementById('formContact')
  formContact.onsubmit = function(e) {
    e.preventDefault()
    toastEl.show()
    formContact.reset()
  }
}
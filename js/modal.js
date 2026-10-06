const modalOverlay = document.createElement('div')
const modal = document.createElement('div')
const modalContent = document.createElement('div')

modalOverlay.classList.add('modal-overlay')
modal.classList.add('modal')
modalContent.classList.add('modal__content')

modal.append(modalContent)
modalOverlay.append(modal)
document.body.append(modalOverlay)

function closeModal() {
  modalOverlay.classList.remove('is-open')
  document.body.classList.remove('modal-open')
}

function openModal(content) {
  modalContent.replaceChildren(...content)
  modalOverlay.classList.add('is-open')
  document.body.classList.add('modal-open')
}

modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) closeModal()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal()
})

export { openModal, closeModal }

const app = document.createElement('main')
app.classList.add('app')

const title = document.createElement('h1')
title.classList.add('app__title')
title.textContent = 'Memory Game'

app.append(title)
document.body.append(app)

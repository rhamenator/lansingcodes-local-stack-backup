(function () {
  function cloneElement(element, cloneCount) {
    for (let i = 0; i < cloneCount; i++) {
      const clone = element.cloneNode(true)
      element.insertAdjacentElement('afterend', clone)
    }
  }

  function updateLineNumbers() {
    let lineNumber = 1
    document.querySelectorAll('.line-number').forEach((elem) => {
      elem.innerText = lineNumber++
    })
  }

  // Keep event form and print in sync
  const eventInput = document.getElementById('eventInput')
  eventInput.addEventListener('input', function () {
    Array.from(document.getElementsByClassName('eventPrint')).forEach((eventPrint) => {
      eventPrint.textContent = eventInput.value
    })
  })

  // Repeat elements as indicated
  const elementsToRepeat = document.querySelectorAll('[data-repeat]')
  elementsToRepeat.forEach(function (element) {
    const repeatCount = parseInt(element.getAttribute('data-repeat')) || 0
    cloneElement(element, repeatCount)
  })

  // update the number of pages
  const pageCount = document.getElementById('pageCount')
  pageCount.addEventListener('input', function () {
    const currentPageCount = document.getElementsByTagName('main').length
    const desiredPageCount = Math.max(1, parseInt(pageCount.value, 10) || 1)
    pageCount.value = String(desiredPageCount)
    
    // add pages as needed
    cloneElement(document.getElementsByTagName('main')[0], desiredPageCount - currentPageCount)
    
    // remove extra pages
    for (let i = currentPageCount; i > desiredPageCount; i--) {
      document.getElementsByTagName('main')[1].remove()
    }

    // make sure clones don't have title input
    document.querySelectorAll('main:not(:first-of-type)').forEach((elem) => {
      const eventInput = elem.querySelector('#eventInput')
      if (eventInput) {
        eventInput.remove()
      }
    })

    updateLineNumbers()
  })

  // toggle line numbers
  const showLineNumbers = document.getElementById('showLineNumbers')
  showLineNumbers.addEventListener('input', function () {
    const body = document.getElementsByTagName('body')[0]
    if (showLineNumbers.checked) {
      body.classList.add('show-line-numbers')
    } else {
      body.classList.remove('show-line-numbers')
    }
  })

  updateLineNumbers()
})()

window.addEventListener('DOMContentLoaded', event => {
  // Progressive enhancement: add box shadow and opacity on scroll from top
  document.addEventListener('scroll', (e) => {
    console.log(window.scrollY)
    if (window.scrollY !== 0) {
      document.querySelector('nav').classList.add('shadow')
    } else {
      document.querySelector('nav').classList.remove('shadow')
    }
  })
})

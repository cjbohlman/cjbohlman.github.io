window.addEventListener('DOMContentLoaded', event => {
  // Progressive enhancement: add box shadow and opacity on scroll from top
  document.addEventListener('scroll', (e) => {
    console.log(window.scrollY)
    if (window.scrollY !== 0) {
      document.querySelector('header').classList.add('shadow-lg', 'shadow-black')
    } else {
      document.querySelector('header').classList.remove('shadow-lg', 'shadow-black')
    }
  })
})

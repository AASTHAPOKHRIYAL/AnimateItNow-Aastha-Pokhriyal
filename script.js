// Function to make the FAQ collapsible
function toggleFAQ(element) {
  if (!document.querySelector(".faq-item")) return
  const faqItem = element.closest(".faq-item") //to make sure we can click anywhere
  const isActive = faqItem.classList.contains("active")

  // Close all other FAQ items
  document.querySelectorAll(".faq-item.active").forEach((item) => {
    if (item !== faqItem) {
      item.classList.remove("active")
    }
  })

  // Toggle current item
  faqItem.classList.toggle("active", !isActive)
}

// Make toggleFAQ globally accessible
window.toggleFAQ = toggleFAQ

// ADIL did: Global (or module-level) variables to store animation and listener references for snake cursor
let currentAnimationId = null
let currentMousemoveListener = null
let snakeContainerElement = null // ADIL did: Keep a reference to the container element

// ADIL did: Removed the problematic 'const lucide = { createIcons: () => {}, }' declaration.
// The actual 'lucide' object is provided by the external script loaded in HTML.
// Declaring it as 'const' here prevented the global 'lucide' from being used.

// ADIL did: Moved cursor functions outside DOMContentLoaded for better scope and reusability
const isMobile = window.matchMedia("(max-width: 768px)").matches

function enableSnakeCursor() {
  // ADIL did: Always ensure a clean slate before enabling.
  // This is crucial for persistence across page navigations (especially with bfcache).
  disableSnakeCursor()

  snakeContainerElement = document.createElement("div") // ADIL did: Assign to global variable
  snakeContainerElement.id = "cursor-snake"
  document.body.appendChild(snakeContainerElement)

  const dots = []
  const dotCount = 20
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement("div")
    dot.className = "snake-dot"
    snakeContainerElement.appendChild(dot) // ADIL did: Append to the new global container
    dots.push({ el: dot, x: 0, y: 0 })
  }

  let mouseX = window.innerWidth / 2
  let mouseY = window.innerHeight / 2

  // ADIL did: Store event listener reference in a global variable
  currentMousemoveListener = (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }
  document.addEventListener("mousemove", currentMousemoveListener)

  function animateSnake() {
    let x = mouseX,
      y = mouseY
    dots.forEach((dot, i) => {
      dot.x += (x - dot.x) * 0.2
      dot.y += (y - dot.y) * 0.2
      dot.el.style.left = dot.x + "px"
      dot.el.style.top = dot.y + "px"
      dot.el.style.transform = `scale(${1 - i / dotCount})`
      x = dot.x
      y = dot.y
    })
    // ADIL did: Store the animation ID in a global variable
    currentAnimationId = requestAnimationFrame(animateSnake)
  }
  animateSnake()
}

function disableSnakeCursor() {
  // ADIL did: Use the global reference to the container element
  if (snakeContainerElement) {
    if (currentAnimationId) {
      cancelAnimationFrame(currentAnimationId)
      currentAnimationId = null // Reset global ID
    }
    if (currentMousemoveListener) {
      document.removeEventListener("mousemove", currentMousemoveListener)
      currentMousemoveListener = null // Reset global listener
    }
    snakeContainerElement.remove() // Remove the cursor container
    snakeContainerElement = null // Reset global reference
  }
}

// ADIL did: Add event listener for page unload to ensure cleanup, especially for bfcache
window.addEventListener("pagehide", () => {
  disableSnakeCursor()
})

window.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle")
  const body = document.body
  function setTheme(dark) {
    const newIcon = dark ? "sun" : "moon"
    body.classList.toggle("dark", dark) // ADIL did: Use 'dark' class for consistency
    localStorage.setItem("theme", dark ? "dark" : "light")
    // Replace icon completely
    if (themeToggle) {
      themeToggle.innerHTML = `<i data-lucide="${newIcon}"></i>`
      // ADIL did: Only call lucide.createIcons() if the lucide object is actually available
      if (window.lucide) {
        window.lucide.createIcons()
      }
    }
  }
  const savedTheme = localStorage.getItem("theme")
  setTheme(savedTheme === "dark")
  themeToggle?.addEventListener("click", () => {
    const isDark = body.classList.contains("dark") // ADIL did: Check for 'dark' class
    setTheme(!isDark)
  })
  // ADIL did: Only call lucide.createIcons() if the lucide object is actually available
  // This ensures icons are created on initial load if the library is ready.
  if (window.lucide) {
    window.lucide.createIcons()
  }

  // 🔽 Scroll Reveal Animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
          // observer.unobserve(entry.target); // uncomment to animate only once
        }
      })
    },
    { threshold: 0.2 },
  )
  document.querySelectorAll(".scroll-fade").forEach((el) => {
    observer.observe(el)
  })

  // 🧪 Testimonial slider
  const slider = document.getElementById("slider")
  if (slider) {
    const slides = document.querySelectorAll(".card")
    let current = 0
    function showSlide(index) {
      const total = slides.length
      if (index >= total) current = 0
      else if (index < 0) current = total - 1
      else current = index
      slider.style.transform = `translateX(-${current * 100}%)`
    }
    function nextSlide() {
      showSlide(current + 1)
    }
    setInterval(() => {
      nextSlide()
    }, 5000)
  }

  // 🧑‍💻 Contributors fetch
  const contributorsGrid = document.getElementById("contributors-grid")
  if (contributorsGrid) {
    fetch("https://api.github.com/repos/itsAnimation/AnimateItNow/contributors")
      .then((res) => res.json())
      .then((contributors) => {
        contributorsGrid.innerHTML = ""
        contributors.forEach((contributor) => {
          const card = document.createElement("a")
          card.href = contributor.html_url
          card.className = "contributor-card"
          card.target = "_blank"
          card.rel = "noopener noreferrer"
          card.innerHTML = `
            <img src="${contributor.avatar_url}" alt="${contributor.login}" class="contributor-avatar">
            <h3>${contributor.login}</h3>
            <p>Contributions: ${contributor.contributions}</p>
          `
          contributorsGrid.appendChild(card)
        })
      })
      .catch((err) => {
        console.error("Error fetching contributors:", err)
        contributorsGrid.innerHTML = "<p>Could not load contributors at this time.</p>"
      })
  }

  // 📨 Contact form validation
  const contactForm = document.querySelector(".contact-form")
  // ADIL did: Removed the problematic 'if (!contactForm) return;' line.
  // This line was preventing the rest of the DOMContentLoaded block (including theme toggle and cursor logic)
  // from executing on pages that do not have a .contact-form element.
  const formInputs = contactForm ? contactForm.querySelectorAll("input[required], textarea[required]") : []
  if (contactForm) {
    function checkFormValidity() {
      return [...formInputs].every((input) => input.value.trim() !== "")
    }
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const allValid = checkFormValidity()
      if (allValid) {
        alert("Message sent successfully!")
        contactForm.reset()
      } else {
        alert("Please fill in all fields correctly. Fields cannot be empty or contain only spaces.")
      }
    })
    formInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const allFieldsFilled = checkFormValidity()
        input.classList.toggle("invalid", !allFieldsFilled)
      })
    })
  }

  // ADIL did: Snake cursor initialization and state management
  const cursorToggle = document.getElementById("cursorToggle")
  if (!isMobile && cursorToggle) {
    // ADIL did: Read saved state from localStorage for initial setup
    const savedCursorState = localStorage.getItem("cursorEnabled")
    // ADIL did: Default to false if no state is saved, or use the saved state
    const initialCursorEnabled = savedCursorState !== null ? JSON.parse(savedCursorState) : false

    // ADIL did: Set initial state of the toggle checkbox
    cursorToggle.checked = initialCursorEnabled

    // ADIL did: Apply initial cursor state immediately
    if (initialCursorEnabled) {
      enableSnakeCursor()
    } else {
      disableSnakeCursor()
    }

    // ADIL did: Add event listener for changes to toggle cursor and save state
    cursorToggle.addEventListener("change", function () {
      if (this.checked) {
        enableSnakeCursor()
        localStorage.setItem("cursorEnabled", "true")
      } else {
        disableSnakeCursor()
        localStorage.setItem("cursorEnabled", "false")
      }
    })
  }

  // 🚦 ProgressBar Functionality
  function updateProgressBar() {
    const windowScroll = document.body.scrollTop || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrollPercent = (windowScroll / documentHeight) * 100
    const progressBar = document.getElementById("progress-bar")
    if (progressBar) {
      progressBar.style.width = scrollPercent + "%"
    }
  }
  window.addEventListener("scroll", updateProgressBar)
  // Initialize on load
  updateProgressBar()
})

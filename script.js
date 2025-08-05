document.addEventListener('DOMContentLoaded', () => {
    const addNoteButton = document.getElementById('addNote')
    const board = document.getElementById('board')
    const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-green-200', 'bg-blue-200']
    let colorIndex = 0
    let currentZIndex = 1

    addNoteButton.addEventListener('click', () => {
        const note = document.createElement('div')
        const currentColor = colors[colorIndex]
        colorIndex = (colorIndex + 1) % colors.length

        note.style.position = 'absolute'
        note.style.zIndex = currentZIndex++
        note.className = `note absolute w-40 h-40 ${currentColor} shadow-md rounded cursor-default relative flex flex-col`

        const headerPostIt = document.createElement('div')
        headerPostIt.className = 'h-6 w-full cursor-move relative'
        note.appendChild(headerPostIt)



        const closeBtn = document.createElement('button')
        closeBtn.textContent = '×'
        closeBtn.className = 'absolute top-0 right-0 text-black font-bold w-6 h-6 flex items-center justify-center z-10'
        closeBtn.addEventListener('click', () => {
            board.removeChild(note)
            saveNotes()
        })
        headerPostIt.appendChild(closeBtn)

        const paletteBtn = document.createElement('button')
        paletteBtn.textContent = '🎨'
        paletteBtn.className = 'absolute top-1 left-0 text-black font-bold w-6 h-6 flex items-center justify-center z-10'
        headerPostIt.appendChild(paletteBtn)

        const colorMenu = document.createElement('div')
        colorMenu.className = 'absolute left-6 top-1 flex gap-1 p-1 bg-white rounded shadow hidden z-20'
        headerPostIt.appendChild(colorMenu)

        paletteBtn.addEventListener('click', () => {
            colorMenu.innerHTML = ''
            const currentColor = colors.find(color => note.classList.contains(color))
            colors.forEach(color => {
                if (color !== currentColor) {
                    const colorOption = document.createElement('div')
                    colorOption.className = `w-5 h-5 rounded-full cursor-pointer ${color} border border-gray-300`
                    colorOption.addEventListener('click', () => {
                        note.classList.remove(currentColor)
                        note.classList.add(color)
                        colorMenu.classList.add('hidden')
                        saveNotes()
                    })
                    colorMenu.appendChild(colorOption)
                }
            })
            colorMenu.classList.toggle('hidden')
        })

        const content = document.createElement('div')
        content.className = 'content p-2 flex-1 text-sm overflow-auto focus:outline-none'
        content.contentEditable = true
        content.addEventListener('input', () => {
            saveNotes()
        })

        note.appendChild(content)

        const boardRect = board.getBoundingClientRect()
        const noteWidth = 160
        const noteHeight = 160

        const maxX = Math.max(0, boardRect.width - noteWidth)
        const maxY = Math.max(0, boardRect.height - noteHeight)

        const posX = Math.floor(Math.random() * maxX)
        const posY = Math.floor(Math.random() * maxY)

        note.style.left = `${posX}px`
        note.style.top = `${posY}px`

        const resizeHandle = document.createElement('div')
        resizeHandle.className = 'absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize flex items-center justify-center z-20'
        resizeHandle.title = 'Redimensionar'
        resizeHandle.innerHTML = '<i class="bi bi-arrows-angle-expand text-gray-500 text-lg"></i>'
        note.appendChild(resizeHandle)

        resizeHandle.addEventListener('mousedown', function(e) {
            e.stopPropagation()
            e.preventDefault()
            const startX = e.clientX
            const startY = e.clientY
            const startWidth = note.offsetWidth
            const startHeight = note.offsetHeight
            const boardRect = board.getBoundingClientRect()
            const noteRect = note.getBoundingClientRect()
            note.style.zIndex = 1000

            function onMouseMove(ev) {
                const boardRect = board.getBoundingClientRect()
                const noteRect = note.getBoundingClientRect()
                const maxWidth = boardRect.width - (noteRect.left - boardRect.left)
                const maxHeight = boardRect.height - (noteRect.top - boardRect.top)
                const newWidth = Math.max(100, Math.min(maxWidth, startWidth + (ev.clientX - startX)))
                const newHeight = Math.max(60, Math.min(maxHeight, startHeight + (ev.clientY - startY)))
                note.style.width = newWidth + 'px'
                note.style.height = newHeight + 'px'
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
                note.style.zIndex = 2
                saveNotes()
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        })

        board.appendChild(note)
        saveNotes()
        makeDraggable(note)
    })

    const clearNotes = document.getElementById('clearNotes')
    clearNotes.addEventListener('click', () => { board.innerHTML = '' })

    function makeDraggable(element) {
        const dragHandle = element.querySelector('div')

        let isDragging = false
        let startX = 0
        let startY = 0
        let postItInitialLeft = 0
        let postItInitialTop = 0

        dragHandle.addEventListener('mousedown', (e) => {
            e.preventDefault()

            isDragging = true

            startX = e.clientX
            startY = e.clientY

            postItInitialLeft = parseInt(element.style.left, 10) || 0
            postItInitialTop = parseInt(element.style.top, 10) || 0

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
            element.style.zIndex = 1000
        })

        function onMouseMove(e) {
            if (!isDragging) return

            const dx = e.clientX - startX
            const dy = e.clientY - startY

            element.style.left = postItInitialLeft + dx + 'px'
            element.style.top = postItInitialTop + dy + 'px'
        }

        function onMouseUp() {
            isDragging = false
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            element.style.zIndex = 2
            saveNotes()
        }

        saveNotes()
    }

    function saveNotes() {
        const notes = []

        document.querySelectorAll('.note').forEach(note => {
            const content = note.querySelector('.content').innerText
            const left = parseInt(note.style.left, 10)
            const top = parseInt(note.style.top, 10)
            const color = [...note.classList].find(cls => cls.startsWith('bg-'))
            const width = note.offsetWidth
            const height = note.offsetHeight

            notes.push({ content, left, top, color, width, height })
        })

        localStorage.setItem('postits', JSON.stringify(notes))
    }

    function loadNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('postits') || '[]')

        savedNotes.forEach(noteData => {
            const note = document.createElement('div')
            note.style.position = 'absolute'
            note.style.left = `${noteData.left}px`
            note.style.top = `${noteData.top}px`
            note.style.zIndex = currentZIndex++
            note.className = `note absolute w-40 h-40 ${noteData.color} shadow-md rounded cursor-default relative flex flex-col`

            const header = document.createElement('div')
            header.className = 'h-6 w-full cursor-move relative'
            note.appendChild(header)

            const paletteBtn = document.createElement('button')
            paletteBtn.textContent = '🎨'
            paletteBtn.className = 'absolute top-0 left-0 text-black font-bold w-6 h-6 flex items-center justify-center z-10'
            header.appendChild(paletteBtn)

            const colorMenu = document.createElement('div')
            colorMenu.className = 'absolute left-6 top-0 flex gap-1 p-1 bg-white rounded shadow hidden z-20'
            header.appendChild(colorMenu)

            paletteBtn.addEventListener('click', () => {
                colorMenu.innerHTML = ''
                const currentColor = [...note.classList].find(cls => cls.startsWith('bg-'))

                colors.forEach(color => {
                    if (color !== currentColor) {
                        const colorOption = document.createElement('div')
                        colorOption.className = `w-5 h-5 rounded-full cursor-pointer ${color} border border-gray-300`
                        colorOption.addEventListener('click', () => {
                            note.classList.remove(currentColor)
                            note.classList.add(color)
                            colorMenu.classList.add('hidden')
                            saveNotes()
                        })
                        colorMenu.appendChild(colorOption)
                    }
                })

                colorMenu.classList.toggle('hidden')
            })

            const closeBtn = document.createElement('button')
            closeBtn.textContent = '×'
            closeBtn.className = 'absolute top-0 right-0 text-black font-bold w-6 h-6 flex items-center justify-center z-10'
            closeBtn.addEventListener('click', () => {
                board.removeChild(note)
                saveNotes()
            })
            header.appendChild(closeBtn)

            const content = document.createElement('div')
            content.className = 'content p-2 flex-1 text-sm overflow-auto focus:outline-none'
            content.contentEditable = true
            content.innerText = noteData.content
            content.addEventListener('input', () => {
                saveNotes()
            })
            note.appendChild(content)

            note.style.width = (noteData.width || 160) + 'px'
            note.style.height = (noteData.height || 160) + 'px'

            const resizeHandle = document.createElement('div')
            resizeHandle.className = 'absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize flex items-center justify-center z-20'
            resizeHandle.title = 'Redimensionar'
            resizeHandle.innerHTML = '<i class="bi bi-arrows-angle-expand text-gray-500 text-lg"></i>'
            note.appendChild(resizeHandle)

            resizeHandle.addEventListener('mousedown', function(e) {
                e.stopPropagation()
                e.preventDefault()
                const startX = e.clientX
                const startY = e.clientY
                const startWidth = note.offsetWidth
                const startHeight = note.offsetHeight
                const boardRect = board.getBoundingClientRect()
                const noteRect = note.getBoundingClientRect()
                note.style.zIndex = 1000

                function onMouseMove(ev) {
                    const maxWidth = boardRect.width - (noteRect.left - boardRect.left)
                    const maxHeight = boardRect.height - (noteRect.top - boardRect.top)
                    const newWidth = Math.max(100, Math.min(maxWidth, startWidth + (ev.clientX - startX)))
                    const newHeight = Math.max(60, Math.min(maxHeight, startHeight + (ev.clientY - startY)))
                    note.style.width = newWidth + 'px'
                    note.style.height = newHeight + 'px'
                }

                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    note.style.zIndex = 2
                    saveNotes()
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            })

            board.appendChild(note)

            makeDraggable(note)
        })
    }

    loadNotes()

    const toggleThemeBtn = document.getElementById('toggleTheme')
    const body = document.body

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.remove('bg-gray-100')
            body.classList.add('bg-gray-900')
            document.getElementById('board').classList.remove('bg-white')
            document.getElementById('board').classList.add('bg-gray-800', 'border-gray-700')
            themeIcon.classList.remove('bi-moon')
            themeIcon.classList.add('bi-sun')
        } else {
            body.classList.remove('bg-gray-900')
            body.classList.add('bg-gray-100')
            document.getElementById('board').classList.remove('bg-gray-800', 'border-gray-700')
            document.getElementById('board').classList.add('bg-white')
            themeIcon.classList.remove('bi-sun')
            themeIcon.classList.add('bi-moon')
        }
    }

    function getSavedTheme() {
        return localStorage.getItem('theme') || 'light'
    }

    toggleThemeBtn.addEventListener('click', () => {
        const currentTheme = getSavedTheme()
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    })

    applyTheme(getSavedTheme())
})
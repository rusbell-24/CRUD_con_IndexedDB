const agregarRegisto = document.getElementById('agregar')
const add = document.getElementById('add')
const form = document.getElementById('form')
const table = document.getElementById('tabla')
const indexedDB = window.indexedDB


if(indexedDB && form){
    let db
    const request = indexedDB.open('usersList',1)

    request.onsuccess =()=>{
        db = request.result
        console.log('OPEN',db)
        readData()

    }

    request.onupgradeneeded = () =>{
        db = request.result
        console.log('CREATE',db)
        const userObject = db.createObjectStore('Users',{
            autoIncrement: true
        })
    }
    request.onerror =()=>{
        console.log('Error',error)
    }


    //ABRE EL FORMULARIO
    agregarRegisto.addEventListener('click',()=>{
        agregarRegisto.style.display = 'none'
        form.style.display='flex'
    })

    //AÑADIR REGISTRO
    const addData =(data)=>{
        const transaction = db.transaction(['Users'], 'readwrite')
        const userObject = transaction.objectStore('Users')
        const request = userObject.add(data)
        readData()
    }

    //LEER TODOS LOS REGISTROS
    const readData = () => {
        const transaction = db.transaction(['Users'], 'readonly')
        const userObject = transaction.objectStore('Users')
        const request = userObject.openCursor()
        const fragment = document.createDocumentFragment()
        const trEncabezado = document.createElement('tr')
        trEncabezado.classList = 'encabezado'
        const tdNombre = document.createElement('td')
        tdNombre.textContent = 'Nombre'
        const tdApellido = document.createElement('td')
        tdApellido.textContent = 'Apellido'
        const tdCiudad = document.createElement('td')
        tdCiudad.textContent = 'Ciudad'
        const tdAccion = document.createElement('td')
        tdAccion.textContent = 'Accion'

        trEncabezado.appendChild(tdNombre)
        trEncabezado.appendChild(tdApellido)
        trEncabezado.appendChild(tdCiudad)
        trEncabezado.appendChild(tdAccion)

        fragment.appendChild(trEncabezado)

        request.onsuccess = (e) =>{
            const cursor = e.target.result
            if(cursor){

                const trUser = document.createElement('tr')

                const tdName = document.createElement('td')
                tdName.textContent = cursor.value.nombre
                
                const tdApellido = document.createElement('td')
                tdApellido.textContent = cursor.value.apellido
                
                const tdCiudad = document.createElement('td')
                tdCiudad.textContent = cursor.value.ciudad

                const tdAccion = document.createElement('td')
                
                const update = document.createElement('button')
                update.dataset.type = 'update'
                update.classList = 'update'
                update.textContent = 'Update'
                update.dataset.key = cursor.key

                const btndelete = document.createElement('button')
                btndelete.dataset.type = 'delete'
                btndelete.classList = 'delete'
                btndelete.textContent = 'Delete'
                btndelete.dataset.key = cursor.key
                
                tdAccion.appendChild(update)
                tdAccion.appendChild(btndelete)

                trUser.appendChild(tdName)
                trUser.appendChild(tdApellido)
                trUser.appendChild(tdCiudad)
                trUser.appendChild(tdAccion)
                fragment.appendChild(trUser)

                cursor.continue()
            }else{
                table.textContent = ''
                table.appendChild(fragment)
            }
        }
        request.onerror = () => {
            console.log('Error', error)
        }
    }

    // TRAER INFORMACION DE X REGISTRO
    const getData = (key) =>{
        const transaction = db.transaction(['Users'],'readwrite')
        const objectStore = transaction.objectStore('Users')
        const request = objectStore.get(key)

        request.onsuccess = () =>{
            form.nombre.value = request.result.nombre
            form.apellido.value =request.result.apellido
            form.ciudad.value = request.result.ciudad
            form.add.value  = 'actualizar'
            form.add.dataset.key = key
            form.style.display = 'flex'
            agregarRegisto.style.display = 'none'

        }
    }

    //ACTUALIZAR X REGISTRO
    const updateData = (data,key) =>{
        console.log(key)
        const transaction = db.transaction(['Users'],'readwrite')
        const userObject = transaction.objectStore('Users')
        const request = userObject.put(data,key)
        
        request.onsuccess = () =>{
            readData()
        }
    }

    //ELIMIAR REGISTRO
    const deleteData = (key) =>{
        console.log(key)
        const transaction = db.transaction(['Users'],'readwrite')
        const objectStore = transaction.objectStore('Users')
        const request = objectStore.delete(key)

        request.onsuccess = () =>{
            readData()
        }
    }

    form.addEventListener('submit', (e)=>{
        e.preventDefault()
        const data = {
            nombre: e.target.nombre.value,
            apellido: e.target.apellido.value,
            ciudad: e.target.ciudad.value
        }
        form.style.display ='none'
        agregarRegisto.style.display = 'block'
        if(e.submitter.dataset.type == 'agregar' && form.nombre.value != '' && form.apellido.value !='' && form.ciudad.value != ''){
            if(form.add.dataset.action == 'actualizar'){   
                const key = parseInt(form.add.dataset.key)
                updateData(data,key)
    
            }else if(form.add.dataset.action == 'add'){
                addData(data)
            }
        }else if(e.submitter.dataset.type != 'cancelar'){
            alert('por favor rellene todos los campos')
            form.style.display= 'flex'
            agregarRegisto.style.display = 'none'
        }
        form.reset()
    })
    table.addEventListener('click',(e)=>{
        if(e.target.dataset.type == 'update'){
            form.add.dataset.action = 'actualizar'
            getData(parseInt(e.target.dataset.key))
        }else if(e.target.dataset.type == 'delete'){
            deleteData(parseInt(e.target.dataset.key))
        }
        
    })
    //readData()
}

console.log('Script socket.js cargado')

    const socket = io()
    console.log('socket.io init')

    socket.on('products', (products) => {

        let table = document.getElementsByClassName('products-tbody')

        if(table.length > 0){

        table[0].innerHTML = ''
        if(products && products.length > 0){

            products.forEach((product) => {
               table[0].innerHTML += '<tr>'+
               '<td>'+product._id+'</td>'+
               '<td>'+product.title+'</td>'+
               '<td>'+product.description+'</td>'+
               '<td>'+product.code+'</td>'+
               '<td>'+product.price+'</td>'+
                '<td>'+product.stock+'</td>'+
                '<td>'+product.category+'</td>'+
                '</tr>'
            })
        }
      }
    });

    /* NEW PRODUCT FORM MESSAGES */
    socket.on('new-product-message', data => {
       console.log('message received from new product')
       if(data.status == true){
        setFormSuccess(data.message)
       }else{
        setFormError(data.message)
       }
    });

    function setFormError(error){
        const errorDescription = document.getElementById("error-description")
        errorDescription.innerHTML = '<p>'+error+'</p>'
    }

    function setFormSuccess(message){
        const successDescription = document.getElementById("success-description")
        successDescription.innerHTML = '<p>'+message+'</p>'
        let form = document.getElementById('new-product-form')
        form.reset()
    }
    /****************** */

    /* DELETE PRODUCT MESSAGES */
    socket.on('delete-product-message', data => {
        console.log('message received from delete')
        if(data.status == true){
         setFormDeleteSuccess(data.message)
        }else{
         setFormDeleteError(data.message)
        }
     });

    function setFormDeleteSuccess(message){
        const successDescription = document.getElementById("success-description-delete")
        successDescription.innerHTML = '<p>'+message+'</p>'
        let form = document.getElementById('new-product-form-delete')
        form.reset()
    }

    function setFormDeleteError(error){
        const errorDescription = document.getElementById("error-description-delete")
        errorDescription.innerHTML = '<p>'+error+'</p>'
    }
    /****************** */

    /*** ADD TO CART MESSAGES */
    socket.on('add-product-message', data => {
        console.log('message received from add product to cart')
         alert(data.message)
     });
    /****************** */

    setTimeout(function() {

        /* NEW PRODUCTO  PRODUCT */
        const submit_new_product = document.getElementById("submit-product")

        if(submit_new_product){

        submit_new_product.addEventListener("click", function(event) {

            event.preventDefault()

            const title = document.getElementById('p-title').value
            const description = document.getElementById('p-description').value
            const code = document.getElementById('p-code').value
            const price = document.getElementById('p-price').value
            const stock = document.getElementById('p-stock').value
            const category = document.getElementById('p-category').value

            /*validation*/
            if(!title || title.length <= 0){
                setFormError('ingrese un titulo')
                return
            }
            if(!description || description.length <= 0){
                setFormError('ingrese una descripción')
                return
            }
            if(!code || code.length <= 0){
                setFormError('ingrese un Código')
                return
            }
            if(!price || price.length < 0){
                setFormError('ingrese un precio')
                return
            }
            if(parseFloat(price) == NaN ){
                setFormError('valor del precio incorrecto')
                return
            }
            if(!stock || stock.length < 0){
                setFormError('ingrese stock')
                return
            }
            if(parseInt(stock) == NaN ){
                setFormError('valor del stock incorrecto')
                return
            }
            if(!category || category.length < 0){
                setFormError('ingrese una categoría')
                return
            }

            const product = {
                title : title,
                description: description,
                code: code,
                price: price,
                status: true,
                stock : stock,
                category: category,
                thumbnails : []
            }

            setFormError('')
            setFormSuccess('')

            socket.emit('new-product',product)


        })

        }

        /************ */
        /* DELETE PRODUCT */
        const submitDelete = document.getElementById("submit-product-delete")

        if(submitDelete){

        submitDelete.addEventListener("click", function(event) {

            event.preventDefault()

            const id = document.getElementById('p-id').value

            if(!id){
                setFormDeleteError('ingrese un ID')
                return
            }
            if(id.length != 24){
                setFormDeleteError('Ingrese un ID correcto')
                return
            }

            setFormDeleteError('')
            setFormDeleteSuccess('')

            socket.emit('delete-product',id)
        })

        }

        /**************** */
        /*** ADD PRODUCT CART */

        const submit_add_product = document.getElementById("submit-add-product")

        if(submit_add_product){

        submit_add_product.addEventListener("click", function(event) {

                event.preventDefault()

                const id = document.getElementById('add-id').value
                const quantity = document.getElementById('add-quantity').value
                const cart_id = document.getElementById("cart-id").value

                /*validation*/
                if(id.length != 24){
                    alert('ingrese un id correcto')
                    return
                }
                if(parseInt(quantity) == NaN ){
                    alert('Ingrese una número')
                    return
                }
                if(!cart_id){
                    alert('No se ha podido encontrar un carrito asociado')
                }

                const add_data = {
                    product_id : id,
                    quantity: quantity,
                    cart_id : cart_id
                }

                socket.emit('add-product',add_data)
            })
        }


        /********** CHAT ************/

        const chat_container = document.getElementById("chat-container")

        if(chat_container){

            let user = ''

                Swal.fire({
                    title: 'Auth',
                    input: 'text',
                    text:'Set email for chat',
                    inputValidator: value => {
                    const re = /\S+@\S+\.\S+/;
                    return !re.test(value) && 'Por favor escribe un Email'
                    },
                    allowOutsideClick : false
                }).then( result => {
                    user = result.value
                    document.querySelector('#username').innerHTML = user
                    getChatMessages(user)

                })

            const input = document.getElementById('chatinput');

            document.querySelector('#chatinput').addEventListener('keyup', (event) => {
                if(event.key === 'Enter') sendMessage(user,event.currentTarget.value)
            })

            document.querySelector('#send').addEventListener('click', (event) => {
                sendMessage(user,input.value)
            })


            function sendMessage(user,message){
                console.log('user: '+user+' send message: '+message)
                if(message.trim().length > 0){
                    socket.emit('message', {
                        user,
                        message
                    })
                }
            }


        socket.on('logs', messages => {
            const box = document.querySelector('#chatbox')

            let html = ''
            if(messages){
                console.log(messages)
                messages.forEach( message => {
                    html += '<p><i style="font-weight:bold;">'+message.user+'</i>: '+message.message+'</p>'
                })
                }
            box.innerHTML = html
            })

        //send message user connected and return all chat messages
        getChatMessages = async (user) => {
            socket.emit('new-user-chat',{user})
        }

    }



    },1500)

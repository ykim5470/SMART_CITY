const socket = io()

const status_button = document.querySelectorAll('.status_btn')
const status_md_id = document.querySelector('.status_md_id')

status_button.forEach((el)=>{el.addEventListener('click', (e) => {
    var status = e.target.value
    console.log(status)
    var md_id = status_md_id.value
    socket.emit('원천 데이터 GET Status', { status, md_id })
})})



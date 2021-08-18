const analysis_select = (socket) =>{
    let al_name_mo_obj = new Object()
    socket.on('분석 모델 선택', (data)=>{
        console.log(data)
        const { model_type, model_namespace, model_version, selected_processed_dataset_id} = data;

    })
}

module.exports = analysis_select
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require("sequelize");
const models = require("./models/index");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const socket = require("socket.io");
const axios = require("axios");
const { model_list, model_output, model_input, atch_file_tb, analysis_list, column_tb } = require("./models");

//routers
const index_router = require("./routes/index");

models.sequelize
	.sync({ force: false })
	.then(() => {
		console.log("DB connected");
	})
	.catch((err) => {
		console.log(`DB connection fail: ${err}`);
	});

dotenv.config();
const app = express();
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
nunjucks.configure("views", {
	express: app,
	watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use("/", index_router);

const server = app.listen(app.get("port"), () => {
	console.log(`http://localhost:${app.get("port")}`);
});

// Socket setup
const io = socket(server, {
	allowEIO3: true, // false by default
});

let user_input_list = new Array();
let al_time_obj = {};
let data_selection_obj = {};
let input_param_obj = {};
let output_param_obj = {}
let al_name_mo_obj = {}
let md_desc = ''


io.on("connection", function (socket) {
	console.log("Made socket connection");
	// console.log(`분석 시간 ${al_time_obj}`);

	socket.on("분석 시간 입력", (data) => {
		const { al_time } = data;
		console.log("분석 시간 :" + al_time);
		al_time_obj = { ...data };
	});

	socket.on("데이터 선택", (data) => {
		const { dataset_info } = data;
		console.log("데이터 선택 : " + dataset_info);
		data_selection_obj = { ...data };
		console.log(data_selection_obj);

		// 선택 된 데이터 API calling; attributes GET
		const attr_get = async () => {
			const input_queries = dataset_info.split(",");
			const input_attr = ["id", "type", "name", "version"];
			const attr_obj = Object.fromEntries(input_attr.map((key, index) => [key, input_queries[index]]));
			const input_items = await axios.get(`http://203.253.128.184:18827/datamodels/${attr_obj.name}/${attr_obj.type}/${attr_obj.version}`, { headers: { Accept: "application/json" } }).then((res) => {
				return res.data;
			});
			return input_items;
		};
		attr_get().then((res) => {
			socket.emit("데이터 선택 완료 및 인풋 calling", res.attributes);
		});
	});

	socket.on('분석 모델 설명', (data) => {
		 md_desc = data
	})

	socket.on("분석 모델 선택", (data) => {
		const { al_name_mo } = data;
		console.log("선택된 분석 모델 이름 : " + al_name_mo); // test1, dataset001, etc
		al_name_mo_obj = {al_name_mo}

		// model_list.create({ al_name_mo: al_name_mo });
		const analysis_output = async () => {
			const analysis_column = await analysis_list.findOne({ where: { al_name: al_name_mo } }).then((res) => {
				const al_list_str = JSON.stringify(res);
				const al_list_value = JSON.parse(al_list_str);
				const al_id = al_list_value.al_id;
				const column_attr = column_tb.findAll({ where: { al_id_col: al_id } }).then((result) => {
					const column_str = JSON.stringify(result);
					const column_value = JSON.parse(column_str);
					return column_value;
				});
				return column_attr;
			});
			return analysis_column;
		};
		analysis_output().then((res) => {
			socket.emit("분석 모델 선택 완료 및 아웃풋 calling", res);
		});
	});

	socket.on("입력 데이터 값", (data) => {
		const { user_input_value } = data;
		user_input_list = [...user_input_value];
		input_param_obj = { ...user_input_list };
	});

	socket.emit("입력 데이터 값 반환",  user_input_list );


	socket.on("데이터 전송 요청", () => {
		const data = { al_time_obj, data_selection_obj, input_param_obj, al_name_mo_obj, md_desc }
		axios.post('http://localhost:3000/model/register/complete', data, { headers: { Accept: "application/json" } })
	});
});

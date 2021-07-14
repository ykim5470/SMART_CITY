const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const models = require("./models/index");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const socket = require("socket.io");
const axios = require("axios");
const { analysis_list, column_tb, model_list, model_input } = require("./models");
const { my_scheduleJob } = require("./public/js/helpers/api_scheduler");
const schedule = require("node-schedule");

//routers
const index_router = require("./routes/index");
const { scheduleJob } = require("node-schedule");

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

let data_selection_obj = {};
let al_name_mo_obj = {};

io.on("connection", function (socket) {
	console.log("Made socket connection");

	// 스케쥴러 조작
	socket.on("모델 스케쥴러 조작", (data) => {
		const { status, md_id } = data;
		model_list.findOne({ where: { md_id: md_id }, attributes: ["al_time", "sub_data", "run_status"], include: [{ model: model_input, required: false }], raw: true }).then((res) => {
			const model_manage_str = JSON.stringify(res);
			const model_manage_value = JSON.parse(model_manage_str);

			const { al_time, sub_data } = model_manage_value;
			// API request Scheduler callback function
			const raw_data_sub_get = async () => {
				var sub_data_list = JSON.parse(sub_data);
				if (typeof sub_data_list == "string") {
					axios
						.get(
							`http://203.253.128.184:18227/temporal/entities/${sub_data_list.slice(
								0,
								-1
							)}?timerel=between&time=2021-06-01T00:00:00+09:00&endtime=2021-06-24T22:00:00+09:00&limit=48&lastN=48&timeproperty=modifiedAt`,
							{ headers: { Accept: "application/json" } }
						)
						.then((result) => console.log("a"));
				} else {
					sub_data_list.filter((el, index) => {
						axios
							.get(
								`http://203.253.128.184:18227/temporal/entities/${el.slice(
									0,
									-1
								)}?timerel=between&time=2021-06-01T00:00:00+09:00&endtime=2021-06-24T22:00:00+09:00&limit=48&lastN=48&timeproperty=modifiedAt`,
								{ headers: { Accept: "application/json" } }
							)
							.then((result) => console.log("b"));
					});
				}
			};
			// scheduler modules
			var is_running = status == "running" ? true : false;
			console.log(model_manage_value["model_inputs.md_id"]);
			my_scheduleJob(`${model_manage_value["model_inputs.md_id"]}`, "Etc/UTC", '* * * * *', raw_data_sub_get, is_running);
		});
	});

	// 데이터 셋 선택
	socket.on("데이터 선택", (data) => {
		const { dataset_info } = data;

		data_selection_obj = { ...data };
		// 선택 된 데이터 개별 센서 데이터 API calling;
		const sub_data_get = async () => {
			const sub_data_queries = dataset_info.split(",");
			const sub_data_attr = ["id", "type", "name", "version"];
			const attr_obj = Object.fromEntries(sub_data_attr.map((key, index) => [key, sub_data_queries[index]]));
			const sub_data = await axios
				.get(`http://203.253.128.184:18227/entities?Type=${attr_obj.name}.${attr_obj.type}:${attr_obj.version}&datasetId=${attr_obj.id}`, { headers: { Accept: "application/json" } })
				.then((res) => {
					return res.data;
				});
			return sub_data;
		};
		sub_data_get().then((res) => {
			// console.log(res);
			socket.emit("데이터 선택 완료 및 개별 센서 데이터 calling", res);
		});

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

	// 선택 된 분석 모델 API calling; attributes GET
	socket.on("분석 모델 선택", (data) => {
		const { al_name_mo } = data;
		al_name_mo_obj = { al_name_mo };

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
});

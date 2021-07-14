const schedule = require("node-schedule");
const parser = require("cron-parser");

const my_scheduleJob = (id, mxTimezones, cron_expression, function_name, cancel) => {
	var options = {
		tz: mxTimezones,
	};
	var cron_attr = cron_expression.split(" ");
	var interval = parser.parseExpression(cron_expression, options);
	var cronDate = interval.next();
	var rule = new schedule.RecurrenceRule();


	let a = cron_expression.toString()
	console.log(a.split(' '))
	console.log('* * * * * *'.split(' '))

	console.log(cron_expression);
	console.log(cron_expression.split(' '))
	// console.log(typeof cron_expression);
	// console.log(cron_attr);
	for (var i in cron_attr) {
		var res = "";
		switch (i) {
			case "0":
				res = getRuleValue(cron_attr[i], 0, 59);
				rule.second = res == "1" ? cronDate.getSeconds() : res;
			case "1":
				res = getRuleValue(cron_attr[i], 0, 59);
				rule.minute = res == "1" ? cronDate.getMinutes() : res;
				break;
			case "2":
				res = getRuleValue(cron_attr[i], 0, 23);
				rule.hour = res == "1" ? cronDate.getHours() : res;
				break;
			case "3":
				res = getRuleValue(cron_attr[i], 1, 31);
				rule.date = res == "1" ? cronDate.getDate() : res;
				break;
			case "4":
				res = getRuleValue(cron_attr[i], 1, 12);
				rule.month = res == "1" ? cronDate.getMonth() : res;
				break;
			case "5":
				res = getRuleValue(cron_attr[i], 0, 6);
				rule.dayOfWeek = res == "1" ? cronDate.getDay() : res;
				break;
		}
	}

	rule.tz = mxTimezones;

	console.log(rule);

	let jobId = String(id);
	if (cancel) {
		schedule.scheduleJob(jobId, rule, () => {
			console.log("스케쥴러 실행");
			console.log("Scheduler test-------");
			function_name();
		});
	} else {
		let jobs = schedule.scheduledJobs;
		// console.log(jobs)
		var running_jobs = jobs[jobId];
		// console.log(running_jobs)
		if (Object.keys(jobs).length === 0 && jobs.constructor === Object) {
			console.log("실행중이던 job 존재하지 않음");
			return;
		} else {
			running_jobs.cancel();
			console.log("실행중이던 job 중지");
		}
	}
};

function getRuleValue(value, start_value, end_value) {
	if (/^[*\d][\/][\d]+$/.test(value)) {
		return new schedule.Range(start_value, end_value, parseInt(value.split("/")[1]));
	} else if (value == "MON-FRI") {
		return new schedule.Range(1, 5);
	} else if (value == "*") {
		return null;
	} else {
		return "1";
	}
}

module.exports = { my_scheduleJob };

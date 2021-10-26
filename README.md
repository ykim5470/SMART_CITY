# VREDU 
## _실시간 분석 모델 서빙 SW_

![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)

실시간 데이터를 이용하여 데이터 분석 파일을 통한 예측 결과를 서빙하는 플랫폼
JavaScript, node.js, MariaDB, HTML, nunjucks, jQuery, Chart.js 

## Features

- TensorFlow를 이용한 데이터 분석 서빙 
- 업로드된 데이터 분석 파일을 JSON으로 변환 후, 데이터 분석
- 실시간 데이터 변화 시각화 대시보드 제공
- 20종의 차트 데이터 비교, 분석 시스템 

SW 개발을 위한 실시간 데이터 제공은 [KETI][df1] (한국 전자 기술 연구원)의 도움을 받았으며,
실시간 데이터 분석 모델은 [제이씨스퀘어][df3] 제공 1 종과 [브이알 에듀][df2] 자체 개발 1종을 차용.


## Tech

실시간 데이터 분석 서빙 SW는 다음의 오픈 소스를 사용하여 진행:

- [MariaDB] - Open source relational databases
- [Twitter Bootstrap] - Great UI boilerplate for modern web apps
- [node.js] - Evented I/O for the backend
- [Express] - Fast node.js network app framework [@tjholowaychuk]
- [nunjucks](https://mozilla.github.io/nunjucks//) - View engine
- [jQuery] - HTML DOM tree traversal and manipulation, as well as event handling, CSS animation, and Ajax.

## Setup
해당 SW는 데이터 분석 서빙을 위한 TensorFlow 설치를 실행 전에 마쳐야 한다. 
필수 모듈로는 TensorFlow, TensorFlow.js, TensorFlow.js Converter, Python 등이 있다. 
해당 모듈의 버전은 [requirements.txt] 참조

## Installation

실시간 분석 모델 서빙 SW는 실행을 위해 [Node.js] 필요.

서버 시작을 위해 dependencies 와 devDependencies 설치 및 시작. 

개발 모드
```sh
npm i
npm run dev
```

서비스 모드

```sh
npm install
npm start
```

## License

VREDU

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [df1]: <https://www.keti.re.kr/main/main.php/>
   [df2]: <https://vreducation.kr/>
   [df3]: <https://www.jc-square.com/>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [MariaDB]: <https://mariadb.org/>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>

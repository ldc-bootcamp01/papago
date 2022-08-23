// Node.js, Express FW를 활용하여 간단한 Backend 서버 구성

const express = require('express'); // express 패키지 import

const app = express();

// const clientId = 'lH4zVB6hCF3dqUZfgWjO';
// const clientSecret = '5V9PRmwcaQ';
const dotenv = require('dotenv');
dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const request = require('request');

// express의 static 미들웨어 활용해서 public폴더의 파일들 불러오기
app.use(express.static('public')); // express 한테 static 파일들의 경로가 어디에 있는지 명시

// express의 json 미들웨어 활용
app.use(express.json());


// 일반적으로 /를 root경로 라고 함
// root url: 127.0/0/1:3000/
// IP 주소: 127.0.0.1, Port: 3000
// 127.0.0.1의 Domain name: localhost -> http://localhost:3000/

// app.get() -> 첫번째 인수로 지정한 경로로 클라이언트로부터 요청 (request)가 들어왔을때,
// 두번째 인수로 작성된 콜백함수가 호출되면서 동작함
// 그 콜백함수는 두개의 인수(arguments) 를 받음, 1. request, 2. response
app.get('/', (req, res) => {
    // res.send('응답 완료!');
    // root url, 즉 메인 페이지로 접속했을때, 우리가 만든 Node서버는 
    // papago의 메인 화면인 public/index.html 을 응답해줘야 함
    res.sendFile('index.html');
});

// localhost:3000/detectLangs 경로로 요청했을때
app.post('/detectLangs', (req, res) => {
    console.log('/detectLangs로 요청됨');

    // xhr 으로 전송된 데이터 받아오기
    // Servlet에서 request.getParameter("name"); 과 비슷한 원리
    console.log(req.body);

    // text 프로퍼티에 있는 값을 query라는 이름의 변수에 담고, 
    // target 은 targetLanguage으로 담기
    const { text: query, target: targetLanguage } = req.body;
    console.log(query, targetLanguage);

    // 실제 papago 서버에 요청 전송
    const url = 'https://openapi.naver.com/v1/papago/detectLangs'; // 택배 보낼 주소
    const options = { // options: 택배를 보낼 물건
        url, // url: url 자동완성
        form: {'query': query},
        headers: {
            'X-Naver-Client-Id': clientId, 
            'X-Naver-Client-Secret': clientSecret
        }
    };

    // 실제 언어감지 서비스 요청 부분
    // options 변수에 요청 전송시 필요한 데이터 및 보낼 주소를 동봉한다 (enclose)
    // 콜백함수: 요청에 따른 응답 정보를 확인하는 부분
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            console.log(body);
            // body 가 JSON이므로 parsing 해주기
            const parsedData = JSON.parse(body);

            //papago 번역 url('/translate')으로 redirect(요청 재지정)
            res.redirect(`translate?source=${parsedData['langCode']}&target=${targetLanguage}&text=${query}`)
        } else {
            console.log('error = ' + response.statusCode);
        }
    });

});

// papago 번역 요청 부분
app.get('/translate', (req, res) => {
    const url = 'https://openapi.naver.com/v1/papago/n2mt';
    console.log(req.query);

    const { source, target, text } = req.query;

    // 실제 papago 서버에 요청 전송
    const options = {
        url,
        form: {'source': source, 'target': target, 'text': text},
        headers: {
            'X-Naver-Client-Id': clientId, 
            'X-Naver-Client-Secret': clientSecret
        }
    };

    // 실제 번역 서비스 요청 부분
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            // body 가 JSON이므로 parsing 해주기
            const parsedData = JSON.parse(body);
            console.log(parsedData);

            // front 에 대항하는 app.js에 papago로부터 받은 응답 데이터(body)를
            // json 형태로 stringify 해서 전송시켜줌
            res.json(parsedData); 

            // 그냥 데이터를 넘길려면
            // res.send(body);
        } else {
            console.log('error = ' + response.statusCode);
        }
    });

});

// 서버가 실행되었을때 몇번 포트에서 실행시킬지 지정
app.listen(3000, () => console.log('http://127.0.0.1:3000/ app listening on port 3000'));

// Node.js 기반의 js파일 실행 시에는 node 로 시작하는 명령어에 파일명까지 작성하면 됨
// ex) node server.js
// 이 맥락에서는 server.js는 express fw로 구성한 백엔드 서버 실행코드가 담겨있음

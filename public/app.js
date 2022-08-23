// const { text } = require("body-parser");

const textAreaArray = document.getElementsByClassName('Card__body__content');

// 변수 네이밍 컨벤션, 도메인과 관련된 용어를 미리 정의
// source: 번역할 텍스트와 관련된 명칭(안녕하세요를 번역하고 싶으면, 안녕하세요가 source)
// target: 번역된 결과와 관련된 명칭

const [sourceTextArea, targetTextArea] = textAreaArray;

const [sourceSelect, targetSelect] = document.getElementsByClassName('form-select');

// 번역하고자 하는 언어의 타입 (ko? en? ja?)
let targetLanguage = 'en';

// 어떤 언어로 번역할지 선택하는
// target selectbox의 선택지의 값이 바뀔때마다 이벤트를 발생하도록,
// 지정한 언어의 타입 값을 targetLangue 변수에 할당, 출력
targetSelect.addEventListener('change', () => {
    // console.dir(targetSelect); 

    // const index = targetSelect.selectedIndex;
    // targetLanguage = (index !== 1) ? ((index === 2) ? 'en': 'ja') : 'ko';
    
    targetLanguage = targetSelect.value;

    console.log(targetLanguage);
});

let sourceText = '';
let debouncer;
// keyup, keydown, change, input
sourceTextArea.addEventListener('input', (event) => {
    // console.dir(event);
    
    // if debouncer != null
    if(debouncer) {
        clearTimeout(debouncer);
    }

    // setTimeout (콜백함수, 지연시킬 시간 (ms))
    // timer id 값을 반환해준다.
    debouncer = setTimeout(() => {
        sourceText = event.target.value;
        console.log(sourceText);

        // 입력된 텍스트 요청 전송
        const xhr = new XMLHttpRequest();
        const url = '/detectLangs'; // node 서버의 특정 url 주소
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // 최종적으로 papago가 번역해준 번역된 텍스트 결과를 받는 부분
                // 서버의 응답 결과 확인하는 부분
                console.log(xhr.responseText);
                const parsedData = JSON.parse(xhr.responseText);

                const result = parsedData.message.result;

                targetTextArea.value = result.translatedText;

                const options = sourceSelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === result.srcLangType) {
                        sourceSelect.selectedIndex = i;
                    }

                    // if (options[i].value === result.srcLangType) {
                    //     options[i].selected = true;
                    // } else {
                    //     options[i].selected = false;
                    // }
                }
            }
        };

        // 요청 준비
        xhr.open('POST', url);

        // 요청 보낼때 동봉할 객체(object)
        const requestData = {
            text: sourceText,
            target: targetLanguage,
            
        };

        // 클라이언트가 서버에게 보내는 요청 데이터의 형식이 json 형식임을 명시
        xhr.setRequestHeader('Content-type', 'application/json'); // header: 제품의 설명서

        // 보내기 전에 JS object를 JSON으로 변환 (직렬화)
        const jsonData = JSON.stringify(requestData);

        // 실제 요청 전송
        xhr.send(jsonData);

    }, 3000);
});
// Express 및 Nunjucks 불러오기
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
//app.set(잘 모르겠음)
app.set('view engine', 'html');
nunjucks.configure('../html', { express: app });

//________________________________________________________________________________________________
// 루트 경로(/)에 대한 요청 처리
app.get('/', function (req, res) {
  res.render('index.html');
});

// 게시글 목록 조회(/board/list)에 대한 요청 처리
let numbering = 5;
let list = [
    { subject: '안녕하세요', username: 'podo', date: '2022-02-03', num: 1 },
    { subject: '안녕하세요2', username: 'podo2', date: '2022-02-03', num: 2 },
    { subject: '안녕하세요3', username: 'podo3', date: '2022-02-03', num: 3 },
    { subject: '안녕하세요4', username: 'podo4', date: '2022-02-03', num: 4 },
    { subject: '안녕하세요5', username: 'podo5', date: '2022-02-03', num: 5 }
];
app.get('/board/list', (req, res) => {
    res.render('Board_List.html', { content: list });
});

// 게시글 작성 폼 요청 처리(/board/write)에 대한 GET 및 POST 핸들러
app.use(express.urlencoded({ extended: true }));
app.get('/board/write', function (req, res) {
    res.render('Board_Write.html');
});
app.post('/board/write', (req, res) => {
    let board = { ...req.body };
    let allWrited = board['subject'] && board['username'] && board['date'];
    if (allWrited) {
        list.push(board);
        listreIndex(list);
        res.redirect('/board/list');
    } else {
        res.send("<script>alert('모든 빈칸을 채우세요');location.href='/board/write';</script>");
    }
});

var index

// 게시글 수정 폼 요청 처리(/board/reWrite/:index)에 대한 GET 및 POST 핸들러
app.get('/board/reWrite/:index', function (req, res) {
    index = req.params;
    const board = list[index];
    res.render('Board_reWrite.html', { board });
});

app.post('/board/reWrite/:index', (req, res) => {
    console.log(index['index'])
    const ind = parseInt(index['index']) - 1
    const board = { ...req.body };
    let allWrited = board['subject'] && board['username'] && board['date'];
    if (allWrited) {
        console.log(board)
        list.splice(ind,1,board)
        listreIndex(list)
        console.log(list)

        res.redirect('/board/list');
    } else {
        res.send("<script>alert('모든 빈칸을 채우세요');location.href='/board/reWrite/" + index + "';</script>");
    }
});

// 게시글 삭제(/delete/:num)에 대한 요청 처리
app.get('/delete/:num', (req, res) => {
    const num = req.params.num;
    const index = parseInt(num[1]) - 1;
    list.splice(index, 1);
    if (numbering > 0) {
        numbering--;
    }
    listreIndex(list);
    res.redirect('/board/list');
});

// 게시글 보기(/board/view)에 대한 요청 처리
app.get('/board/view', (req, res) => {
    console.log(list);
    res.render('Board_View.html');
});

// 숫자를 재 배열하는 함수
function listreIndex(list) {
    for (let i = 0; i < list.length; i++) {
        list[i]['num'] = i + 1;
    }
    console.log('재배열한 값은\n');
}

// 서버 리스닝
app.listen(30000);

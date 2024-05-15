// Express 및 Nunjucks 불러오기
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const mysql = require("mysql2");
const bodyParser = require('body-parser');
const session = require('express-session');

app.set('view engine', 'html'); //app.set(잘 모르겠음)
nunjucks.configure('html', { express: app });


//미들웨어 내가 잘 모르는 부분
app.use(express.static('public'));//이거 안하면 localhost에서 css 처리가 안됨

app.use(express.urlencoded({ extended: true })); // 게시글 작성 폼 요청 처리(/board/write)에 대한 GET 및 POST 핸들러

app.use(express.json()); //json 파싱을 위한 미들웨어

app.use(bodyParser.urlencoded({ extended: true })); //bodyparser 미들웨어 설정
app.use(bodyParser.json());

// 세션 미들웨어 설정
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));


//________________________________________________________________________________________________

// 미들웨어 함수를 작성하여 로그인 상태를 확인하는 함수
function requireLogin(req, res, next) {
    // 로그인 여부를 확인하는 코드 (여기서는 단순히 세션 또는 쿠키 등을 통해 로그인 여부를 확인할 수 있음)
    const isLoggedIn = req.session.isLoggedIn; // 예시로 세션을 사용하여 로그인 상태를 확인

    // 로그인이 되어있지 않은 경우 로그인 화면으로 리다이렉트
    if (!isLoggedIn) {
        return res.redirect('/login');
    }

    // 로그인이 되어있는 경우 다음 미들웨어로 이동
    next();
}


// sql 에 접속, 연결설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // 입력할것
  database: 'test'
});

//sql 연결시도
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

let numbering = 5;
let list = [
    { subject: '안녕하세요', username: 'podo', date: '2022-02-03', num: 1 },
    { subject: '안녕하세요2', username: 'podo2', date: '2022-02-03', num: 2 },
    { subject: '안녕하세요3', username: 'podo3', date: '2022-02-03', num: 3 },
    { subject: '안녕하세요4', username: 'podo4', date: '2022-02-03', num: 4 },
    { subject: '안녕하세요5', username: 'podo5', date: '2022-02-03', num: 5 }
];


// db값 초기화
list.forEach((item, i) => {
  connection.query('INSERT INTO 게시글 SET ?', item, (error, results, fields) => {
    if (error) {
      console.error('Error creating record:', error);
      return;
    }
    console.log('New record inserted:', results);
  });
});

// 루트 경로(/)에 대한 요청 처리
app.get('/', requireLogin, function (req, res) {
  res.render('index.html');
});


//list
app.get('/board/list', requireLogin, (req, res) => {
    console.log(list)

    //모든 데이터베이스 조회
    connection.query('SELECT * FROM 게시글 where *', (error, results, fields) => {
      if (error) {
        console.error('Error selecting records:', error); //에러메시지
        return;
      }
      console.log('db 값은:', results); //결과 콘솔로 찍기
    });

    res.render('Board_List.html', { content: list });
});


//view
app.get('/board/view/:id', requireLogin, (req, res) => {
    var { id } = req.params
    id--;
    //데이터베이스 조회
    connection.query('SELECT * FROM 게시글 where ?', id+1 , (error, results, fields) => {
      if (error) {
        console.error('Error selecting records:', error); //에러메시지
        return;
      }
      console.log('db 값은:', results); //결과 콘솔로 찍기
    });
    //파일열기
    res.render('Board_View.html', { content: list[id] });
});



//write
app.get('/board/write', requireLogin, function (req, res) {
    res.render('Board_Write.html');
});
app.post('/board/write', (req, res) => {
    let board = { ...req.body };
    let allWrited = board['subject'] && board['username'] && board['date'];
    if (allWrited) {
        list.push(board);
        listreIndex(list);
        return res.redirect('/board/list');
    } else {
        return res.send("<script>alert('모든 빈칸을 채우세요');location.href='/board/write';</script>");
    }

    const { subject, username, date } = req.body;
    const newRecord = { subject, username, date };
    //db에 데이터 넣기
    connection.query('INSERT INTO 게시글 SET ?', newRecord, (error, results, fields) => {
    if (error) {
      console.error('Error creating record:', error);
      return res.status(500).json({ error: 'Error creating record' });
    }
    console.log('New record inserted:', results);
    //res.json({ message: 'Record created successfully' });
     });
});


//rewrite
var index;

app.get('/board/reWrite/:index', requireLogin, function (req, res) {
    index = req.params;
    console.log(index)
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
        //db에 업데이트
        connection.query('UPDATE 게시글 SET subject = board[\'subject\'], username = board[\'username\'], date = board[\'date\'] WHERE name = ?', [index['index']], (error, results, fields) => {
              if (error) {
                console.error('Error updating record:', error);
                return;
              }
              console.log('Record updated:', results);
        });

        //사이트로 연결
        return res.redirect('/board/list');
    } else {
        return res.send("<script>alert('모든 빈칸을 채우세요');location.href='/board/reWrite/" + ind + "';</script>");
    }
});

// 게시글 삭제(/delete/:num)에 대한 요청 처리
app.get('/delete/:num', requireLogin, (req, res) => {
    const num = req.params.num;
    const index = parseInt(num) - 1;
    list.splice(index, 1);
    if (numbering > 0) {
        numbering--;
    }
    listreIndex(list);

    //db에서 데이터 삭제
    connection.query('DELETE FROM 게시글 WHERE num = ?', num , (error, results, fields) => {
      if (error) {
        console.error('Error deleting row:', error);
        return;
      }
      console.log('Row deleted:', results);
    });



    res.redirect('/board/list');





});

// 게시글 보기(/board/view)에 대한 요청 처리
app.get('/board/view', requireLogin, (req, res) => {
    console.log(list);
    res.render('Board_View.html');
});

// 숫자를 재 배열하는 함수
function listreIndex(list) {
    for (let i = 0; i < list.length; i++) {
        list[i]['num'] = i + 1;
    }
    console.log('재배열한 값은');
}
//-----------------------------------------------------------------
//회원가입 로그인 로그아웃
//-----------------------------------------------------------------

// 회원가입 페이지 보기
app.get('/signup', (req, res) => {
    res.render('signup.html');
});

// 로그인 페이지 보기
app.get('/login', (req, res) => {
    res.render('login.html');
});

// 로그아웃
app.get('/logout',(req,res)=>{
    req.session.isLoggedIn = false;
    req.session.user = 0;
    res.redirect('/login');
})

// 회원가입 요청 처리
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // 사용자 정보를 데이터베이스에 저장하는 쿼리 실행
  connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (error, results, fields) => {
    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Error creating user' });
    }
    console.log('User created:', results);
    res.redirect('/login');
  });
});

// 로그인 요청 처리
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // 이메일과 비밀번호를 사용하여 사용자를 인증하는 쿼리 실행
  connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results, fields) => {
    if (error) {
      console.error('Error selecting user:', error)
      return res.send("<script>alert('없는회원입니다');location.href='/login';</script>");
    }
    if (results.length === 0) {
      return res.send("<script>alert('없는회원입니다');location.href='/login';</script>");
    }
    // 로그인 성공, 세션에 로그인 상태 저장
    req.session.isLoggedIn = true;
    req.session.user = results[0]; // 필요한 경우 사용자 정보를 세션에 저장
    res.redirect('/');
  });
});








// 서버 리스닝
app.listen(30000);

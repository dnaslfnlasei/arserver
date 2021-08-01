//express 라이브러리 첨부와 사용
const express =require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')


app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

require('dotenv').config()

var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function(에러, client){
	if (에러) return console.log(에러)
	db = client.db('AR_server');
	
	// db.collection('contents').insertOne({이름 : '홍길동', }, function(에러, 결과){
	// 	console.log('저장완료');
	// });
	
	// 원하는 포트에 서버를 오픈
	app.listen(process.env.PORT, function(){
		console.log('listening on 8080') 
	});
	
})

function  로그인했니(요청, 응답, next){
	if (요청.user){
		next()
	} else {
		응답.send('로그인안하셨는데요??')
	}
}


// npm install multer
let multer = require('multer');
var storage = multer.diskStorage({
	destination : function(req, file, cb){
		cb(null, './NFT-Marker-Creator/imagefolder')
	},
	filename : function(req, file, cb){
		cb(null, file.originalname)
	},
	filefilter : function(req, file, cb){
		
	}
	
});

var iupload = multer({storage : storage});


app.get('/main', function(요청, 응답){
	응답.sendFile(__dirname + '/testimage.png')
});

// sendFile() 함수는 파일 보내는것
// __dirnam은 현재 파일의 경로
app.get('/', function(요청, 응답){
	응답.sendFile(__dirname + '/main.html')
});

app.get('/add_user', function(요청, 응답){
	응답.sendFile(__dirname + '/add_user.html')
});

app.get('/list',function(요청, 응답){
	// console.log(요청.user);
		db.collection('user').find().toArray(function(에러, 결과){
		// console.log(결과)
		응답.render('list.ejs',{user : 결과, 사용자 : 요청.user})
	})
});

app.get('/search', (요청, 응답)=>{
  console.log(요청.query);
  db.collection('user').find({이름 : 요청.query.value}).toArray((에러, 결과)=>{
    console.log(결과)
	응답.render('search.ejs', {user : 결과})
  })
})

app.get('/test', function(요청, 응답){
	응답.sendFile(__dirname + '/flyer-threejs/index.html')
});

app.get('/testjs', function(요청, 응답){
	db.collection('user').find().toArray(function(에러, 결과){
	응답.render('/flyer-threejs/index.js',{user : 결과, 사용자 : 요청.user});
	})
});

// app.get('/testjs',function(요청, 응답){
// 	// console.log(요청.user);
// 		db.collection('user').find().toArray(function(에러, 결과){
// 		// console.log(결과)
// 		응답.render('/flyer-threejs/index.js',{user : 결과, 사용자 : 요청.user})
// 	})
// });


app.get('/testcss', function(요청, 응답){
	응답.sendFile(__dirname + '/flyer-threejs/index.css')
});

app.delete('/delete', function(요청, 응답){
	요청.body._id = parseInt(요청.body._id);
	db.collection('user').deleteOne(요청.body, function(에러, 결과){
		console.log('삭제완료')
	})
	응답.send('삭제완료')
});

app.post('/upload', function(요청, 응답){
	// console.log(요청.user_name)
	// console.log(요청.show_time)
	// console.log(요청.show_format)
	db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
		var 총게시물갯수 = 결과.totalPost;
		
		db.collection('user').insertOne({_id : 총게시물갯수 +1, 이름 : 요청.body.user_name, 영상길이 : 요청.body.show_time  , 영상포맷 : 요청.body.show_format, 날짜 : new Date() }, function(에러, 결과){
			db.collection('counter').updateOne({name:'게시물갯수'}, { $inc: {totalPost:1} },function(에러, 결과){
				if(에러){return console.log(에러)}
				// console.log('저장 완료')
				// 응답.send('업로드 완료');
				응답.redirect('/list')
			})
		});
	});
});


// /detail로 접속하면 detail.ejs 보여줌
app.get('/detail/:id', function(요청, 응답){
	db.collection('user').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
		console.log(결과);
		응답.render('detail.ejs',{user : 결과, 사용자 : 요청.user});
	})

})

app.get('/tdetail/:id', function(요청, 응답){
	db.collection('user').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
		console.log(결과);
		응답.render('tdetail.ejs',{user : 결과, 사용자 : 요청.user});
	})

})

app.get('/edit/:id', function(요청, 응답){
	db.collection('user').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
		// console.log(결과);
		응답.render('edit.ejs', { user : 결과})
	})
})

app.put('/edit', function(요청, 응답){
	//폼에 담긴 제목데이터, 
	db.collection('user').updateOne({ _id : parseInt(요청.body.id) },{ $set : { 이름 : 요청.body.user_name , 영상길이 : 요청.body.show_time, 영상포맷 : 요청.body.show_format, 날짜 : new Date()}}, function(에러, 결과) {
		console.log('수정완료')
		응답.redirect('/list')
	});
})


//  npm install passport passport-local express-session
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(요청,응답){
	응답.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
	failureRedirect : '/fail'
}), function(요청,응답){
	응답.redirect('/')
});

app.get('/mypage', 로그인했니, function(요청, 응답){
	console.log(요청.user);
	응답.render('mypage.ejs', {사용자 : 요청.user})
})

app.get('/logout', function(요청,응답){
	logout()
})


passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
	  
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function(user, done){
	done(null, user.id)
});


passport.deserializeUser(function(아이디, done){
	db.collection('login').findOne({id : 아이디}, function(에러, 결과){
		done(null, 결과)
	})
	// db에서 위에있는 user.id로 유저를 찾은 뒤에 유정 정보를 넣음

});

app.use('/', require('./routes/shop'));

app.get('/NFT', function(요청, 응답){
		응답.render('https://carnaux.github.io/NFT-Marker-Creator/#/')
});

// 이미지 업로드
app.get('/iupload', function(요청, 응답){
	응답.render('iupload.ejs')
});

// 1개만 업로드할때
app.post('/iupload', iupload.single('프로필'), function(요청, 응답){
	// 응답.send('사진업로드 완료')
	응답.redirect('/list')
});

// 여려개 업로드할때
// app.post('/iupload', iupload.array('프로필', 2), function(요청, 응답){
// 	응답.send('사진업로드 완료')
// });

// app.get('/image/:imageName', function(요청,응답){
// 	응답.sendFile(__dirname + '/public/image/' + 요청.params.imageName)
// })

app.get('/imagefolder/:imageName', function(요청,응답){
	응답.sendFile(__dirname + '/NFT-Marker-Creator/imagefolder/' + 요청.params.imageName)
})

app.get('/output/:nftName',function(요청, 응답){
	응답.sendFile(__dirname + '/NFT-Marker-Creator/output/' + 요청.params.nftName)
})

app.get('/video/:videoName', function(요청, 응답){
	응답.sendFile(__dirname + '/video/' + 요청.params.videoName)
})

app.get('/targets/:targetName', function(요청, 응답){
	응답.sendFile(__dirname + '/targets/' + 요청.params.targetName)
})

app.get('/targetvideo/:targetvideoName', function(요청, 응답){
	응답.sendFile(__dirname + '/targetvideo/' + 요청.params.targetvideoName)
})


var router = require('express').Router();

router.get('/shirts', function(요청, 응답){
	응답.send('셔츠파는페이지입니다.');
});

router.get('/pants', function(요청, 응답){
	응답.send('바지파는페이지입니다.');
});	   

module.exports = router;
var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Article = require('../app/controllers/article')
var Comment = require('../app/controllers/comment')
var Category = require('../app/controllers/category')

var multipart = require('connect-multiparty')
var multipartMiddleware = multipart()

module.exports = function(app) {

  // pre handle user
  app.use(function(req, res, next) {
    var _user = req.session.user

    app.locals.user = _user

    next()
  })

  // Index
  app.get('/', Index.index)

  //About
  app.get('/about', Index.about)
  // User
  app.post('/user/signup', User.signup)
  app.post('/user/signin', User.signin)
  app.get('/signin', User.showSignin)
  app.get('/signup', User.showSignup)
  app.get('/logout', User.logout)
  app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)

  // Article
  app.get('/article/:id', Article.detail)
  app.get('/admin/article/new', User.signinRequired, User.adminRequired, Article.new)
  app.get('/admin/article/update/:id', User.signinRequired, User.adminRequired, Article.update)
  app.post('/admin/article', multipartMiddleware, User.signinRequired, User.adminRequired, Article.savePoster, Article.save)
  app.get('/admin/article/list', User.signinRequired, User.adminRequired, Article.list)
  app.delete('/admin/article/list', User.signinRequired, User.adminRequired, Article.del)

  // Comment
  app.post('/user/comment', User.signinRequired, Comment.save)

  // Category
  app.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new)
  app.post('/admin/category', User.signinRequired, User.adminRequired, Category.save)
  app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)

  // results
  app.get('/results', Index.search)
}